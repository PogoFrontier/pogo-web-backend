import fs from "fs"
import p from "./data/pokemon.json";
import m from "./data/moves.json";

import { Learnsets } from './data/learnsets'

let pokemonList: any = p
let localMoves: any = m;

const hpTypes = ['bug', 'dark', 'dragon', 'electric', 'fighting', 'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal', 'poison', 'psychic', 'rock', 'steel', 'water']
const wbTypes = ['fire', 'ice', 'rock', "normal", 'water']
const tbTypes = ['normal', 'chill', 'burn', "douse", 'shock']

for(let id of Object.keys(pokemonList)) {
    let pokemon = pokemonList[id];

    let key: string= pokemon.speciesId.replace("shadow", "").replace("therian", "").replace("incarnate", "").replace("galarian", "galar").replace("alolan", "alola").replace("_zen", "").replace("_standard", "").replace("female", "f").replace("male", "m").replace("_mega", "").replaceAll("_", "")
    if(key.startsWith("charizard")) {
        key = "charizard";
    }
    if(key.startsWith("pikachuflying")) {
        key = "pikachu";
    }
    if(key.startsWith("mewtwo")) {
        key = "mewtwo";
    }
    if(key.startsWith("castform")) {
        key = "castform";
    }
    if(key.startsWith("deoxys")) {
        key = "deoxys";
    }
    if(key.startsWith("shellos")) {
        key = "shellos";
    }
    if(key.startsWith("gastrodon")) {
        key = "gastrodon";
    }
    if(key.startsWith("burmy")) {
        key = "burmy";
    }
    if(key.startsWith("wormadamplant")) {
        key = "wormadam";
    }
    if(key.startsWith("cherrim")) {
        key = "cherrim";
    }
    if(key.startsWith("giratina")) {
        key = "giratina";
    }
    if(key.startsWith("shaymin")) {
        key = "shaymin";
    }
    if(key.startsWith("arceus")) {
        key = "arceus";
    }
    if(key.startsWith("keldeo")) {
        key = "keldeo";
    }
    if(key.startsWith("genesect")) {
        key = "genesect";
    }
    if(key.startsWith("meloetta")) {
        key = "meloetta";
    }
    let pokeWithLearnset = Learnsets[key];
    if(!pokeWithLearnset || !pokeWithLearnset.learnset) {
        console.error("Unidentified pokemon " + key);
        process.exit(1);
    }
    
    let quickmoves = []
    let chargemoves = []
    
    for (let move of Object.keys(pokeWithLearnset.learnset)) {
        let moveId: string | undefined = Object.keys(localMoves).find((moveId) => moveId.toLowerCase().replace("_", "") === move);

        if (move === "hiddenpower")  {
            for (let type of hpTypes) {
                quickmoves.push("HIDDEN_POWER_" + type.toUpperCase())
            }
            continue;
        } else if (moveId === "wheatherball") {
            for (let type of wbTypes) {
                quickmoves.push("WEATHER_BALL_" + type.toUpperCase())
            }
            continue;
        }else if (moveId === "technoblast") {
            for (let type of tbTypes) {
                quickmoves.push("TECHNO_BLAST_" + type.toUpperCase())
            }
            continue;
        }
        if (!moveId) {
            continue;
        }
        
        let moveDataInPoGO = localMoves[moveId];
        
        if (moveDataInPoGO.energy){
            chargemoves.push(moveId);
        } else {
            quickmoves.push(moveId)
        }
    }

    if(pokemon.speciesId === "smeargle") {
        chargemoves = [];
        for (let move of Object.keys(localMoves)) {
            if (move.includes("BLASTOISE")){
                continue;
            }
            if (localMoves[move].energy){
                chargemoves.push(move);
            } else {
                quickmoves.push(move);
            }
        }
    } else {
        // Add struggle to every Pokemon
        chargemoves.push("STRUGGLE");
    } 
    if(pokemon.speciesId === "pikachu_flying") {
        chargemoves.push("FLY")
    }

    pokemon.fastMoves = quickmoves;
    pokemon.chargedMoves = chargemoves;
    delete pokemon.eliteMoves
}

fs.writeFileSync("data/pokemonWithMainSeriesMoves.json", JSON.stringify(pokemonList))

