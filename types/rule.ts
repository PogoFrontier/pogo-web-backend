export interface Rule {
    maxCP: number
    maxLevel: number
    maxBestBuddy: number
    maxMega: number
    include?: Selector[]
    exclude?: Selector[]
    teamPattern?: SlotRule[]
    flags?: Flags
    advancedOptions?:  AdvancedOptions
}

export type RuleDescription = {
    name: string,
    advancedOptions?:  AdvancedOptions
} | Rule

export function parseToRule(object: RuleDescription): Rule {
    if (!instanceOfRule(object)) {
        let rule = RULESETS.get(object.name)
        if (!rule) {
            throw new Error(`Format ${object.name} doesn't exist.`);
        }
        rule.advancedOptions = object.advancedOptions;
        object = rule;
    }

    return object;
}

function instanceOfRule(object: any): object is Rule {
    return 'maxCP' in object && 'maxLevel' in object && 'maxBestBuddy' in object && 'maxMega' in object;
}

export interface Selector {
    filterType: "type" | "tag" | "id" | "dex"
    values: string[]
}

export interface SlotRule {
    include?: Selector[]
    exclude?: Selector[]
}

export interface AdvancedOptions {
}

export interface Flags {
    /** If true, you can't use two Pokémon with the same dex number */
    speciesClauseByDex?: boolean
    /** If true, you can't use two Pokémon with the same dex number and form*/
    speciesClauseByForm?: boolean
    /** If true, you can't use two Pokémon that share one type */
    typeClause?: boolean
}

export const RULESET_NAMES = {
    OPEN_GREAT_LEAGUE: "Great",
    OPEN_ULTRA_LEAGUE: "Ultra",
    PC_ULTRA_LEAGUE: "PC_ULTRA_LEAGUE",
    OPEN_MASTER_LEAGUE: "Master",
    PC_MASTER_LEAGUE: "PC_MASTER_LEAGUE",
    OPEN_MASTER_LEAGUE_CLASSIC: "OPEN_MASTER_LEAGUE_CLASSIC",
    PC_MASTER_LEAGUE_CLASSIC: "PC_MASTER_LEAGUE_CLASSIC",
    
    PRISMATIC: "PRISMATIC",
}

