import fs from "fs"
import p from "../data/pokemon.json";
import { Pokedex as dex } from "../data/pokedex";
import m from "../data/moves.json";
import { Learnsets } from '../data/learnsets'

let pokemonList: any = p
let localMoves: any = m;

const hpTypes = ['bug', 'dark', 'dragon', 'electric', 'fighting', 'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal', 'poison', 'psychic', 'rock', 'steel', 'water']
const wbTypes = ['fire', 'ice', 'rock', "normal", 'water']

for(let id of Object.keys(pokemonList)) {
    let pokemon = pokemonList[id];

    // Adapt key to match pokemon showdown
    let key: string= pokemon.speciesId.replace("shadow", "").replace("therian", "").replace("incarnate", "").replace("galarian", "galar").replace("alolan", "alola").replace("_zen", "").replace("_standard", "").replace("female", "f").replace("male", "m").replace("_mega", "").replace(/_/g, "")
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
    if(key.startsWith("pyroar")) {
        key = "pyroar";
    }
    if(key.startsWith("hoopa")) {
        key = "hoopa";
    }
    if(key.startsWith("toxtricity")) {
        key = "toxtricity";
    }
    if(key.startsWith("zacian")) {
        key = "zacian";
    }
    if(key.startsWith("zamazenta")) {
        key = "zamazenta";
    }
    if(key.startsWith("sinistea")) {
        key = "sinistea";
    }
    if(key.startsWith("polteageist")) {
        key = "polteageist";
    }
    if(key.startsWith("calyrex")) {
        key = "calyrex";
    }
    if(key.startsWith("eiscue")) {
        key = "eiscue";
    }
    if(key.startsWith("indeedee")) {
        key = "indeedee";
    }
    if(key.startsWith("morpeko")) {
        key = "morpeko";
    }
    if(key.startsWith("eternatus")) {
        key = "eternatus";
    }
    if(key.startsWith("urshifu")) {
        key = "urshifu";
    }
    
    let collectedQuickmoves: string[] = []
    let collectedChargemoves: string[] = []

    while(true) {
        const { quickmoves, chargemoves } = getLearnsetsOfKey(key, collectedQuickmoves, collectedChargemoves)
        collectedQuickmoves = quickmoves
        collectedChargemoves = chargemoves

        const origin = dex[key].prevo || dex[key].baseSpecies
        if(!origin || ["Galar", "Alola"].includes(dex[key].forme) && !dex[key].prevo) {
            break;
        }
        key = origin.toLowerCase().replace("-", "").replace(".", "").replace(" ", "").replace(":", "").replace("é", "e").replace("é", "e").replace("’", "")
    }

    // Add special moves that don't appear in learnsets
    if (pokemon.speciesId.startsWith("Genesect")) {
        let suffix = pokemon.speciesId.split("_")[1];
        if (!suffix) {
            suffix = "normal"
        }
        collectedChargemoves.push("TECHNO_BLAST_" + suffix.toUpperCase())
        continue;
    }
    if(pokemon.speciesId === "smeargle") {
        for (let move of Object.keys(localMoves)) {
            if (move.includes("BLASTOISE")){
                continue;
            }
            if (localMoves[move].energy){
                collectedChargemoves.push(move);
            } else {
                collectedQuickmoves.push(move);
            }
        }
    } else {
        // Add struggle to every Pokemon
        collectedChargemoves.push("STRUGGLE");
    } 
    if(pokemon.speciesId === "pikachu_flying") {
        collectedChargemoves.push("FLY")
    }
    if(pokemon.speciesId === "pikachu_libre") {
        collectedChargemoves.push("FLYING_PRESS")
    }

    pokemon.fastMoves = collectedQuickmoves;
    pokemon.chargedMoves = collectedChargemoves;
    delete pokemon.eliteMoves
}

function getLearnsetsOfKey(key: string, quickmoves: string[], chargemoves: string[]) {

    let pokeWithLearnset = Learnsets[key];
    if (!pokeWithLearnset || !pokeWithLearnset.learnset) {
        console.error("Unidentified pokemon " + key);
        process.exit(1);
    }

    for (let move of Object.keys(pokeWithLearnset.learnset)) {
        let moveId: string | undefined = Object.keys(localMoves).find((moveId) => moveId.toLowerCase().replace("_", "").replace("_", "") === move);
        if(moveId && (quickmoves.includes(moveId) || chargemoves.includes(moveId))) {
            continue;
        }

        if (move === "hiddenpower") {
            if(quickmoves.includes("HIDDEN_POWER_NORMAL")) {
                continue
            }
            for (let type of hpTypes) {
                quickmoves.push("HIDDEN_POWER_" + type.toUpperCase())
            }
            continue;
        } else if (move === "weatherball") {
            if (chargemoves.includes("WEATHER_BALL_NORMAL")) {
                continue
            }
            for (let type of wbTypes) {
                chargemoves.push("WEATHER_BALL_" + type.toUpperCase())
            }
            continue;
        }
        if (!moveId) {
            continue;
        }

        let moveDataInPoGO = localMoves[moveId];

        if (moveDataInPoGO.energy) {
            chargemoves.push(moveId);
        } else {
            quickmoves.push(moveId)
        }
    }

    return {
        quickmoves,
        chargemoves
    }
}

fs.writeFileSync("data/pokemonWithMainSeriesMoves.json", JSON.stringify(pokemonList, null, 2))