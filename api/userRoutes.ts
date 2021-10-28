import e, { request } from "express";
import { firestore } from "../firestore/firestore";
import {protect, generateToken} from '../actions/api_utils';
import { storeClient } from "../redis/clients";
import { getUserStatusKey } from "../redis/getKey";

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

            // Start transaction
            await firestore.runTransaction(async (t) => {

                //check if user already exists first
                const docRef = firestore.collection('users').doc(userAuth.uid);
                const user = await t.get(docRef);

                if (user.data()) {
                    res.sendStatus(401)
                    return;
                }

                const un = username ? username : userAuth.displayName //.sanitize
                // Send user info to client
                const newUser = await t.get(docRef);
                if(!newUser?.data()) {
                    res.sendStatus(500)
                    return;
                }
                t.set(docRef, {
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
                })

                
                res.json({
                    userData: newUser.data(),
                    token: generateToken(userAuth.uid)
                });
            });
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
    async (req: any, res) => {
        const { teams } = req.body;
        if(!teams) {
            return
        }

        try {
            // Start transaction
            await firestore.runTransaction(async (t) => {
                const docRef = firestore.collection('users').doc(req.user.googleId);

                // Check if user exists
                const user = await t.get(docRef);
                if (!user.data()) {
                    res.sendStatus(404);
                    return;
                }

                // Save teams
                t.update(docRef, { teams: teams })
            })

        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
)

// @desc Update a users username, validate with token
// @route POST /api/users/username
// @access Protected
router.post('/username',
    (req, res, next) => protect(req, res, next),
    async (req: any, res) => {
        const { username } = req.body;
        if(!username) {
            return
        }

        try {
            // Start transaction
            await firestore.runTransaction(async (t) => {

                // Check for duplicates of that name
                const duplicate = await t.get(firestore.collection('users').where("username", "==", username))
                if (!duplicate.empty) {
                    res.sendStatus(409);
                    return;
                }

                // Get user
                const docRef = firestore.collection('users').doc(req.user.googleId);
                const user = await t.get(docRef)
                if(!user.data()) {
                    res.sendStatus(404);
                    return
                }

                // Update username
                await t.update(docRef, { username: username })

                // Send response
                res.json({ ...user.data(), username: username });
                
            })
        } catch (err) {
            console.log(err);
            res.sendStatus(500);
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
        .select("username", "lastActivity").get().then(querySnapshot => {
            if (querySnapshot.size > 0) {
                storeClient.mget(querySnapshot.docs.map(doc => getUserStatusKey(doc.id)), (err, reply) => {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                        return
                    }

                    res.json(querySnapshot.docs.map((doc, index) => {
                        return {
                            ...doc.data(),
                            status: reply[index],
                            id: doc.id
                        }
                    }));
                })
            } else
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
    async (req: any, res) => {
        const { username } = req.params;
        if (!username) {
            return
        }

        try {
            // Start transaction
            await firestore.runTransaction(async (t) => {

                // Get user
                const senderDocRef = firestore.collection('users').doc(req.user.googleId)
                const sender = await t.get(senderDocRef);
                // Do you have a username?
                if (!sender.data()?.username) {
                    res.sendStatus(401)
                    return
                }

                // Get friend
                const friendDocRef = firestore.collection('users').where("username", "==", req.params.username)
                const friendToUpdate = await t.get(friendDocRef);
                if (friendToUpdate.empty) {
                    res.sendStatus(404);
                    return;
                }

                // Iterate over the 1 friend. 
                let index0 = true
                friendToUpdate.forEach((newFriendMaybe) => {
                    if (!index0) {
                        return
                    }
                    index0 = false

                    // Has anyone already sent a friend request?
                    if (newFriendMaybe.data().requests?.map((r: any) => r.id).includes(req.user.googleId)) {
                        res.sendStatus(403);
                        return;
                    }
                    if (sender.data()?.requests?.map((r: any) => r.id).includes(newFriendMaybe.id)) {
                        res.sendStatus(409)
                        return
                    }

                    // It's possible
                    res.sendStatus(200);
                })
            })
        } catch (err) {
            console.log(err);
            res.sendStatus(400);
        }
    }
)

// @desc Send friend request to a user
// @route POST /api/users/request/send
// @access Protected
router.post('/request/send', 
    (req, res, next) => protect(req, res, next),
    async (req: any, res) => {
        const { username } = req.body;
        if (!username) {
            return
        }

        try {
            // Start transaction
            await firestore.runTransaction(async (t) => {

                // Get user
                const senderDocRef = firestore.collection('users').doc(req.user.googleId)
                const sender = await t.get(senderDocRef);

                // Do you have a username?
                if (!sender.data()?.username) {
                    res.sendStatus(401)
                    return
                }

                // Get friend
                const friendDocRef = firestore.collection('users').where("username", "==", username)
                const friendToUpdate = await t.get(friendDocRef);
                if (friendToUpdate.empty) {
                    res.sendStatus(404);
                    return;
                }

                // Iterate over the 1 friend
                let index0 = true
                friendToUpdate.forEach((newFriendMaybe) => {
                    if (!index0) {
                        return
                    }
                    index0 = false

                    let requests = newFriendMaybe.data().requests
                    if (!requests) {
                        requests = []
                    }

                    // Has anyone already sent a friend request?
                    if (requests.map((r: any) => r.id).includes(req.user.googleId)) {
                        res.sendStatus(403);
                        return;
                    }
                    if (sender.data()?.requests?.map((r: any) => r.id).includes(newFriendMaybe.id)) {
                        res.sendStatus(409)
                        return
                    }

                    // Update friend
                    t.update(firestore.collection('users').doc(newFriendMaybe.id), {
                        requests: [...requests, { id: req.user.googleId, username: sender.data()?.username }]
                    })

                    // Send status
                    res.sendStatus(200);
                })
            })
        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
)

//might still be a case where they both sent request to each other

// @desc Accept friend request: delete request and add friend to both user's lists
// @route POST /api/users/request/accept
// @access Protected
router.post('/request/accept', 
    (req, res, next) => protect(req, res, next),
    async (req: any, res) => {
        if(!req.body.googleId) {
            return;
        }
        const userID = req.user.googleId;
        const friendID = req.body.googleId;

        try {
            // Start transaction
            await firestore.runTransaction(async (t) => {
                const userDocRef = firestore.collection('users').doc(userID)
                const friendDocRef = firestore.collection('users').doc(friendID)
                const userToUpdate = await t.get(userDocRef)
                const friendToUpdate = await t.get(friendDocRef)
                const userData = userToUpdate.data()
                const friendData = friendToUpdate.data()

                // Do the two users exist?
                if (!userData) {
                    res.sendStatus(500);
                    return;
                }
                if (!friendData) {
                    console.log('Attempted to add friend that does not exist');
                    res.sendStatus(400);
                    return;
                }

                // Get lists from data
                const usersRequests: { id: string, username: string }[] = userData.requests || [];
                const usersFriends: string[] = userData.friends || [];
                const friendsList: string[] = friendData.friends || [];
                const reqIndex = usersRequests.map(r => r.id).indexOf(req.body.googleId)

                // Are they already friends? Do we have a friend request?
                if (
                    reqIndex === -1 ||
                    usersFriends.includes(friendID) ||
                    friendsList.includes(userID)
                ) {
                    res.sendStatus(403);
                    return
                }

                // Update data
                usersRequests.splice(reqIndex, 1)
                t.update(userDocRef, {
                    requests: usersRequests,
                    friends: [...usersFriends, friendID]
                })
                t.update(friendDocRef, {
                    friends: [...friendsList, userID]
                })

                // Send status
                res.sendStatus(200);

            })
        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }

    }
);

// @desc Deny friend request: delete request ID from request list
// @route POST /api/users/request/deny
// @access Protected
router.post('/request/deny', 
    (req, res, next) => protect(req, res, next),
    async (req: any, res) => {
        if (!req.body.googleId) {
            return;
        }

        const userID = req.user.googleId;


        try {
            // Start transaction
            await firestore.runTransaction(async (t) => {
                const userDocRef = firestore.collection('users').doc(userID)
                const userToUpdate = await t.get(userDocRef)
                const userData = userToUpdate.data()

                // Do the two users exist?
                if (!userData) {
                    res.sendStatus(500);
                    return;
                }

                // Get lists from data
                const usersRequests: { id: string, username: string }[] = userData.requests || [];
                const reqIndex = usersRequests.map(r => r.id).indexOf(req.body.googleId)

                // Are they already friends? Do we have a friend request?
                if (
                    reqIndex === -1
                ) {
                    res.sendStatus(403);
                    return
                }

                // Update data
                usersRequests.splice(reqIndex, 1)
                t.update(userDocRef, {
                    requests: usersRequests
                })

                // Send status
                res.sendStatus(200);

            })
        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
);

// @desc Delete a friend from both users' friend lists
// @route GET /api/users/unfriend
// @access Protected
router.post('/unfriend', 
    (req, res, next) => protect(req, res, next),
    async (req: any, res) => {
        if (!req.body.googleId) {
            return;
        }
        const userID = req.user.googleId;
        const friendID = req.body.googleId;

        try {
            // Start transaction
            await firestore.runTransaction(async (t) => {
                const userDocRef = firestore.collection('users').doc(userID)
                const friendDocRef = firestore.collection('users').doc(friendID)
                const userToUpdate = await t.get(userDocRef)
                const friendToUpdate = await t.get(friendDocRef)
                const userData = userToUpdate.data()
                const friendData = friendToUpdate.data()

                // Do the two users exist?
                if (!userData) {
                    res.sendStatus(500);
                    return;
                }
                if (!friendData) {
                    console.log('Attempted to add friend that does not exist');
                    res.sendStatus(400);
                    return;
                }

                // Get lists from data
                const usersList: string[] = userData.friends || [];
                const friendsList: string[] = friendData.friends || [];

                // Are they already friends? Do we have a friend request?
                if (
                    !usersList.includes(friendID) ||
                    !friendsList.includes(userID)
                ) {
                    console.log('Attempted to delete friend that does not exist');
                    res.sendStatus(400)
                    return
                }

                // Update data
                usersList.splice(usersList.indexOf(friendID), 1)
                friendsList.splice(friendsList.indexOf(userID), 1)
                t.update(userDocRef, {
                    friends: usersList
                })
                t.update(friendDocRef, {
                    friends: friendsList
                })

                // Send status
                res.sendStatus(200);

            })
        } catch (err) {
            console.log(err);
            res.sendStatus(500);
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