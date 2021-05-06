import fs from "fs";
import https from "https"

let pokemonList: any = {}
const unreleasedTag = "unreleased"

const getSid = (speciesId: string, sids: any) => {
    speciesId = speciesId.replace("_shadow", "").replace("_alolan", "_alola").replace("_galarian", "_galar").replace("_female", "_f").replace("_male", "_m").replace("pikachu_flying", "pikachu_pop_star").replace("_armored", "").replace("_plant", "").replace("_overcast", "").replace("cherrim_sunny", "cherrim_sunshine").replace("_east_sea", "_east").replace("_west_sea", "").replace("_altered", "").replace("_land", "").replace("_standard", "").replace("_incarnate", "").replace("_ordinary", "").replace("_aria", "").replace("_altered", "").replace("pyroar_f", "pyroar")
    return parseInt(Object.keys(sids).find(sid => {
        let sidObj = sids[sid]
        let sidString = sidObj.base
        if(sidObj.forme) {
            sidString += "_" + sidObj.forme
        }
        sidString = sidString.replace("-", "_").replace("’", "").replace(".", "").replace(" ", "_").replaceAll("é", "e").toLowerCase()

        return speciesId === sidString
    })!)
}

https.get("https://raw.githubusercontent.com/pvpoke/pvpoke/level-50-rankings/src/data/gamemaster.json", (res) => {
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
                    if(!pokemon.sid) {
                        console.log(pokemon.speciesId)
                    }
                    pokemonList[pokemon.speciesId] = pokemon
                }
        
                fs.writeFileSync("data/pokemon.json", JSON.stringify(pokemonList, null, 2))
            })
        })
    })
})