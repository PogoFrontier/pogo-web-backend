import fs from "fs"
import p from "./data/pokemon.json";
import m from "./data/moves.json";
import { Learnsets } from './data/learnsets'

let pokemonList: any = p
let localMoves: any = m;

const hpTypes = ['bug', 'dark', 'dragon', 'electric', 'fighting', 'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal', 'poison', 'psychic', 'rock', 'steel', 'water']
const wbTypes = ['fire', 'ice', 'rock', "normal", 'water']

for(let id of Object.keys(pokemonList)) {
    let pokemon = pokemonList[id];

    let key: string= pokemon.speciesId.replace("shadow", "").replace("therian", "").replace("incarnate", "").replace("galarian", "galar").replace("alolan", "alola").replace("_zen", "").replace("_standard", "").replace("female", "f").replace("male", "m").replace("_mega", "").replaceAll("_", "")
    if(key.startsWith("charizard")) {
        key = "charizard";
    }
    if(key.startsWith("pikachu")) {
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
    if (key.startsWith("rotom") && key !== "rotom"){
        const baseLearnset = Learnsets["rotom"];
        for (let move of Object.keys(baseLearnset)) {
            pokeWithLearnset[move] = baseLearnset[move]
        }
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
            let suffix = pokemon.speciesId.split("_")[1];
            if (!suffix) {
                suffix = "normal"
            }
            quickmoves.push("TECHNO_BLAST_" + suffix.toUpperCase())
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
    if(pokemon.speciesId === "pikachu_libre") {
        chargemoves.push("FLYING_PRESS")
    }

    pokemon.fastMoves = quickmoves;
    pokemon.chargedMoves = chargemoves;
    delete pokemon.eliteMoves
}

fs.writeFileSync("data/pokemonWithMainSeriesMoves.json", JSON.stringify(pokemonList))