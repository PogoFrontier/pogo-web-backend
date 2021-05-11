import fs from "fs"
import p from "../data/pokemon.json";
import npm_pokemon from 'pokemon'

//Data imported from https://github.com/sindresorhus/pokemon/

//Convert raw data to objects with english name as key
let newen : {[key : string]:any} = {};
let newfr : {[key : string]:any} = {};
let newde : {[key : string]:any} = {};
let newja : {[key : string]:any} = {};
let newko : {[key : string]:any} = {};
let newru : {[key : string]:any} = {};
let newzh_hans : {[key : string]:any} = {};
let newzh_hant : {[key : string]:any} = {};

let new_pokemon : {[key : string]:any} = p

const de = npm_pokemon.all('de')
const fr = npm_pokemon.all('fr')
const en = npm_pokemon.all('en')
const ja = npm_pokemon.all('ja')
const ko = npm_pokemon.all('ko')
const ru = npm_pokemon.all('ru')
const zh_hans = npm_pokemon.all('zh-Hans')
const zh_hant = npm_pokemon.all('zh-Hant')

let languages = ["de", "fr", "ja","ko", "ru", "zh_hans", "zh_hant"]

const parseName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[()]/g, '')
      .replace(/\s/g, '_')
      .replace(/-/g, '_')
      .replace(/♀/g, '_female')
      .replace(/♂/g, '_male')
      .replace(/\./g, '')
      .replace(/\'/g, '')
      .replace(/’/g, '')
}

for (const pokemon in new_pokemon){
    new_pokemon[pokemon].speciesName = []
}

