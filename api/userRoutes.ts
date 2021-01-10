import e from "express";
import { firestore } from '../server';
import {protect, generateToken} from '../actions/api_utils';

const router = e.Router();
 
// @desc Auth user and get token
// @route GET /api/users/signin/:id
// @access Public
router.get('/signin/:id', (req, res) => {
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
    (req, res, next) => protect(req, res, next), 
    (req: any, res) => {
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
router.post('/', (req, res) => {
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


export default router;