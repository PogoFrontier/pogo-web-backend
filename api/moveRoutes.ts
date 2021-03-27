import e from "express";
import m from '../data/moves.json';
import { storeClient } from "../redis/clients";
import { Player } from "../types/room";

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
    try{
        storeClient.get("room:" + req.params.room, (err, reply) => {
          if (err) {
            res.status(500).json({message: "Internal server error"});
          }
          if (!reply) {
            res.status(404).json(`Could not find room of id: ${req.params.room}`);
            return; 
          }
          
          const currentRoom: {
              players: Array<Player>
          } = JSON.parse(reply);
          const player = currentRoom && Array.isArray(currentRoom.players) ? currentRoom.players.find(x => x?.id === req.params.id) : null;

          if (!player || !player.current) {
            res.status(404).json(`Could not find player of id: ${req.params.id}`);
            return;
          }
          let arr = [];
          for (const member of player.current.team) {
            let arr2 = [];
            for (const move of member.chargeMoves) {
                if (move !== "NONE") {
                    arr2.push(moves[move]);
                }
            }
            arr.push(arr2);
          }
          res.json(arr);
  
        });
    } catch(err) {
      console.error();
      res.status(500).json({message: "Internal server error"});
    }
});

export default router;