import e from "express";
import { rooms } from "../server";
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
        }

        reply ? res.json(JSON.parse(reply)) : res.status(404).json(`Could not find room of id: ${req.params.room}`);
      });
    } catch(err) {
        console.error();
        res.status(500).json({message: "Internal server error"});
    }
});

export default router;