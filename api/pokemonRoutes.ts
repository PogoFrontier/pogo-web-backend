import e from "express";
import p from "../data/pokemon.json";
import r from "../data/rules.json";
import onTeamValidate from "../handlers/onTeamValidate";

const pokemon: any = p;
const rules: any = r;
const router = e.Router();

// @desc Get an array of Pokemon names to be used for the search feature
// @route GET /api/pokemon/name
// @access Public (for now)
router.get('/names', (req, res) => {
    try{
        res.json(Object.keys(pokemon).map((mon: any) => {
            return pokemon[mon].speciesName
        }));
    }catch(err){
        console.error();
        res.status(500).json({message: "Internal server error"});
    }
});

// @desc Get a single pokemon by id (formatted as speciesId)
// @route GET /api/pokemon/:id
// @access Public (for now)
router.get('/:id', (req, res) => {
    try{
        const result: any = pokemon[req.params.id];
        result ? res.json(result) : res.status(404).json(`Could not find Pokemon of id: ${req.params.id}`);
    }catch(err){
        console.error();
        res.status(500).json({message: "Internal server error"});
    }
});

// @desc Validate a Pokemon team
// @route GET /api/validate/:team/:meta
// @access Public (for now)
router.get('/validate/:team/:meta', (req, res) => {
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
            res.status(404).json(`${req.params.id} is not a valid meta.`);
        }
    } catch(err) {
        res.status(500).json({message: "Internal server error"});
    }
});

export default router;