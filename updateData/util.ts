var keyCache = new Map();
var dexkeyCache = new Map();

export function getPokedexKey(speciesId: string): string {
    if (dexkeyCache.has(speciesId)) {
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

export function getLearnSetKey(speciesId: string): string {
    // Read from cache
    if (keyCache.has(speciesId)) {
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
    if (key.startsWith("castform")) {
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