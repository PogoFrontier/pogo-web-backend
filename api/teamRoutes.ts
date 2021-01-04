import e from "express";
import { rules } from "../server";
import validateTeam from '../handlers/onValidateTeam';

const router = e.Router();

router.post('/validate', (req, res) => {
    try{
        var team = req.body;
        var chosenRule: any = rules[team.format]
        validateTeam(team, chosenRule);
        res.status(201).json({message: "validate done"})
    }catch(err){
        console.error();
        res.status(400).json({message: err.message});
    }
});


export default router;