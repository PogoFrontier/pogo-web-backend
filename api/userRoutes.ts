import e from "express";
import { firestore } from './rest_server';
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
            res.status(500).json({error: "Internal server error"})
        })
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
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
                res.status(404).json({error: `User not found.`})
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({error: "Internal server error"})
        })
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
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
                    res.status(401).json({error: 'User already exists.'});
                }else{
                    docRef.set({
                        googleId: userAuth.uid,
                        displayName: username ? username : userAuth.displayName,
                        email: userAuth.email,
                        teams: teams ? teams : [],
                        friends: [],
                        requests: [],
                        challenges: [],
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
                                res.status(500).json({error: 'Internal server error'});
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
        res.status(500).json({error: "Internal server error"});
    }
})

// @desc Update a users teams, validate with token
// @route POST /api/users/setteams
// @access Protected
router.post('/setteams', 
    (req, res, next) => protect(req, res, next), 
    (req: any, res) => {
        const {teams} = req.body;
        if(teams){
            try{
                const docRef = firestore.collection('users').doc(req.user.googleId);
                docRef.get().then(user => {
                    if(user.data()){
                        docRef.update({teams: teams}).then(() => {
                            res.json(user.data());
                        }).catch(err => {
                            console.log(err);
                            res.status(500).json({error: "Internal server error"})
                        });
                    }else{
                        res.status(404).json({error: `User not found.`})
                    }
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({error: "Internal server error"})
                })
            }catch(err){
                console.log(err);
                res.status(500).json({error: "Internal server error"});
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
        .select("displayName", "lastLogin").get().then(querySnapshot => {
            if(querySnapshot.size > 0)
                res.json(querySnapshot.docs.map(doc => doc.data()));
            else
                res.json([]);
        }).catch(err => {
            console.log(err);
            res.status(500).json({error: "Internal server error"})
        });
    }
)

// @desc Send friend request to a user
// @route POST /api/users/request/send
// @access Protected
router.post('/request/send', 
    (req, res, next) => protect(req, res, next),
    (req: any, res) => {
        if(req.body.googleId){
            try{
                const friendDocRef = firestore.collection('users').doc(req.body.googleId)
                friendDocRef.get().then((friendToUpdate: any) => {
                    if(friendToUpdate.data()){
                        const friendsRequests: string[] = friendToUpdate.data().requests || [];
                        if(!friendsRequests.includes(req.user.googleId)){
                            friendDocRef.update({
                                requests: [...friendsRequests, req.user.googleId]
                            }).then(() => {
                                res.sendStatus(200);
                            }).catch(err => {
                                console.log(err);
                                res.status(500).json({error: "Internal server error"})
                            });
                        }else{
                            //return err, request already exists
                            res.status(403).json({error: "Request already exists!"})
                        }
                    } else {
                        console.log("User not found");
                        res.status(400).json({error: "User to request not found."});
                    }
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({error: "Internal server error"})
                })
            }catch(err){
                console.log(err);
                res.status(400).json({error: "User to request not found."})
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
        if(req.body.googleId){
            const userID = req.user.googleId;
            const friendID = req.body.googleId;
            try{
                const userDocRef = firestore.collection('users').doc(userID)
                const friendDocRef = firestore.collection('users').doc(friendID)
                userDocRef.get().then((userToUpdate: any) => {
                    if(userToUpdate.data()){
                        friendDocRef.get().then((friendToUpdate: any) => {
                            if(friendToUpdate.data()){
                                const usersRequests: string[] = userToUpdate.data().requests || [];
                                const usersFriends: string[] = userToUpdate.data().friends || [];
                                const friendsList: string[] = friendToUpdate.data().friends || [];
                                if(
                                    usersRequests.includes(friendID) && 
                                    !usersFriends.includes(friendID) &&
                                    !friendsList.includes(userID)
                                ){
                                    userDocRef.update({
                                        requests: usersRequests.splice(usersRequests.indexOf(friendID)),
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
                                            res.status(500).json({error: "Internal server error"})
                                        });
                                    }).catch(err => {
                                        console.log(err);
                                        res.status(500).json({error: "Internal server error"})
                                    });
                                }else{
                                    res.status(403).json({error: "Request has already been accepted, or no longer exists in your request list."})
                                }
                            }else{
                                console.log('Attempted to add friend that does not exist');
                                res.status(400).json({error: "User to accept request from not found."})
                            }
                        }).catch(err => {
                            console.log(err);
                            res.status(500).json({error: "Internal server error"})
                        });
                    } else {
                        res.status(500).json({error: "Internal server error"})
                    }
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({error: "Internal server error"})
                })
            }catch(err){
                console.log(err);
                res.status(400).json({error: "User not found."})
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
        if(req.body.googleId){
            try{
                const userDocRef = firestore.collection('users').doc(req.user.googleId);
                userDocRef.get().then((userToUpdate: any) => {
                    if(userToUpdate.data()){
                        const usersRequests: string[] = userToUpdate.data().requests || [];
                        if(usersRequests.includes(req.body.googleId)){
                            userDocRef.update({
                                requests: usersRequests.splice(usersRequests.indexOf(req.body.googleId))
                            }).then(() => {
                                res.sendStatus(200);
                            }).catch(err => {
                                console.log(err);
                                res.status(500).json({error: "Internal server error"})
                            });
                        }else{
                            console.log("User not found");
                            res.status(400).json({error: "User to deny request from not found."});
                        }
                    } else {
                        res.status(500).json({error: "Internal server error"})
                    }
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({error: "Internal server error"})
                });
            }catch(err){
                console.log(err);
                res.status(500).json({error: "Internal server error"})
            }
        }
    }
)

export default router;