export const RULESETS = new Map<string, Rule>([
    [RULESET_NAMES.OPEN_GREAT_LEAGUE, {
        maxCP: 1500,
        maxLevel: 50,
        maxBestBuddy: 1,
        maxMega: 1,
        flags: {
            speciesClauseByDex: true
        }
    }],
    [RULESET_NAMES.OPEN_ULTRA_LEAGUE, {
        maxCP: 2500,
        maxLevel: 50,
        maxBestBuddy: 1,
        maxMega: 1,
        flags: {
            speciesClauseByDex: true
        }
    }],
    [RULESET_NAMES.PC_ULTRA_LEAGUE, {
        maxCP: 2500,
        maxLevel: 50,
        maxBestBuddy: 1,
        maxMega: 1,
        flags: {
            speciesClauseByDex: true
        },
        exclude: [{
            filterType: "tag",
            values: ["legendary", "mythical"]
        }]
    }],
    [RULESET_NAMES.OPEN_MASTER_LEAGUE, {
        maxCP: 10000,
        maxLevel: 50,
        maxBestBuddy: 1,
        maxMega: 1,
        flags: {
            speciesClauseByDex: true
        }
    }],
    [RULESET_NAMES.PC_MASTER_LEAGUE, {
        maxCP: 10000,
        maxLevel: 50,
        maxBestBuddy: 1,
        maxMega: 1,
        flags: {
            speciesClauseByDex: true
        },
        exclude: [{
            filterType: "tag",
            values: ["legendary", "mythical"]
        }]
    }],
    [RULESET_NAMES.OPEN_MASTER_LEAGUE_CLASSIC, {
        maxCP: 10000,
        maxLevel: 40,
        maxBestBuddy: 1,
        maxMega: 1,
        flags: {
            speciesClauseByDex: true
        }
    }],
    [RULESET_NAMES.PC_MASTER_LEAGUE_CLASSIC, {
        maxCP: 10000,
        maxLevel: 40,
        maxBestBuddy: 1,
        maxMega: 1,
        flags: {
            speciesClauseByDex: true
        },
        exclude: [{
            filterType: "tag",
            values: ["legendary", "mythical"]
        }]
    }],
    
    [RULESET_NAMES.PRISMATIC, {
        maxCP: 1500,
        maxLevel: 50,
        maxBestBuddy: 1,
        maxMega: 1,
        flags: {
            speciesClauseByDex: true
        },
        teamPattern: [
            {
               "include":[
                  {
                     "filterType":"id",
                     "values":[
                        "persian_alolan",
                        "blastoise",
                        "boldore",
                        "carracosta",
                        "croconaw",
                        "cryogonal",
                        "dewott",
                        "empoleon",
                        "feraligatr",
                        "frogadier",
                        "gabite",
                        "gigalith",
                        "glaceon",
                        "gloom",
                        "greninja",
                        "gyarados",
                        "huntail",
                        "jumpluff",
                        "kingdra",
                        "lanturn",
                        "lucario",
                        "lumineon",
                        "luxio",
                        "luxray",
                        "marshtomp",
                        "masquerain",
                        "metagross",
                        "metang",
                        "nidoqueen",
                        "omanyte",
                        "omastar",
                        "palpitoad",
                        "prinplup",
                        "quagsire",
                        "castform_rainy",
                        "rampardos",
                        "regice",
                        "salamence",
                        "sandslash_alolan",
                        "seadra",
                        "sealeo",
                        "seismitoad",
                        "simipour",
                        "suicune",
                        "swellow",
                        "swoobat",
                        "tangela",
                        "tangrowth",
                        "vaporeon",
                        "wailmer",
                        "wailord",
                        "walrein",
                        "wartortle"
                     ]
                  }
               ]
            },
            {
               "include":[
                  {
                     "filterType":"id",
                     "values":[
                        "ariados",
                        "bisharp",
                        "blaziken",
                        "braixen",
                        "braviary",
                        "camerupt",
                        "charizard",
                        "charmeleon",
                        "combusken",
                        "crawdaunt",
                        "crustle",
                        "darmanitan",
                        "delphox",
                        "electrode",
                        "emboar",
                        "fletchinder",
                        "heatmor",
                        "kingler",
                        "kricketune",
                        "krookodile",
                        "ledian",
                        "magcargo",
                        "magmar",
                        "magmortar",
                        "octillery",
                        "parasect",
                        "pignite",
                        "porygon_z",
                        "porygon2",
                        "scizor",
                        "scolipede",
                        "seaking",
                        "simisear",
                        "solrock",
                        "sunny Castform",
                        "talonflame",
                        "vileplume",
                        "wormadam_plant",
                        "yanma"
                     ]
                  }
               ]
            },
            {
               "include":[
                  {
                     "filterType":"id",
                     "values":[
                        "amoonguss",
                        "ampharos",
                        "archeops",
                        "beartic",
                        "beedrill",
                        "butterfree",
                        "dewgong",
                        "dunsparce",
                        "electabuzz",
                        "electivire",
                        "emolga",
                        "exeggutor",
                        "froslass",
                        "galarian Rapidash",
                        "gallade",
                        "gardevoir",
                        "girafarig",
                        "hypno",
                        "jolteon",
                        "leavanny",
                        "linoone",
                        "lunatone",
                        "manectric",
                        "meowstic_female",
                        "meowstic",
                        "minun",
                        "mothim",
                        "ninetales",
                        "ninjask",
                        "pachirisu",
                        "pelipper",
                        "persian",
                        "plusle",
                        "ponyta",
                        "quilava",
                        "raichu",
                        "rapidash",
                        "shelgon",
                        "cstform_snowy",
                        "sunflora",
                        "swanna",
                        "togekiss",
                        "togetic",
                        "typhlosion",
                        "vespiquen",
                        "zangoose",
                        "zapdos"
                     ]
                  }
               ]
            },
            {
               "include":[
                  {
                     "filterType":"id",
                     "values":[
                        "banette",
                        "bayleef",
                        "bellossom",
                        "breloom",
                        "bronzong",
                        "celebi",
                        "chandelure",
                        "chesnaught",
                        "claydol",
                        "cradily",
                        "dusclops",
                        "dustox",
                        "flygon",
                        "garbodor",
                        "golurk",
                        "grimer_alolan",
                        "grotle",
                        "grovyle",
                        "honchkrow",
                        "houndoom",
                        "ivysaur",
                        "leafeon",
                        "lilligant",
                        "ludicolo",
                        "maractus",
                        "mawile",
                        "meganium",
                        "muk_alolan",
                        "munchlax",
                        "murkrow",
                        "quilladin",
                        "raticate_alolan",
                        "roselia",
                        "roserade",
                        "sceptile",
                        "scyther",
                        "serperior",
                        "servine",
                        "simisage",
                        "sneasel",
                        "snorlax",
                        "torterra",
                        "tyranitar",
                        "victreebel",
                        "weavile",
                        "weepinbell",
                        "whimsicott",
                        "wormadam_plant",
                        "xatu",
                        "yanmega",
                        "zebstrika"
                     ]
                  }
               ]
            },
            {
               "include":[
                  {
                     "filterType":"id",
                     "values":[
                        "alakazam",
                        "alomomola",
                        "arcanine",
                        "bibarel",
                        "cherrim_sunshine",
                        "corsola",
                        "dragonite",
                        "dugtrio",
                        "fearow",
                        "floatzel",
                        "furret",
                        "golem",
                        "graveler",
                        "hariyama",
                        "hippowdon",
                        "hitmonchan",
                        "hitmontop",
                        "infernape",
                        "kabutops",
                        "kangaskhan",
                        "litleo",
                        "mamoswine",
                        "marowak",
                        "milotic",
                        "monferno",
                        "noctowl",
                        "pidgeot",
                        "piloswine",
                        "pinsir",
                        "porygon",
                        "pyroar",
                        "raichu (Alolan)",
                        "shiftry",
                        "slowbro",
                        "slowking",
                        "staraptor",
                        "sudowoodo",
                        "ursaring",
                        "wormadam_sandy"
                     ]
                  }
               ]
            },
            {
               "include":[
                  {
                     "filterType":"id",
                     "values":[
                        "aerodactyl",
                        "aggron",
                        "arbok",
                        "armaldo",
                        "cinccino",
                        "cloyster",
                        "crobat",
                        "delcatty",
                        "donphan",
                        "drapion",
                        "drifblim",
                        "durant",
                        "escavalier",
                        "espeon",
                        "excadrill",
                        "ferrothorn",
                        "forretress",
                        "gengar",
                        "glalie",
                        "gligar",
                        "gliscor",
                        "golbat",
                        "golem_alolan",
                        "gothitelle",
                        "granbull",
                        "graveler_alolan",
                        "grimer",
                        "haunter",
                        "klinklang",
                        "lairon",
                        "liepard",
                        "machoke",
                        "magneton",
                        "magnezone",
                        "mantine",
                        "mightyena",
                        "misdreavus",
                        "mismagius",
                        "muk",
                        "nidoking",
                        "noivern",
                        "probopass",
                        "purugly",
                        "qwilfish",
                        "relicanth",
                        "rhydon",
                        "rhyperior",
                        "skuntank",
                        "spiritomb",
                        "steelix",
                        "swalot",
                        "venomoth",
                        "weezing"
                     ]
                  }
               ]
            }
         ]
    }],
]);