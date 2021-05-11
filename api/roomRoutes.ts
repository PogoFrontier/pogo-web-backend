import e from "express";
import { reduceTeamMemberForOpponent } from "../actions/reduceInformation";
import { TeamMember } from "../types/team"
import { storeClient } from "../redis/clients";
import { Room } from "../types/room";

const router = e.Router();

// @desc Get data object of a room
// @route GET /api/room/data/:id
// @access Public (for now)
router.get('/data/:room', (req, res) => {
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
            if (!player || !player.team || !player.current) {
              return
            }
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
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    }
});

function loadRooms(keys: string[]) {
  return Promise.all(keys.map(async function(key) {
    const s = await storeClient.get(key)
    if (s) {
      const sJSON = await JSON.parse(s) as Room
      if (
        !sJSON.players
        || (!sJSON.players[0] && !sJSON.players[1])
        || (sJSON.players[0] && sJSON.players[1])
        || sJSON.reservedSeats
      ) {
        return
      }
      const player = sJSON.players.find(x => x !== null)
      if (player) {
        return {
          id: sJSON.id,
          format: sJSON.format,
          player: player.id
        }
      }
    }
  }))
}

// @desc Get list of rooms
// @route GET /api/room/list
// @access Public (for now)
router.get('/list', (req, res) => {
  try{
    storeClient.keys('room:*')
      .then(function (keys) {
        if(keys) {
          loadRooms(keys).then((values) => {
            res.json(values);
          });
        }
      });
  } catch(err) {
      console.error(err);
      res.status(500).json({message: "Internal server error"});
  }
});

// @desc Get 
// @route GET /api/room/status
// @access Public (for now)
router.get('/status', (req, res) => {
  try {
    storeClient.keys('room:*')
      .then(function (keys) {
        let count = 0;
        Promise.all([
          storeClient.keys('searchBattle:*')
          .then(function (clients) {
            count += clients.length
          }),
          keys.map(async function(key) {
            const s = await storeClient.get(key)
            if (s) {
              const sJSON = await JSON.parse(s) as Room
              if (!sJSON.players) {
                return
              }
              for (const p of sJSON.players) {
                if (p !== null && p !== undefined) {
                  count++
                }
              }
            }
        })])
        .then(() => {
          res.json(count)
        })
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({message: "Internal server error"});
  }
});

export default router;