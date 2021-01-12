import e from "express";
import m from '../data/moves.json';
import { rooms } from "../server";

const moves: any = m;
const router = e.Router();

// @desc Get a single move by id
// @route GET /api/moves/:id
// @access Public (for now)
router.get('/:id', (req, res) => {
    try {
        const result: any = moves[req.params.id];
        result ? res.json(result) : res.status(404).json(`Could not find move of id: ${req.params.id}`);
    } catch (err) {
        console.error();
        res.status(500).json({message: "Internal server error"});
    }
});

router.get('/team/:room/:id', (req, res) => {
    try {
        const room: string = req.params.room;
        const currentRoom = rooms.get(room);
        const i = currentRoom ? currentRoom.players.findIndex(x => x?.id === req.params.id) : -1;
        if (currentRoom && i > -1 && currentRoom.players[i]?.current) {
            let arr = [];
            for (const member of currentRoom.players[i]!.current!.team) {
                let arr2 = [];
                for (const move of member.chargeMoves) {
                    arr2.push(move);
                }
                arr.push(arr2);
            }
            res.json(arr);
        } else {
            res.status(404).json(`Could not find room of id: ${room}`);
            return;
        }
    } catch (err) {
        console.error();
        res.status(500).json({message: "Internal server error"});
    }
});

export default router;