/*async function loadPokemonMoveset(localPokemon: any) {
    if(localPokemon.hasMainSeriesChargeMoves) {
        return localPokemon;
    }
    console.log("Do " + localPokemon.speciesId);
    newPokemon = localPokemon;
    let pokemonFromDatabase: {moves: Array<any>};

    try{
        let urlSuffix = newPokemon.speciesId.replace("_male", "-m").replace("_female", "-f").replace("_shadow", "").replace("_armored", "").replace("_zen", "").replace("_standard", "").replaceAll("_", "-").replace("alolan", "alola").replace("galarian", "galar")
        if(urlSuffix.startsWith("aegislash")) {
            urlSuffix = "aegislash-shield";
        }        
        if(urlSuffix.startsWith("arceus")) {
            urlSuffix = "arceus";
        }
        if(urlSuffix.startsWith("basculin")) {
            urlSuffix = "basculin-red-striped";
        }
        if(urlSuffix.startsWith("genesect")) {
            urlSuffix = "genesect";
        }
        if(urlSuffix.startsWith("burmy")) {
            urlSuffix = "burmy";
        }
        if(urlSuffix.startsWith("shellos")) {
            urlSuffix = "shellos";
        }
        if(urlSuffix.startsWith("gastrodon")) {
            urlSuffix = "gastrodon";
        }
        if(urlSuffix.startsWith("meowstic")) {
            urlSuffix = "meowstic-male";
        }
        if(urlSuffix.startsWith("pumpkaboo")) {
            urlSuffix = "pumpkaboo-average";
        }
        if(urlSuffix.startsWith("gourgeist")) {
            urlSuffix = "gourgeist-average";
        }
        if(urlSuffix.startsWith("cherrim")) {
            urlSuffix = "cherrim";
        }
        if(urlSuffix === "deoxys") {
            urlSuffix = "deoxys-normal";
        }
        if(urlSuffix === "pikachu-flying") {
            urlSuffix = "pikachu";
        }
        if(urlSuffix === "darmanitan-galar") {
            urlSuffix = "darmanitan-standard-galar";
        }
        let response = await axios.get(urlPrefix + urlSuffix)
        pokemonFromDatabase = response.data
    } catch(e) {
        let asJSON = e.toJSON()
        console.log("Fail in case " +localPokemon.speciesId);
        console.log(asJSON);
        return newPokemon;
    }

    let quickmoves = []
    let chargemoves = []

    for (let moveDataMainSeries of pokemonFromDatabase.moves) {
        let moveId: string = moveDataMainSeries.move.name.toUpperCase().replace("-", "_")

        let moveDataInPoGO = localMoves[moveId];
        if (moveId === "HIDDEN_POWER")  {
            for (let type of hpTypes) {
                quickmoves.push(moveId + "_" + type.toUpperCase())
            }
            continue;
        } else if (moveId === "WHEATHER_BALL") {
            for (let type of wbTypes) {
                quickmoves.push(moveId + "_" + type.toUpperCase())
            }
            continue;
        }
        if (!moveDataInPoGO) {
            continue;
        }
        
        if (moveDataInPoGO.energy){
            chargemoves.push(moveId);
        } else {
            quickmoves.push(moveId)
        }
    }

    // Ensure Special learn everything they need
    if(newPokemon.speciesId === "smeargle") {
        for (let move of Object.keys(localMoves)) {
            if (move.includes("BLASTOISE")){
                continue;
            }
            if (localMoves[move].energy){
                chargemoves.push(move);
            } else {
                quickmoves.push(move);
            }
        }
    } else if(newPokemon.speciesId === "pikachu_flying") {
        chargemoves.push("FLY")
    }

    // Add struggle to every Pokemon
    chargemoves.push("STRUGGLE");

    newPokemon.fastMoves = quickmoves;
    newPokemon.chargedMoves = chargemoves;
    newPokemon.hasMainSeriesChargeMoves = true;
    return newPokemon;
}

let promises: Array<Promise<any>> = []
let iterations = 0
for(let localPokemon of Object.keys(pokemonList)) {
    setTimeout(_ => {
        promises.push(loadPokemonMoveset(pokemonList[localPokemon]));
    }, iterations * 0)
    iterations++;
}

setTimeout(_ => Promise.all(promises).then(newPokemons => {
    let newPokemonObj: any = {};
    for(let pokemon of newPokemons) {
        newPokemonObj[pokemon.speciesId] = pokemon;
    }
    fs.writeFileSync("data/pokemonWithMainSeriesMoves.json", JSON.stringify(newPokemonObj))
}), iterations * 10)
*/