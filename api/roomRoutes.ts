import e from "express";
import { reduceTeamMemberForOpponent } from "../actions/reduceInformation";
import { TeamMember } from "../types/team"
import { storeClient } from "../redis/clients";

const router = e.Router();

// @desc Get an array of Pokemon names to be used for the search feature
// @route GET /api/pokemon/name
// @access Public (for now)
router.get('/:room', (req, res) => {
    try{
      storeClient.get("room:" + req.params.room, (err, reply) => {
        if (err) {
          res.status(500).json({message: "Internal server error"});
          return;
        }

        if(!reply) {
          res.status(404).json(`Could not find room of id: ${req.params.room}`);
          return;
        }

        let asJSON = JSON.parse(reply)
        asJSON = {
          id: asJSON.id,
          players: asJSON.players.map((player: any) => {
            let currentPokemon: TeamMember = player.current.team[player.current.active]
            return {
              id: player.id,
              current: {
                team: [reduceTeamMemberForOpponent(currentPokemon)],
                switch: player.current.switch,
                shields: player.current.shields,
                remaining: player.current.remaining
              }
            }
          })
        }

        res.json(asJSON);
      });
    } catch(err) {
        console.error();
        res.status(500).json({message: "Internal server error"});
    }
});

export default router;