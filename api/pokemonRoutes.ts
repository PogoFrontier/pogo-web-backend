import e from "express";
import m from "../data/moves.json";
import p from "../data/pokemon.json";
import p2 from "../data/pokemonWithMainSeriesMoves.json";
import r from "../data/rules.json";
import onTeamValidate from "../handlers/onTeamValidate";

let moves: any = m;
let quickmoves: Array<string> = [];
let chargemoves: Array<string> = [];
for (let move of Object.keys(moves)) {
    if (moves[move].energy) {
        chargemoves.push(move)
    } else {
        quickmoves.push(move)
    }
}
const pokemon: any = p;
const pokemon2: any = p2;
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
        const movesetOption = req.query.movesetOption;
        let result: any = movesetOption === "mainseries" ? pokemon2[req.params.id] : pokemon[req.params.id];
        if (movesetOption === "norestrictions") {
            result.fastMoves = quickmoves;
            result.chargedMoves = chargemoves;
            delete result.eliteMoves;
        }
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