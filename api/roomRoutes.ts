import e from "express";
import { rooms } from "../server";

const router = e.Router();

// @desc Get an array of Pokemon names to be used for the search feature
// @route GET /api/pokemon/name
// @access Public (for now)
router.get('/:room', (req, res) => {
    try{
      const result: any = rooms.get(req.params.room);
      result ? res.json(result) : res.status(404).json(`Could not find room of id: ${req.params.room}`);
    } catch(err) {
        console.error();
        res.status(500).json({message: "Internal server error"});
    }
});

export default router;