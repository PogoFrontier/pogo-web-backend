import e from "express";
import { firestore } from '../server';

const router = e.Router();

// @desc Get a single user from firestore by id (Google ID)
// @route GET /api/users/:id
// @access Public (for now)
router.get('/:id', (req, res) => {
    try{
        firestore.collection('users').doc(req.params.id).get().then(user => {
            if(user.data()){
                res.json(user.data());
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
// @access Public (for now)
router.post('/', async (req, res) => {
    try{
        const {userAuth, username, teams} = req.body;
        if(!userAuth) return;

        await firestore.collection('users').doc(userAuth.uid).set({
            googleId: userAuth.uid,
            displayName: username ? username : userAuth.displayName,
            email: userAuth.email,
            teams: teams ? teams : [],
            createdAt: Date.now()
        });
        const userDoc = await firestore.collection('users').doc(userAuth.uid).get();
        if(userDoc && userDoc.data()){
            res.json(userDoc.data());
        }else{
            res.status(500).json({error: 'Internal server error'});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
    }
})


export default router;