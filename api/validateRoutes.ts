import e from "express";
import r from "../data/rules.json";
import onTeamValidate from "../handlers/onTeamValidate";

const rules: any = r;
const router = e.Router();

// @desc Validate a Pokemon team
// @route GET /api/pokemon/validate/:team/:meta
// @access Public (for now)
router.get('/:team/:meta', async (req, res) => {
    try{
        const meta: any = rules[req.params.meta];
        if (meta) {
            const team = JSON.parse(req.params.team)
            const data = onTeamValidate(team, meta)
            if (typeof data === 'string') {
                res.json({
                    message: data
                })
            } else {
                res.json(data)
            }
        } else {
            res.status(404).json(`${req.params.meta} is not a valid meta.`);
        }
    } catch(err) {
        console.error(err)
        res.status(500).json({message: "Internal server error"});
    }
});

export default router;