import fs from "fs";
import https from "https";
import { getStrings } from "../actions/getTranslation";
import moves from "../data/moves.json";

//defining types for the movenames, language and name from pokeapi
interface Language {
    name: string;
}

interface Name {
    language: Language;
    name: string;
}

interface MoveNames {
    names: Name[];
}

//defining the move interface 
interface Move {
    moveId: string,
    name: string | { [language: string]: string, },
    abbreviation: string,
    type: string,
    power: number,
    energy: number,
    energyGain: number,
    cooldown: number;
    buffs?: number[],
    buffTarget: string,
    buffApplyChance: string,
}

const underScoreToUpperscore = (toReplace: string) => {
    return toReplace.replace(/_/g, "-").toLowerCase();
};

//defining a custom fetch function to promisify the get operation
const fetch = async <T>(url: string): Promise<T> => {
    const promisified: Promise<T> = new Promise<T>((resolve, reject) => {
        https.get(url, (res) => {
            let body = "";
            res.on("data", (data) => body += data.toString());
            res.on("end", () => {
                try {
                    const resolvedValue: T = JSON.parse(body) as T;
                    resolve(resolvedValue);
                } catch (e) {
                    reject();
                }
            });
        }
        );
    });
    return promisified;
};

const POKE_API_BASE_URL: string = "https://pokeapi.co/api/v2/move/";
//IIFE for async
(async () => {
    //recovering the translation for every language supported by the api
    const languages = ["de", "fr", "en", "es", "th", "ja", "ko", "ru", "zh_hans", "zh_hant"];
    const translations = {};
    for (let lang of languages) {
        const strings = await getStrings(lang);
        translations[underScoreToUpperscore(lang)] = strings;
    }
    for (let [moveId, anyMove] of Object.entries(moves)) {
        const move: Move = anyMove as Move;
        //replace every underscore with an upperscore
        let fixedName: string = underScoreToUpperscore(moveId);
        //console log to check advancing
        console.log(`Updating move ${fixedName}...`);
        //defining the new name object
        const newNameValue = {};
        let toAppendLater = "";
        //adding a bunch of exceptions for specific moves
        if (fixedName.startsWith("hidden-power-")) {
            toAppendLater = fixedName.replace("hidden-power-", "");
            fixedName = "hidden-power";
        }
        if (fixedName.endsWith("-blastoise")) {
            toAppendLater = "(Blastoise)";
            fixedName = fixedName.replace("-blastoise", "");
            fixedName = fixedName.replace("-fast", "");
        }
        if (fixedName === "super-power") {
            fixedName = "superpower";
        }
        if (fixedName === "vice-grip") {
            fixedName = "vise-grip";
        }
        if (fixedName.startsWith("techno-blast-")) {
            toAppendLater = fixedName.replace("techno-blast-", "");
            fixedName = "techno-blast";
        }
        if (fixedName.startsWith("weather-ball-")) {
            toAppendLater = fixedName.replace("weather-ball-", "");
            fixedName = "weather-ball";
        }
        if (fixedName.startsWith("wrap-")) {
            toAppendLater = fixedName.replace("wrap-", "");
            fixedName = "wrap";
        }
        try {
            //fetching the translations
            const moveTranslations: MoveNames = await fetch(`${POKE_API_BASE_URL}${fixedName}`);
            //looping over the translation languages
            for (let translation of moveTranslations.names) {
                //if there's not a toAppendLater we just recover every language we can
                //if there is one we recover only the languages we have translations for on lokalise
                if (!toAppendLater || translations[translation.language.name]) {
                    //we then set the new value to the translation name concatenated with
                    //either the translated version of toAppendLater from lokalise, the english
                    //version of it or if neither of those apply we simply concat toAppendLater 
                    newNameValue[translation.language.name] = `${translation.name}${toAppendLater ? ` ${translations[translation.language.name][toAppendLater] || translations[translation.language.name]["en"] || toAppendLater}` : ''}`;
                }
            }
            //setting the new value
            moves[moveId] = {
                ...move,
                name: newNameValue,
            };
        } catch (e) {
            //if there's some error we log the fixed name so that we can take a look manually
            console.log(`There was a problem with ${fixedName}`);
        }
    }
    //finally we write everything into moves
    fs.writeFileSync("data/moves.json", JSON.stringify(moves, null, 2));
})();

