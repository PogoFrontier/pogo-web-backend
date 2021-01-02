import e from "express";

const router = e.Router();

router.get('/', (req, res) => {
    try{
        res.json({message: "no user data yet"});
    }catch(err){
        console.error();
        res.status(500).json({message: "Internal server error"});
    }
});


export default router;