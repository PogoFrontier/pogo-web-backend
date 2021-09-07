import e, { request } from "express";
import { firestore } from "../firestore/firestore";
import {protect, generateToken} from '../actions/api_utils';

const router = e.Router();
 
// @desc Auth user and get token
// @route GET /api/users/signin/:id
// @access Public
router.get('/signin/:id', async (req, res) => {
    try{
        const docRef = firestore.collection('users').doc(req.params.id);
        docRef.get().then(user => {
            if(user.data()){
                docRef.update({lastLogin: Date.now()}).then(() => {
                    res.json({
                        userData: user.data(),
                        token: generateToken(req.params.id)
                    });
                });
            }else{
                res.json({error: `User not found.`})
            }
        }).catch(err => {
            console.log(err);
            res.sendStatus(500)
        })
    }catch(err){
        console.log(err);
        res.sendStatus(500)
    }
});

// @desc Get user profile via token
// @route GET /api/users/profile
// @access Protected
router.get('/profile', 
    async (req, res, next) => protect(req, res, next), 
    async (req: any, res) => {
    try{
        const docRef = firestore.collection('users').doc(req.user.googleId);
        docRef.get().then(user => {
            if(user.data()){
                docRef.update({lastLogin: Date.now()}).then(() => {
                    res.json(user.data());
                });
            }else{
                res.sendStatus(404)
            }
        }).catch(err => {
            console.log(err);
            res.sendStatus(500)
        })
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

// @desc Post a new user connected to a google account
// @route POST /api/users
// @access Public
router.post('/', async (req, res) => {
    try{
        const {userAuth, username, teams} = req.body;
        if(userAuth){
            //check if user already exists first
            const docRef = firestore.collection('users').doc(userAuth.uid);
            docRef.get().then(user => {
                if(user.data()){
                    res.sendStatus(401)
                }else{
                    const un = username ? username : userAuth.displayName //.sanitize
                    docRef.set({
                        googleId: userAuth.uid,
                        username: un,
                        usernameNCS: un.toLowerCase(),
                        email: userAuth.email,
                        teams: teams ? teams : [],
                        friends: [],
                        requests: [],
                        challenges: [],
                        pendingChallenge: "",
                        rank: 0,
                        achievements: [],
                        battleBackground: 'default',
                        profilePic: 'default',
                        favorite: null,
                        createdAt: Date.now(),
                        lastLogin: Date.now(),
                        isDeleted: false
                    }).then(() => {
                        docRef.get().then(userDoc => {
                            if(userDoc && userDoc.data()){
                                res.json({
                                    userData: userDoc.data(),
                                    token: generateToken(userAuth.uid)
                                });
                            }else{
                                res.sendStatus(500)
                            }
                        });
                    });
                }
            });
        }else{
            return;
        }
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
})

// @desc Update a users teams, validate with token
// @route POST /api/users/setteams
// @access Protected
router.post('/setteams',
    (req, res, next) => protect(req, res, next),
    (req: any, res) => {
        const { teams } = req.body;
        if (teams) {
            try {
                const docRef = firestore.collection('users').doc(req.user.googleId);
                docRef.get().then(user => {
                    if (user.data()) {
                        docRef.update({ teams: teams }).then(() => {
                            res.json(user.data());
                        }).catch(err => {
                            console.log(err);
                            res.sendStatus(500);
                        });
                    } else {
                        res.sendStatus(404)
                    }
                }).catch(err => {
                    console.log(err);
                    res.sendStatus(500);
                })
            } catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        }
    }
)

// @desc Update a users username, validate with token
// @route POST /api/users/username
// @access Protected
router.post('/username',
    (req, res, next) => protect(req, res, next),
    (req: any, res) => {
        const { username } = req.body;
        if (username) {
            try {
                firestore.collection('users').where("username", "==", username).get().
                    then((duplicate) => {
                        if(!duplicate.empty) {
                            res.sendStatus(409);
                            return;
                        }

                        const docRef = firestore.collection('users').doc(req.user.googleId);
                        docRef.get().then(user => {
                            if (user.data()) {
                                docRef.update({ username: username }).then((writeResult) => {
                                    res.json({...user.data(), username: username});
                                }).catch(err => {
                                    console.log(err);
                                    res.sendStatus(500);
                                });
                            } else {
                                res.sendStatus(404);
                            }
                        }).catch(err => {
                            console.log(err);
                            res.sendStatus(500);
                        })
                    }).catch(err => {
                        console.log(err);
                        res.sendStatus(500);
                    });
            } catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        }
    }
)

// @desc Get data for all friends in a user's friend list
// @route GET /api/users/friends
// @access Protected
router.get('/friends', 
    (req, res, next) => protect(req, res, next),
    (req: any, res) => {
        const collRef = firestore.collection('users');
        collRef.where('friends', 'array-contains', req.user.googleId)
        .select("username", "lastLogin").get().then(querySnapshot => {
            if(querySnapshot.size > 0)
                res.json(querySnapshot.docs.map(doc => doc.data()));
            else
                res.json([]);
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    }
)

// @desc Find out if a friend request is possible
// @route POST /api/users/request/possible/:username
// @access Protected
router.get('/request/possible/:username',
    (req, res, next) => protect(req, res, next),
    (req: any, res) => {
        if (!!req.params.username) {
            try {
                const friendDocRef = firestore.collection('users').where("username", "==", req.params.username)
                friendDocRef.get().then((friendToUpdate) => {
                    if (!friendToUpdate.empty) {
                        let index0 = true
                        friendToUpdate.forEach((newFriendMaybe) => {
                            if(!index0) {
                                return
                            }
                            index0 = false
                            if (!newFriendMaybe.data().requests?.map((r: any) => r.id).includes(req.user.googleId)) {
                                firestore.collection('users').doc(req.user.googleId).get().then(sender => {
                                    if (sender.data()?.requests?.map((r: any) => r.id).includes(newFriendMaybe.id)) {
                                        res.sendStatus(409)
                                        return
                                    }
                                    res.sendStatus(200);
                                }).catch(err => {
                                    console.log(err);
                                    res.sendStatus(500);
                                })
                            } else {
                                //return err, request already exists
                                res.sendStatus(403);
                            }
                        })
                    } else {
                        res.sendStatus(404);
                    }
                }).catch(err => {
                    console.log(err);
                    res.sendStatus(500);
                })
            } catch (err) {
                console.log(err);
                res.sendStatus(400);
            }
        }
    }
)

// @desc Send friend request to a user
// @route POST /api/users/request/send
// @access Protected
router.post('/request/send', 
    (req, res, next) => protect(req, res, next),
    (req: any, res) => {
        if(!!req.body.username){
            try{
                // Get user with this name
                const friendDocRef = firestore.collection('users').where("username", "==", req.body.username)
                friendDocRef.get().then((friendToUpdate) => {

                    // Check if we can send a friend request
                    if (!friendToUpdate.empty) {
                        friendToUpdate.forEach((newFriendMaybe) => {
                            let requests = newFriendMaybe.data().requests
                            if (!requests) {
                                requests = []
                            }
                            if (!requests.map((r: any) => r.id).includes(req.user.googleId)) {
                                firestore.collection('users').doc(req.user.googleId).get().then(sender => {
                                    if(sender.data()?.requests?.map((r: any) => r.id).includes(newFriendMaybe.id)) {
                                        res.sendStatus(409)
                                        return
                                    }
                                    if (!sender.data()?.username) {
                                        res.sendStatus(401)
                                        return
                                    }

                                    // Send friend request
                                    firestore.collection('users').doc(newFriendMaybe.id).update({
                                        requests: [...requests, { id: req.user.googleId, username: sender.data()?.username}]
                                    }).then(() => {
                                        res.sendStatus(200);
                                    }).catch((err: Error) => {
                                        console.log(err);
                                        res.sendStatus(500);
                                    });
                                }).catch(err => {
                                    console.log(err);
                                    res.sendStatus(500);
                                })
                            } else {
                                //return err, request already exists
                                res.sendStatus(403);
                            }
                        })
                    } else {
                        console.log("User not found");
                        res.sendStatus(400);
                    }
                }).catch(err => {
                    console.log(err);
                    res.sendStatus(500);
                })
            }catch(err){
                console.log(err);
                res.sendStatus(400);
            }
        }
    }
)

//might still be a case where they both sent request to each other

// @desc Accept friend request: delete request and add friend to both user's lists
// @route POST /api/users/request/accept
// @access Protected
router.post('/request/accept', 
    (req, res, next) => protect(req, res, next),
    (req: any, res) => {
        if(!!req.body.googleId){
            const userID = req.user.googleId;
            const friendID = req.body.googleId;
            try{
                const userDocRef = firestore.collection('users').doc(userID)
                const friendDocRef = firestore.collection('users').doc(friendID)
                userDocRef.get().then((userToUpdate: any) => {
                    if(userToUpdate.data()){
                        friendDocRef.get().then((friendToUpdate: any) => {
                            if (friendToUpdate.data()) {
                                const usersRequests: { id: string, username: string }[] = userToUpdate.data().requests || [];
                                const usersFriends: string[] = userToUpdate.data().friends || [];
                                const friendsList: string[] = friendToUpdate.data().friends || [];
                                const reqIndex = usersRequests.map(r => r.id).indexOf(req.body.googleId)
                                if(
                                    reqIndex !== -1 && 
                                    !usersFriends.includes(friendID) &&
                                    !friendsList.includes(userID)
                                ) {
                                    usersRequests.splice(reqIndex, 1)
                                    userDocRef.update({
                                        requests: usersRequests,
                                        friends: [...usersFriends, friendID]
                                    }).then(() => {
                                        console.log('updated users friend list');
                                        friendDocRef.update({
                                            friends: [...friendsList, userID]
                                        }).then(() => {
                                            console.log('updated friends friend list');
                                            res.sendStatus(200);
                                        }).catch(err => {
                                            console.log(err);
                                            res.sendStatus(500);
                                        });
                                    }).catch(err => {
                                        console.log(err);
                                        res.sendStatus(500);
                                    });
                                }else{
                                    res.sendStatus(403);
                                }
                            }else{
                                console.log('Attempted to add friend that does not exist');
                                res.sendStatus(400);
                            }
                        }).catch(err => {
                            console.log(err);
                            res.sendStatus(500);
                        });
                    } else {
                        res.sendStatus(500);
                    }
                }).catch(err => {
                    console.log(err);
                    res.sendStatus(500)
                })
            }catch(err){
                console.log(err);
                res.sendStatus(500);
            }
        }
    }
);

// @desc Deny friend request: delete request ID from request list
// @route POST /api/users/request/deny
// @access Protected
router.post('/request/deny', 
    (req, res, next) => protect(req, res, next),
    (req: any, res) => {
        if(!!req.body.googleId){
            try{
                const userDocRef = firestore.collection('users').doc(req.user.googleId);
                userDocRef.get().then((userToUpdate: any) => {
                    if(userToUpdate.data()){
                        const usersRequests: {id: string, username: string}[] = userToUpdate.data().requests || [];
                        const index = usersRequests.map(r => r.id).indexOf(req.body.googleId)
                        if (index !== -1){
                            usersRequests.splice(index, 1)
                            userDocRef.update({
                                requests: usersRequests
                            }).then(() => {
                                res.sendStatus(200);
                            }).catch(err => {
                                console.log(err);
                                res.sendStatus(500)
                            });
                        }else{
                            console.log("User not found");
                            res.sendStatus(400)
                        }
                    } else {
                        res.sendStatus(500)
                    }
                }).catch(err => {
                    console.log(err);
                    res.sendStatus(500)
                });
            }catch(err){
                console.log(err);
                res.sendStatus(500)
            }
        }
    }
);

// @desc Delete a friend from both users' friend lists
// @route GET /api/users/unfriend
// @access Protected
router.post('/unfriend', 
    (req, res, next) => protect(req, res, next),
    (req: any, res) => {
        if(!!req.body.googleId){
            const userID = req.user.googleId;
            const friendID = req.body.googleId;
            try{
                const userDocRef = firestore.collection('users').doc(userID)
                const friendDocRef = firestore.collection('users').doc(friendID)
                userDocRef.get().then((userToUpdate: any) => {
                    if(userToUpdate.data()){
                        friendDocRef.get().then((friendToUpdate: any) => {
                            const usersList: string[] = userToUpdate.data().friends || [];
                            const friendsList: string[] = friendToUpdate.data().friends || [];
                            if(
                                usersList.includes(friendID) &&
                                friendsList.includes(userID)
                            ){
                                userDocRef.update({
                                    friends: usersList.splice(usersList.indexOf(friendID))
                                }).then(() => {
                                    console.log('updated users friend list');
                                    friendDocRef.update({
                                        friends: friendsList.splice(friendsList.indexOf(userID))
                                    }).then(() => {
                                        console.log('updated friends friend list');
                                        res.sendStatus(200);
                                    }).catch(err => {
                                        console.log(err);
                                        res.sendStatus(500)
                                    });
                                }).catch(err => {
                                    console.log(err);
                                    res.sendStatus(500)
                                });
                            } else {
                                console.log('Attempted to delete friend that does not exist');
                                res.sendStatus(400)
                            }
                        }).catch(err => {
                            console.log(err);
                            res.sendStatus(500)
                        })
                    } else {
                        res.sendStatus(500)
                    }
                }).catch(err => {
                    console.log(err);
                    res.sendStatus(500)
                })
            }catch(err){
                console.log(err);
                res.sendStatus(500)
            }
        }
    }
);

//search for user by NCS username

router.get('/search/:username', (req: any, res) => {
    var name = JSON.stringify(req.params.username);
    name = JSON.parse(name.toLowerCase());
    const collRef = firestore.collection('users');
    collRef.where('username', '>=', name).where('username', '<=', name+'\uf8ff')
    .get().then(querySnapshot => {
        if(querySnapshot.size > 0)
            res.json(querySnapshot.docs.map(doc => doc.data().username));
        else
            res.json([]);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500)
    });
})

//store recently played users

//put with /api/room/data/:id

//get profile details for a friend (user?)
router.get('/friend/details/:uid', (req: any, res) => {
    try{
        firestore.collection('users').doc(req.params.uid).get().then((docSnapshot: any) => {
            if(docSnapshot.exists){
                const {
                    username,
                    rank,
                    achievements,
                    profilePic,
                    favorite
                } = docSnapshot.data();
                res.json({
                    username,
                    rank,
                    achievements,
                    profilePic,
                    favorite
                });
            }else{
                res.sendStatus(400)
            }
        }).catch(err => {
            console.log(err);
            res.sendStatus(500)
        });
    }catch(err){
        console.log(err);
        res.sendStatus(500)
    }
});

//update displayName creation on frontend to query for existing usernames and modify username if necessary,
//also sanitize string


export default router;