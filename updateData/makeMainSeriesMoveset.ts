import fs from "fs"
import p from "../data/pokemon.json";
import { Pokedex as dex } from "../data/pokedex";
import m from "../data/moves.json";
import { Learnsets } from '../data/learnsets'
import { Pokedex } from '../data/pokedex'

let pokemonList: any = p
let localMoves: any = m;

const hpTypes = ['bug', 'dark', 'dragon', 'electric', 'fighting', 'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal', 'poison', 'psychic', 'rock', 'steel', 'water']
var keyCache = new Map();
var dexkeyCache = new Map();

for(let id of Object.keys(pokemonList)) {
    let pokemon = pokemonList[id];
    
    let collectedQuickmoves: string[] = []
    let collectedChargemoves: string[] = []

    let speciesId = pokemon.speciesId;
    while(true) {
        const { quickmoves, chargemoves } = getLearnset(speciesId, collectedQuickmoves, collectedChargemoves)
        collectedQuickmoves = quickmoves
        collectedChargemoves = chargemoves

        let key = getLearnSetKey(speciesId);
        const origin = dex[key].prevo || dex[key].baseSpecies
        if(!origin || ["Galar", "Alola"].includes(dex[key].forme) && !dex[key].prevo) {
            break;
        }
        speciesId = origin.toLowerCase().replace("-", "").replace(".", "").replace(" ", "").replace(":", "").replace("é", "e").replace("é", "e").replace("’", "");
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

function getPokedexKey(speciesId: string): string {
    if(dexkeyCache.has(speciesId)) {
        return dexkeyCache.get(speciesId);
    }

    let key: string = speciesId.replace("shadow", "").replace("overcast", "").replace("altered", "").replace("sky", "").replace("incarnate", "").replace("galarian", "galar").replace("alolan", "alola").replace("_standard", "").replace("female", "f").replace("male", "m").replace(/_/g, "")

    if (key.startsWith("pikachu")) {
        key = "pikachu";
    }
    if (key.startsWith("shellos")) {
        key = "shellos";
    }
    if (key.startsWith("gastrodon")) {
        key = "gastrodon";
    }
    if (key.startsWith("burmy")) {
        key = "burmy";
    }
    if (key.startsWith("wormadamplant")) {
        key = "wormadam";
    }
    if (key.startsWith("cherrimsunny")) {
        key = "cherrimsunshine";
    }
    if (key.startsWith("arceus")) {
        key = "arceus";
    }
    if (key.startsWith("keldeo")) {
        key = "keldeo";
    }
    if (key.startsWith("meloetta")) {
        key = "meloetta";
    }
    if (key.startsWith("pyroar")) {
        key = "pyroar";
    }
    if (key.startsWith("pumpkaboo")) {
        key = "pumpkaboo";
    }
    if (key.startsWith("gourgeist")) {
        key = "gourgeist";
    }
    if (key.startsWith("toxtricity")) {
        key = "toxtricity";
    }
    if (key.startsWith("zacian")) {
        key = "zacian";
    }
    if (key.startsWith("zamazenta")) {
        key = "zamazenta";
    }
    if (key.startsWith("sinistea")) {
        key = "sinistea";
    }
    if (key.startsWith("polteageist")) {
        key = "polteageist";
    }
    if (key.startsWith("calyrex")) {
        key = "calyrex";
    }
    if (key.startsWith("indeedee")) {
        key = "indeedee";
    }
    if (key.startsWith("morpeko")) {
        key = "morpeko";
    }
    if (key.startsWith("eternatus")) {
        key = "eternatus";
    }
    if (key.startsWith("urshifu")) {
        key = "urshifu";
    }
    if (key.startsWith("eiscue")) {
        key = "eiscue";
    }

    dexkeyCache.set(speciesId, key);
    return key;
}

function getLearnSetKey(speciesId: string): string {
    // Read from cache
    if(keyCache.has(speciesId)) {
        return keyCache.get(speciesId);
    }

    // Trim speciesId to match Pokémon Showdown
    let key = getPokedexKey(speciesId);
    key = key.replace("therian", "")
    if (!["zamazenta"].includes(key)) {
        key = key.replace("zen", "")
    }
    if (!["mrmimegalar", "meganium", "yanmega"].includes(key)) {
        key = key.replace("mega", "")
    }
    if (key.startsWith("charizard")) {
        key = "charizard";
    }
    if (key.startsWith("mewtwo")) {
        key = "mewtwo";
    }
    if(key.startsWith("castform")) {
        key = "castform";
    }
    if (key.startsWith("cherrim")) {
        key = "cherrim";
    }
    if (key.startsWith("deoxys")) {
        key = "deoxys";
    }
    if (key.startsWith("giratina")) {
        key = "giratina";
    }
    if (key.startsWith("shaymin")) {
        key = "shaymin";
    }
    if (key.startsWith("genesect")) {
        key = "genesect";
    }
    if (key.startsWith("hoopa")) {
        key = "hoopa";
    }

    // Save progress and return
    keyCache.set(speciesId, key);
    return key;
}

function getLearnset(speciesId: string, quickmoves: string[], chargemoves: string[]) {
    let key = getLearnSetKey(speciesId);

    let pokeWithLearnset = Learnsets[key];
    if (!pokeWithLearnset || !pokeWithLearnset.learnset) {
        console.error("Unidentified pokemon " + key + ". SpeciesId: " + speciesId);
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
            if (chargemoves.some(chargemove => chargemove.startsWith("WEATHER_BALL"))) {
                continue
            }
            for (let wb of getWeatherBalls(speciesId)) {
                chargemoves.push(wb);
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

function getWeatherBalls(speciesId: string): string[] {
    if(speciesId.endsWith("_sunny")) {
        return ["WEATHER_BALL_FIRE"];
    }
    if (speciesId.endsWith("_rainy")) {
        return ["WEATHER_BALL_WATER"];
    }
    if (speciesId.endsWith("_snowy")) {
        return ["WEATHER_BALL_ICE"];
    }

    const key = getPokedexKey(speciesId)
    if (!Pokedex[key]?.abilities) {
        console.error("Unidentified pokemon for weather balls " + key + ". SpeciesId: " + speciesId);
        process.exit(1);
    }
    const abilities: string[] = Object.values(Pokedex[key].abilities);
    let weatherBalls: string[] = [];

    for (const ability of abilities) {
        if (!weatherBalls.includes("WEATHER_BALL_FIRE") && ["Chlorophyll", "Desolate Land", "Drought", "Harvest", "Leaf Guard", "Solar Power"].includes(ability)) {
            weatherBalls.push("WEATHER_BALL_FIRE")
        }
        if (!weatherBalls.includes("WEATHER_BALL_ICE") && ["Ice Body", "Ice Face", "Slush Rush", "Snow Cloak", "Snow Warning"].includes(ability)) {
            weatherBalls.push("WEATHER_BALL_ICE")
        }
        if (!weatherBalls.includes("WEATHER_BALL_NORMAL") && ["Air Lock", "Cloud Nine", "Delta Stream", "Flower Gift", "Forecast"].includes(ability)) {
            weatherBalls.push("WEATHER_BALL_NORMAL")
        }
        if (!weatherBalls.includes("WEATHER_BALL_ROCK") && ["Flower Gift", "Forecast", "Sand Force", "Sand Rush", "Sand Spit", "Sand Stream", "Sand Veil"].includes(ability)) {
            weatherBalls.push("WEATHER_BALL_ROCK")
        }
        if (!weatherBalls.includes("WEATHER_BALL_WATER") && ["Drizzle", "Hydration", "Primordial Sea", "Rain Dish", "Swift Swim"].includes(ability)) {
            weatherBalls.push("WEATHER_BALL_WATER")
        }
    }

    if(!weatherBalls.length) {
        weatherBalls.push("WEATHER_BALL_NORMAL");
    }

    return weatherBalls
}

fs.writeFileSync("data/pokemonWithMainSeriesMoves.json", JSON.stringify(pokemonList, null, 2))