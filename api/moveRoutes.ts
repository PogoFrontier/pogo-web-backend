import e from "express";
import m from '../data/moves.json';
const moves: any = m;
const router = e.Router();

// @desc Get the list of moves
// @route GET /api/moves
// @access Public (for now)
router.get('', async (req, res) => {
    try {
        const result: any = moves;
        result ? res.json(result) : res.sendStatus(404).json(`Could not find moves list`);
    } catch (err) {
        console.error(err);
        res.sendStatus(500).json({ message: "Internal server error" });
    }
});

// @desc Get a single move by id
// @route GET /api/moves/:id
// @access Public (for now)
router.get('/:id', async (req, res) => {
    try {
        const result: any = moves[req.params.id];
        result ? res.json(result) : res.sendStatus(404).json(`Could not find move of id: ${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.sendStatus(500).json({ message: "Internal server error" });
    }
});

export default router;