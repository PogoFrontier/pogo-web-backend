import e from "express";
import fs from "fs";
import { format } from "node:path";
import m from "../data/moves.json";
import p from "../data/pokemon.json";
import p2 from "../data/pokemonWithMainSeriesMoves.json";
import r from "../data/rules.json";

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
// @route GET /api/pokemon
// @access Public (for now)
router.get('', (req, res) => {
    try{
        // get params
        const queryParams = getQueryParams(req, res)
        if(!queryParams) {
            return
        }
        const {format, showIllegal, position} = queryParams;

        let result: any = {}
        if(format === undefined) {
            Object.keys(pokemon).forEach(speciesId => {
                result[speciesId] = {
                    legal: true
                }
            })
        } else {
            let fileName = `./data/pokemonForFormats/${format}_${position}.json`
            if(!fs.existsSync(fileName)) {
                fileName = `./data/pokemonForFormats/${format}.json`
            }

            result = JSON.parse(fs.readFileSync(fileName).toString());

            if(!showIllegal) {
                Object.keys(result).forEach(speciedId => {
                    if(!result[speciedId].legal) {
                        delete result[speciedId]
                    }
                })
            }
        }

        res.json(result);
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    }
});

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
        // get params
        const queryParams = getQueryParams(req, res)
        if(!queryParams) {
            return
        }
        const {format, position} = queryParams;

        let result: any = {}

        const movesetOption = req.query.movesetOption;
        result = movesetOption === "mainseries" ? pokemon2[req.params.id] : pokemon[req.params.id];
        if (movesetOption === "norestrictions") {
            result.fastMoves = quickmoves;
            result.chargedMoves = chargemoves;
            delete result.eliteMoves;
        }

        if(format)  {
            let fileName = `./data/pokemonForFormats/${format}_${position}.json`
            if(!fs.existsSync(fileName)) {
                fileName = `./data/pokemonForFormats/${format}.json`
            }

            result = {...result, ...JSON.parse(fs.readFileSync(fileName).toString())[req.params.id]};
        }

        result ? res.json(result) : res.status(404).json(`Could not find Pokemon of id: ${req.params.id}`);
    }catch(err){
        console.error();
        res.status(500).json({message: "Internal server error"});
    }
});

function getQueryParams(req: e.Request, res: e.Response): {
    format?: string,
    showIllegal: boolean,
    position: number
 } | undefined {
    // Get format param
    const format = req.query.format;
    // Check for valid format
    if (format !== undefined && (typeof format !== "string" || !Object.keys(rules).includes(format))) {
        res.status(400).json({messsage: "invalid format"})
        return
    }

    // Get showIllegal param
    const showIllegal = req.query.showIllegal === "true";
    
    // Get position param
    let positionParam = (req.query.position);
    let position = 0;
    if (positionParam !== undefined && typeof positionParam !== "string") {
        res.status(400).json({messsage: "typeof position is not string"})
        return
    } else if (positionParam !== undefined){
        position = parseInt(positionParam)
    }

    return {
        format,
        showIllegal,
        position
    }
 }

export default router;