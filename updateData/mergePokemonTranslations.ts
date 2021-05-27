import fs from "fs"
import p from "../data/pokemon.json";
import npm_pokemon from 'pokemon'
import { getStrings } from "../actions/getTranslation";

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

let languages = ["de", "fr","en", "ja","ko", "ru", "zh_hans", "zh_hant"]

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
const mapLang = (lang :string) => {
    const toReturn = ["German", "French", "English", "English", "English", "English", "English", "English"]
    return toReturn[languages.indexOf(lang)]
}
async function mergePokemon() {
    for (const pokemon in new_pokemon){
        new_pokemon[pokemon].speciesName = {}
    }

    for (let index = 0; index < languages.length; index++) {
        const lang = languages[index]
        let strings : any= {}
        await getStrings(mapLang(lang)).then(s => strings = s)
        let object = "new" + lang;
        for (let i = 0; i < eval(lang).length; i++) {
            eval(object)[en[i]] = eval(lang)[i];
            //TODO: integrate these in translator project
            //special formatting needed for burmy
           
            if(parseName(en[i]).startsWith("burmy")){
                new_pokemon[parseName(en[i]) + "_plant"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_plant
                new_pokemon[parseName(en[i]) + "_trash"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_trash
                new_pokemon[parseName(en[i]) + "_sandy"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_sandy
                continue;
            }   
            //special formatting needed for wormadam
            if(parseName(en[i]).startsWith("wormadam")){
                new_pokemon[parseName(en[i]) + "_plant"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_plant
                new_pokemon[parseName(en[i]) + "_trash"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_trash
                new_pokemon[parseName(en[i]) + "_sandy"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_sandy
                continue;
            }   
            //special formatting needed for cherrim
            if(parseName(en[i]).startsWith("cherrim")){
                new_pokemon[parseName(en[i]) + "_sunny"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_sunny
                new_pokemon[parseName(en[i]) + "_overcast"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_overcast
                continue;
            } 
            //special formatting needed for shellos
            if(parseName(en[i]).startsWith("shellos")){
                new_pokemon[parseName(en[i]) + "_east_sea"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_east
                new_pokemon[parseName(en[i]) + "_west_sea"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_west
                continue;
            } 
            //special formatting needed for gastrodon
            if(parseName(en[i]).startsWith("gastrodon")){
                new_pokemon[parseName(en[i]) + "_east_sea"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_east
                new_pokemon[parseName(en[i]) + "_west_sea"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_west
                continue;
            } 
            //special formatting needed for giratina
            if(parseName(en[i]).startsWith("giratina")){
                new_pokemon[parseName(en[i]) + "_origin"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_origin
                new_pokemon[parseName(en[i]) + "_altered"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_altered
                continue;
            } 
            //special formatting needed for shaymin
            if(parseName(en[i]).startsWith("shaymin")){
                new_pokemon[parseName(en[i]) + "_land"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_land
                new_pokemon[parseName(en[i]) + "_sky"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_sky
                continue;
            } 
            //special formatting needed for darmanitan
            if(parseName(en[i]).startsWith("darmanitan")){
                new_pokemon[parseName(en[i]) + "_galarian_zen"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_galarian.slice(0,-1) + " " + strings.pokemon_zen.substring(1)
                new_pokemon[parseName(en[i]) + "_galarian_standard"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_galarian.slice(0,-1) + " " + strings.pokemon_standard.substring(1)
                new_pokemon[parseName(en[i]) + "_standard"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_standard
                new_pokemon[parseName(en[i]) + "_zen"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_zen
                continue;
            } 
            //special formatting needed for tornadus
            if(parseName(en[i]).startsWith("tornadus")){
                new_pokemon[parseName(en[i]) + "_therian"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_therian
                new_pokemon[parseName(en[i]) + "_incarnate"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_incarnate
                continue;
            } 
            //special formatting needed for thundurus
            if(parseName(en[i]).startsWith("thundurus")){
                new_pokemon[parseName(en[i]) + "_therian"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_therian
                new_pokemon[parseName(en[i]) + "_incarnate"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_incarnate
                continue;
            } 
            //special formatting needed for landorus
            if(parseName(en[i]).startsWith("landorus")){
                new_pokemon[parseName(en[i]) + "_therian"].speciesName[lang] = eval(lang)[i] + " " +strings.pokemon_therian
                new_pokemon[parseName(en[i]) + "_incarnate"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_incarnate
                continue;
            } 
            //special formatting needed for kyurem
            if(parseName(en[i]).startsWith("kyurem")){
                new_pokemon[parseName(en[i]) + "_black"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_black
                new_pokemon[parseName(en[i]) + "_white"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_white
            } 
            //special formatting needed for keldeo
            if(parseName(en[i]).startsWith("keldeo")){
                new_pokemon[parseName(en[i]) + "_ordinary"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_ordinary
                new_pokemon[parseName(en[i]) + "_resolute"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_resolute
                continue;
            } 
            //special formatting needed for meloetta
            if(parseName(en[i]).startsWith("meloetta")){
                new_pokemon[parseName(en[i]) + "_aria"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_aria
                new_pokemon[parseName(en[i]) + "_pirouette"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_pirouette
                continue;
            } 
            //special formatting needed for genesect
            if(parseName(en[i]).startsWith("genesect")){
                new_pokemon[parseName(en[i]) + "_burn"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_burn
                new_pokemon[parseName(en[i]) + "_chill"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_chill
                new_pokemon[parseName(en[i]) + "_douse"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_douse
                new_pokemon[parseName(en[i]) + "_shock"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_shock
            }
            //special formatting needed for the god almighty 🙏 
            if(parseName(en[i]).startsWith("arceus")){
                new_pokemon[parseName(en[i]) + "_bug"].speciesName[lang] = eval(lang)[i] + " (" + strings.bug + ")"
                new_pokemon[parseName(en[i]) + "_dragon"].speciesName[lang] = eval(lang)[i] + " (" + strings.dragon + ")"
                new_pokemon[parseName(en[i]) + "_dark"].speciesName[lang] = eval(lang)[i] + " (" + strings.dark + ")"
                new_pokemon[parseName(en[i]) + "_electric"].speciesName[lang] = eval(lang)[i] + " (" + strings.electric + ")"
                new_pokemon[parseName(en[i]) + "_fairy"].speciesName[lang] = eval(lang)[i] + " (" + strings.fairy + ")"
                new_pokemon[parseName(en[i]) + "_fighting"].speciesName[lang] = eval(lang)[i] + " (" + strings.fighting + ")"
                new_pokemon[parseName(en[i]) + "_fire"].speciesName[lang] = eval(lang)[i] + " (" + strings.fire + ")"
                new_pokemon[parseName(en[i]) + "_flying"].speciesName[lang] = eval(lang)[i] + " (" + strings.flying + ")"
                new_pokemon[parseName(en[i]) + "_ghost"].speciesName[lang] = eval(lang)[i] + " (" + strings.ghost + ")"
                new_pokemon[parseName(en[i]) + "_grass"].speciesName[lang] = eval(lang)[i] + " (" + strings.grass + ")"
                new_pokemon[parseName(en[i]) + "_ground"].speciesName[lang] = eval(lang)[i] + " (" + strings.ground + ")"
                new_pokemon[parseName(en[i]) + "_ice"].speciesName[lang] = eval(lang)[i] + " (" + strings.ice + ")"
                new_pokemon[parseName(en[i]) + "_poison"].speciesName[lang] = eval(lang)[i] + " (" + strings.poison + ")"
                new_pokemon[parseName(en[i]) + "_psychic"].speciesName[lang] = eval(lang)[i] + " (" + strings.psychic + ")"
                new_pokemon[parseName(en[i]) + "_rock"].speciesName[lang] = eval(lang)[i] + " (" + strings.rock + ")"
                new_pokemon[parseName(en[i]) + "_steel"].speciesName[lang] = eval(lang)[i] + " (" + strings.steel + ")"
                new_pokemon[parseName(en[i]) + "_water"].speciesName[lang] = eval(lang)[i] + " (" + strings.water + ")"
            } 
            //special formatting needed for rotom
            if(parseName(en[i]).startsWith("rotom")){
                new_pokemon[parseName(en[i]) + "_wash"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_wash
                new_pokemon[parseName(en[i]) + "_fan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_fan
                new_pokemon[parseName(en[i]) + "_mow"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mow
                new_pokemon[parseName(en[i]) + "_frost"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_frost
                new_pokemon[parseName(en[i]) + "_heat"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_heat
            }
            //special formatting needed for pikachu
            if(parseName(en[i]).startsWith("pikachu")){
                new_pokemon[parseName(en[i]) + "_libre"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_libre
                new_pokemon[parseName(en[i]) + "_flying"].speciesName[lang] = eval(lang)[i] + " (" + strings.flying + ")"
            }
            //special formatting needed for mewtwo
            if(parseName(en[i]).startsWith("mewtwo")){
                new_pokemon[parseName(en[i]) + "_armored"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_armored
            }
            //special formatting needed for meowstic
            if(parseName(en[i]).startsWith("meowstic")){
                new_pokemon[parseName(en[i]) + "_female"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_female
            }
            //special formatting needed for pyroar
            if(parseName(en[i]).startsWith("pyroar")){
                new_pokemon[parseName(en[i]) + "_female"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_female
            }
            //special formatting needed for deoxys
            if(parseName(en[i]).startsWith("deoxys")){
                new_pokemon[parseName(en[i]) + "_defense"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_defense
                new_pokemon[parseName(en[i]) + "_attack"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_attack
                new_pokemon[parseName(en[i]) + "_speed"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_speed
            }
            if(parseName(en[i]).startsWith("castform")){
                new_pokemon[parseName(en[i]) + "_rainy"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_rainy
                new_pokemon[parseName(en[i]) + "_snowy"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_snowy
                new_pokemon[parseName(en[i]) + "_sunny"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_sunny
            }
            //mega pokemon
            if(parseName(en[i]).startsWith("venusaur")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega
            } 
            if(parseName(en[i]).startsWith("blastoise")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega
            } 
            if(parseName(en[i]).startsWith("charizard")){
                new_pokemon[parseName(en[i]) + "_mega_x"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega.slice(0,-1) + " X)"
                new_pokemon[parseName(en[i]) + "_mega_y"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega.slice(0,-1) + " Y)"
            } 
            if(parseName(en[i]).startsWith("beedrill")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega
            } 
            if(parseName(en[i]) == "pidgeot"){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega
            } 
            if(parseName(en[i]).startsWith("gengar")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega
            } 
            if(parseName(en[i]).startsWith("gyarados")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega
            } 
            if(parseName(en[i]).startsWith("ampharos")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega
            } 
            if(parseName(en[i]).startsWith("houndoom")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega
            } 
            if(parseName(en[i]).startsWith("manectric")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega
            } 
            if(parseName(en[i]).startsWith("altaria")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega
            }
            if(parseName(en[i]).startsWith("lopunny")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega
            } 
            if(parseName(en[i]).startsWith("abomasnow")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_mega
            } 

            //Alolan pokemon
            if(parseName(en[i]).startsWith("rattata")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            } 
            if(parseName(en[i]).startsWith("raticate")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("raichu")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("sandshrew")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("sandslash")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("vulpix")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("ninetales")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("diglett")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("dugtrio")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("meowth")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("persian")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("geodude")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("graveler")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("golem")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("grimer")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("muk")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("exeggutor")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }
            if(parseName(en[i]).startsWith("marowak")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_alolan
            }

            //Galarian pokemon
            if(parseName(en[i]).startsWith("meowth")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_galarian
            }
            if(parseName(en[i]).startsWith("ponyta")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_galarian
            }
            if(parseName(en[i]).startsWith("rapidash")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_galarian
            }
            if(parseName(en[i]).startsWith("farfetchd")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_galarian
            }
            if(parseName(en[i]).startsWith("weezing")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_galarian
            }
            if(parseName(en[i]).startsWith("mr_mime")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_galarian
            }
            if(parseName(en[i]).startsWith("zigzagoon")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_galarian
            }
            if(parseName(en[i]).startsWith("linoone")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_galarian
            }
            if(parseName(en[i]).startsWith("yamask")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_galarian
            }
            if(parseName(en[i]).startsWith("stunfisk")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_galarian
            }
            if(parseName(en[i]).startsWith("darumaka")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_galarian
            }
          
            
           
            //Pokemon not yet added to the gamemaster, gen7+
            if(!new_pokemon[parseName(en[i])]){
                continue;
            }
            new_pokemon[parseName(en[i])].speciesName[lang] = eval(lang)[i]
            if(new_pokemon[parseName(en[i]) + "_shadow"]){
                new_pokemon[parseName(en[i]) + "_shadow"].speciesName[lang] = eval(lang)[i] + " " + strings.pokemon_shadow
            }
        }
        //Gen 8 pokes aren't added to the api yet, manual override
        new_pokemon.runerigus.speciesName[lang] = "Runerigus"
        new_pokemon.mr_rime.speciesName[lang] = "Mr. Rime"
        new_pokemon.sirfetchd.speciesName[lang] = "Sirfetch'd"
        new_pokemon.perrserker.speciesName[lang] = "Perrserker"
        new_pokemon.obstagoon.speciesName[lang] = "Obstagoon"
    
    }
    
    fs.writeFileSync("data/pokemon.json", JSON.stringify(new_pokemon, null, 2))
}

mergePokemon()