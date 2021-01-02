import e from "express";
import c from 'cors';

const cors: any = c();

const router = e.Router();

router.get('/', cors, (req, res) => {
    try{
        res.json({message: "no user data yet"});
    }catch(err){
        console.error();
        res.status(500).json({message: "Internal server error"});
    }
});


export default router;