import fs from "fs";
import https from "https"
import { Pokedex as pokedex } from "../data/pokedex";
import { getLearnSetKey } from './util';

let pokemonList: any = {}
const unreleasedTag = "unreleased"

const replaceMap = {
    "_shadow": "",
    "_alolan": "_alola",
    "_galarian": "_galar",
    "_female": "_f",
    "indeedee_male": "indeedee",
    "_male": "_m",
    "pikachu_kariyushi": "pikachu_pop_star",
    "pikachu_5th_anniversary": "pikachu_pop_star",
    "pikachu_flying": "pikachu_pop_star",
    "_armored": "",
    "_plant": "",
    "_overcast": "",
    "cherrim_sunny": "cherrim_sunshine",
    "_east_sea": "_east",
    "_west_sea": "",
    "_altered": "",
    "_land": "",
    "_standard": "",
    "_incarnate": "",
    "_ordinary": "",
    "_aria": "",
    "pyroar_f": "pyroar",
    "_average": "",
    "_confined": "",
    "_amped": "_low_key",
    "_phony": "",
    "eiscue_ice": "eiscue",
    "_full_belly": "",
    "_hero": "",
    "_sword": "",
    "_shield": "",
    "_single_strike": "",
    "_ice_rider": "_ice"
}

const getSid = (speciesId: string, sids: any) => {
    for(const needle of Object.keys(replaceMap)) {
        speciesId = speciesId.replace(needle, replaceMap[needle])
    }
    return parseInt(Object.keys(sids).find(sid => {
        let sidObj = sids[sid]
        let sidString = sidObj.base
        if(sidObj.forme) {
            sidString += "_" + sidObj.forme
        }
        sidString = sidString.replace("-", "_").replace("’", "").replace(".", "").replace(" ", "_").replace(/é/g, "e").toLowerCase()

        return speciesId === sidString
    })!.replace("s", ""))
}

https.get("https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/gamemaster.json", (res) => {
    let body = ""
    res.on("data", (data) => body += data.toString());
    res.on("end", () => {
        https.get("https://raw.githubusercontent.com/smogon/sprites/master/data/species.json", res => {
            let sidBody = ""
            res.on("data", (data) => sidBody += data.toString());
            res.on("end", () => {

                let bodyJSON = JSON.parse(body).pokemon
                let sids = JSON.parse(sidBody)
        
                for(let pokemon of bodyJSON) {
                    if(pokemon.speciesId.includes("_xs")) {
                        continue;
                    }
                    
                    if(!pokemon.released) {
                        if(!pokemon.tags) {
                            pokemon.tags = []
                        }
                        pokemon.tags.push(unreleasedTag)
                    }
                    delete pokemon.released
                    delete pokemon.buddyDistance
                    delete pokemon.thirdMoveCost
                    delete pokemon.defaultIVs

                    pokemon.sid = getSid(pokemon.speciesId, sids)
                    pokemon.gender = pokedex[getLearnSetKey(pokemon.speciesId)].gender

                    if(["shellos", "gastrodon"].includes(pokemon.speciesId)) {
                        let copy = { ...pokemon };
                        copy.speciesId = pokemon.speciesId + "_west_sea"
                        copy.speciesName = pokemon.speciesName + " (West)"
                        copy.sid = getSid(copy.speciesId, sids)
                        pokemonList[copy.speciesId] = copy

                        pokemon.speciesId = pokemon.speciesId + "_east_sea"
                        pokemon.speciesName = pokemon.speciesName + " (East)"
                        pokemon.sid = getSid(pokemon.speciesId, sids)
                    }

                    pokemonList[pokemon.speciesId] = pokemon
                }
        
                fs.writeFileSync("data/pokemon.json", JSON.stringify(pokemonList, null, 2))
            })
        })
    })
})