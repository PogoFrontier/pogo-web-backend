import e from "express";
import r from "../data/rules.json";
import onTeamValidate from "../handlers/onTeamValidate";
import { getStrings } from "../actions/getTranslation"

const rules: any = r;
const router = e.Router();

// @desc Validate a Pokemon team
// @route GET /api/pokemon/validate/:team/:meta
// @access Public (for now)
router.get('/:team/:meta/:language', async (req, res) => {
    try{
        const lang : string = req.params.language 
        let strings : any= {}
        await getStrings(lang).then(s => strings = s)
        const meta: any = rules[req.params.meta];
        if (meta) {
            const team = JSON.parse(req.params.team)
            const data = onTeamValidate(team, meta, strings)
            if (typeof data === 'string') {
                res.json({
                    message: data
                })
            } else {
                res.json(data)
            }
        } else {
            //Get strings
            
            res.status(404).json(strings.no_valid_meta.replace('%1',req.params.meta));
        }
    } catch(err) {
        console.error(err)
        res.status(500).json({message: "Internal server error"});
    }
});

export default router;