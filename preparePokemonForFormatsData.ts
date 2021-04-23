import fs from "fs"
import p from "./data/pokemon.json";
import r from "./data/rules.json";
import { isSpeciesAllowed } from "./checks/checkTeam"

let pokemonList: any = p
let rules: any = r;

if(fs.existsSync("./data/pokemonForFormats")){
    fs.rmdirSync("./data/pokemonForFormats", { recursive: true })
}
fs.mkdirSync("./data/pokemonForFormats")

for (let ruleName of Object.keys(rules)) {
    let rule = rules[ruleName];

    // Do we have a team pattern? Then make 6 files, one for each team position
    if(rule.teamPattern) {
        for (let position in rule.teamPattern) {

            let listForFormat: any = {}; new Map<string, {legal: boolean}>()
            for (let pokemon of Object.keys(pokemonList)) {
                let speciesId: string = pokemonList[pokemon].speciesId
                let {
                    isValid: legal
                } = isSpeciesAllowed({speciesId}, rule, parseInt(position));
                listForFormat[speciesId] = {legal}
            }

            let text = JSON.stringify(listForFormat);
            fs.writeFileSync(`./data/pokemonForFormats/${ruleName}_${position}.json`, text)
        }
    } else {
        let listForFormat: any = {}; new Map<string, {legal: boolean}>()
        for (let pokemon of Object.keys(pokemonList)) {
            let speciesId: string = pokemonList[pokemon].speciesId
            let {
                isValid: legal
            } = isSpeciesAllowed({speciesId}, rule, 0);
            listForFormat[speciesId] = {legal}
        }

        let text = JSON.stringify(listForFormat);
        fs.writeFileSync(`./data/pokemonForFormats/${ruleName}.json`, text)
    }
}