languages.forEach(lang => {
    let object = "new" + lang;
    let i = 0
    for (let i = 0; i < eval(lang).length; i++) {
        eval(object)[en[i]] = eval(lang)[i];
        //TODO: integrate these in translator project
        //special formatting needed for burmy
        let speciesnames = []
        if(parseName(en[i]).startsWith("burmy")){
            new_pokemon[parseName(en[i]) + "_plant"].speciesName[lang] = eval(lang)[i] + " (plant)"
            new_pokemon[parseName(en[i]) + "_trash"].speciesName[lang] = eval(lang)[i] + " (trash)"
            new_pokemon[parseName(en[i]) + "_sandy"].speciesName[lang] = eval(lang)[i] + " (sandy)"
            continue;
        }   
        //special formatting needed for wormadam
        if(parseName(en[i]).startsWith("wormadam")){
            new_pokemon[parseName(en[i]) + "_plant"].speciesName[lang] = eval(lang)[i] + " (Plant)"
            new_pokemon[parseName(en[i]) + "_trash"].speciesName[lang] = eval(lang)[i] + " (Trash)"
            new_pokemon[parseName(en[i]) + "_sandy"].speciesName[lang] = eval(lang)[i] + " (Sandy)"
            continue;
        }   
        //special formatting needed for cherrim
        if(parseName(en[i]).startsWith("cherrim")){
            new_pokemon[parseName(en[i]) + "_sunny"].speciesName[lang] = eval(lang)[i] + " (Sunny)"
            new_pokemon[parseName(en[i]) + "_overcast"].speciesName[lang] = eval(lang)[i] + " (Overcast)"
            continue;
        } 
        //special formatting needed for shellos
        if(parseName(en[i]).startsWith("shellos")){
            new_pokemon[parseName(en[i]) + "_east_sea"].speciesName[lang] = eval(lang)[i] + " (East)"
            new_pokemon[parseName(en[i]) + "_west_sea"].speciesName[lang] = eval(lang)[i] + " (West)"
            continue;
        } 
        //special formatting needed for gastrodon
        if(parseName(en[i]).startsWith("gastrodon")){
            new_pokemon[parseName(en[i]) + "_east_sea"].speciesName[lang] = eval(lang)[i] + " (East)"
            new_pokemon[parseName(en[i]) + "_west_sea"].speciesName[lang] = eval(lang)[i] + " (West)"
            continue;
        } 
        //special formatting needed for giratina
        if(parseName(en[i]).startsWith("giratina")){
            new_pokemon[parseName(en[i]) + "_origin"].speciesName[lang] = eval(lang)[i] + " (Origin)"
            new_pokemon[parseName(en[i]) + "_altered"].speciesName[lang] = eval(lang)[i] + " (Altered)"
            continue;
        } 
        //special formatting needed for shaymin
        if(parseName(en[i]).startsWith("shaymin")){
            new_pokemon[parseName(en[i]) + "_land"].speciesName[lang] = eval(lang)[i] + " (Land)"
            continue;
        } 
        //special formatting needed for darmanitan
        if(parseName(en[i]).startsWith("darmanitan")){
            new_pokemon[parseName(en[i]) + "_galarian_zen"].speciesName[lang] = eval(lang)[i] + " (Galarian zen)"
            continue;
        } 
        //special formatting needed for tornadus
        if(parseName(en[i]).startsWith("tornadus")){
            new_pokemon[parseName(en[i]) + "_therian"].speciesName[lang] = eval(lang)[i] + " (Therian)"
            new_pokemon[parseName(en[i]) + "_incarnate"].speciesName[lang] = eval(lang)[i] + " (Incarnate)"
            continue;
        } 
        //special formatting needed for thundurus
        if(parseName(en[i]).startsWith("thundurus")){
            new_pokemon[parseName(en[i]) + "_therian"].speciesName[lang] = eval(lang)[i] + " (Therian)"
            new_pokemon[parseName(en[i]) + "_incarnate"].speciesName[lang] = eval(lang)[i] + " (Incarnate)"
            continue;
        } 
        //special formatting needed for landorus
        if(parseName(en[i]).startsWith("landorus")){
            new_pokemon[parseName(en[i]) + "_therian"].speciesName[lang] = eval(lang)[i] + " (Therian)"
            new_pokemon[parseName(en[i]) + "_incarnate"].speciesName[lang] = eval(lang)[i] + " (Incarnate)"
            continue;
        } 
        //special formatting needed for kyurem
        if(parseName(en[i]).startsWith("kyurem")){
            new_pokemon[parseName(en[i]) + "_black"].speciesName[lang] = eval(lang)[i] + " (Black)"
            new_pokemon[parseName(en[i]) + "_white"].speciesName[lang] = eval(lang)[i] + " (White)"
        } 
        //special formatting needed for keldeo
        if(parseName(en[i]).startsWith("keldeo")){
            new_pokemon[parseName(en[i]) + "_ordinary"].speciesName[lang] = eval(lang)[i] + " (Ordinary)"
            new_pokemon[parseName(en[i]) + "_resolute"].speciesName[lang] = eval(lang)[i] + " (Resolute)"
            continue;
        } 
        //special formatting needed for meloetta
        if(parseName(en[i]).startsWith("meloetta")){
            new_pokemon[parseName(en[i]) + "_aria"].speciesName[lang] = eval(lang)[i] + " (Aria)"
            new_pokemon[parseName(en[i]) + "_pirouette"].speciesName[lang] = eval(lang)[i] + " (Pirouette)"
            continue;
        } 
        //special formatting needed for genesect
        if(parseName(en[i]).startsWith("genesect")){
            new_pokemon[parseName(en[i]) + "_burn"].speciesName[lang] = eval(lang)[i] + " (Burn)"
            new_pokemon[parseName(en[i]) + "_chill"].speciesName[lang] = eval(lang)[i] + " (Chill)"
            new_pokemon[parseName(en[i]) + "_douse"].speciesName[lang] = eval(lang)[i] + " (Douse)"
            new_pokemon[parseName(en[i]) + "_shock"].speciesName[lang] = eval(lang)[i] + " (Shock)"
        }
        
        //Pokemon not yet added to the gamemaster, gen7+
        if(!new_pokemon[parseName(en[i])]){
            //console.log(parseName(en[i]))
            continue;
        }
        new_pokemon[parseName(en[i])].speciesName[lang] = eval(lang)[i]
    }
    //Gen 8 pokes aren't added to the api yet, manual override
    new_pokemon.runerigus.speciesName[lang] = "Runerigus"
    new_pokemon.mr_rime.speciesName[lang] = "Mr. Rime"
    new_pokemon.sirfetchd.speciesName[lang] = "Sirfetch'd"
    new_pokemon.perrserker.speciesName[lang] = "Perrserker"
    new_pokemon.obstagoon.speciesName[lang] = "Obstagoon"

})

fs.writeFileSync("../data/pokemon.json", JSON.stringify(new_pokemon, null, 2))