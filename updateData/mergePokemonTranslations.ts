import fs from "fs"
import p from "../data/pokemon.json";
import npm_pokemon from 'pokemon'
import { getTranslation, getStrings } from "../actions/getTranslation";

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

async function mergePokemon() {
    for (const pokemon in new_pokemon){
        new_pokemon[pokemon].speciesName = {}
    }
    let trash : {[x : string]:any} = {};
    let plant : {[x : string]:any} = {};
    let sandy : {[x : string]:any} = {};
    let east : {[x : string]:any} = {};
    let west : {[x : string]:any} = {};
    let sunny : {[x : string]:any} = {};
    let overcast : {[x : string]:any} = {};
    let land : {[x : string]:any} = {};
    let sky : {[x : string]:any} = {};
    let shadow : {[x : string]:any} = {};
    let origin : {[x : string]:any} = {};
    let altered : {[x : string]:any} = {};
    let galarian : {[x : string]:any} = {};
    let zen : {[x : string]:any} = {};
    let standard : {[x : string]:any} = {};
    let therian : {[x : string]:any} = {};
    let incarnate : {[x : string]:any} = {};
    let black : {[x : string]:any} = {};
    let white : {[x : string]:any} = {};
    let ordinary : {[x : string]:any} = {};
    let resolute : {[x : string]:any} = {};
    let aria : {[x : string]:any} = {};
    let pirouette : {[x : string]:any} = {};
    let burn : {[x : string]:any} = {};
    let douse : {[x : string]:any} = {};
    let chill : {[x : string]:any} = {};
    let shock : {[x : string]:any} = {};
    let mega : {[x : string]:any} = {};
    let alolan : {[x : string]:any} = {};
    let flying : {[x : string]:any} = {};
    let libre : {[x : string]:any} = {};
    let armored : {[x : string]:any} = {};
    let rainy : {[x : string]:any} = {};
    let snowy : {[x : string]:any} = {};
    let attack : {[x : string]:any} = {};
    let defense : {[x : string]:any} = {};
    let speed : {[x : string]:any} = {};
    let fan : {[x : string]:any} = {};
    let frost : {[x : string]:any} = {};
    let heat : {[x : string]:any} = {};
    let mow : {[x : string]:any} = {};
    let wash : {[x : string]:any} = {};
    let bug : {[x : string]:any} = {};
    let dark : {[x : string]:any} = {};
    let normal : {[x : string]:any} = {};
    let dragon : {[x : string]:any} = {};
    let electric : {[x : string]:any} = {};
    let fairy : {[x : string]:any} = {};
    let fighting : {[x : string]:any} = {};
    let fire : {[x : string]:any} = {};
    let ghost : {[x : string]:any} = {};
    let grass : {[x : string]:any} = {};
    let ground : {[x : string]:any} = {};
    let ice : {[x : string]:any} = {};
    let poison : {[x : string]:any} = {};
    let psychic : {[x : string]:any} = {};
    let rock : {[x : string]:any} = {};
    let steel : {[x : string]:any} = {};
    let water : {[x : string]:any} = {};
    let female : {[x : string]:any} = {};

    await getTranslation('90190611').then(r => trash = r)
    await getTranslation('90190609').then(r => plant = r)
    await getTranslation('90883478').then(r => sandy = r)
    await getTranslation('90883487').then(r => shadow = r)
    await getTranslation('90883489').then(r => east = r)
    await getTranslation('90883491').then(r => west = r)
    await getTranslation('90883485').then(r => sunny = r)
    await getTranslation('90883492').then(r => overcast = r)
    await getTranslation('90883497').then(r => land = r)
    await getTranslation('90883634').then(r => galarian = r)
    await getTranslation('90883496').then(r => altered = r)
    await getTranslation('90883494').then(r => origin = r)
    await getTranslation('90883676').then(r => zen = r)
    await getTranslation('90883680').then(r => standard = r)
    await getTranslation('90883682').then(r => therian = r)
    await getTranslation('90889134').then(r => incarnate = r)
    await getTranslation('90889135').then(r => white = r)
    await getTranslation('90894120').then(r => black = r)
    await getTranslation('90896577').then(r => ordinary = r)
    await getTranslation('90896578').then(r => resolute = r)
    await getTranslation('90896579').then(r => aria = r)
    await getTranslation('90896580').then(r => pirouette = r)
    await getTranslation('90896581').then(r => burn = r)
    await getTranslation('90896582').then(r => chill = r)
    await getTranslation('90896583').then(r => douse = r)
    await getTranslation('90896584').then(r => shock = r)
    await getTranslation('90896693').then(r => mega = r)
    await getTranslation('90896697').then(r => alolan = r)
    await getTranslation('90896704').then(r => flying = r)
    await getTranslation('90896705').then(r => libre = r)
    await getTranslation('90896706').then(r => armored = r)
    await getTranslation('90896707').then(r => rainy = r)
    await getTranslation('90896708').then(r => snowy = r)
    await getTranslation('90896709').then(r => attack = r)
    await getTranslation('90896710').then(r => speed = r)
    await getTranslation('90896711').then(r => defense = r)
    await getTranslation('90896712').then(r => fan = r)
    await getTranslation('90896713').then(r => frost = r)
    await getTranslation('90896714').then(r => heat = r)
    await getTranslation('90896715').then(r => mow = r)
    await getTranslation('90896716').then(r => wash = r)
    await getTranslation('90896717').then(r => bug = r)
    await getTranslation('90896733').then(r => dark = r)
    await getTranslation('90896736').then(r => dragon = r)
    await getTranslation('90896737').then(r => electric = r)
    await getTranslation('90896738').then(r => fairy = r)
    await getTranslation('90896740').then(r => fighting = r)
    await getTranslation('90896741').then(r => fire = r)
    await getTranslation('90896742').then(r => ghost = r)
    await getTranslation('90896743').then(r => grass = r)
    await getTranslation('90896744').then(r => ground = r)
    await getTranslation('90896745').then(r => ice = r)
    await getTranslation('90896746').then(r => poison = r)
    await getTranslation('90896747').then(r => psychic = r)
    await getTranslation('90896748').then(r => rock = r)
    await getTranslation('90896749').then(r => steel = r)
    await getTranslation('90896750').then(r => water = r)
    await getTranslation('90896751').then(r => female = r)

    languages.forEach(lang => {
        let object = "new" + lang;
        for (let i = 0; i < eval(lang).length; i++) {
            eval(object)[en[i]] = eval(lang)[i];
            //TODO: integrate these in translator project
            //special formatting needed for burmy
           
            if(parseName(en[i]).startsWith("burmy")){
                new_pokemon[parseName(en[i]) + "_plant"].speciesName[lang] = eval(lang)[i] + " " + (plant[lang] ? plant[lang] : plant["en"])
                new_pokemon[parseName(en[i]) + "_trash"].speciesName[lang] = eval(lang)[i] + " " + (trash[lang] ? trash[lang] : trash["en"])
                new_pokemon[parseName(en[i]) + "_sandy"].speciesName[lang] = eval(lang)[i] + " " + (sandy[lang] ? sandy[lang] : sandy["en"])
                continue;
            }   
            //special formatting needed for wormadam
            if(parseName(en[i]).startsWith("wormadam")){
                new_pokemon[parseName(en[i]) + "_plant"].speciesName[lang] = eval(lang)[i] + " " + (plant[lang] ? plant[lang] : plant["en"])
                new_pokemon[parseName(en[i]) + "_trash"].speciesName[lang] = eval(lang)[i] + " " + (trash[lang] ? trash[lang] : trash["en"])
                new_pokemon[parseName(en[i]) + "_sandy"].speciesName[lang] = eval(lang)[i] + " " + (sandy[lang] ? sandy[lang] : sandy["en"])
                continue;
            }   
            //special formatting needed for cherrim
            if(parseName(en[i]).startsWith("cherrim")){
                new_pokemon[parseName(en[i]) + "_sunny"].speciesName[lang] = eval(lang)[i] + " " + (sunny[lang] ? sunny[lang] : sunny["en"])
                new_pokemon[parseName(en[i]) + "_overcast"].speciesName[lang] = eval(lang)[i] + " " + (overcast[lang] ? overcast[lang] : overcast["en"])
                continue;
            } 
            //special formatting needed for shellos
            if(parseName(en[i]).startsWith("shellos")){
                new_pokemon[parseName(en[i]) + "_east_sea"].speciesName[lang] = eval(lang)[i] + " " + (east[lang] ? east[lang] : east["en"])
                new_pokemon[parseName(en[i]) + "_west_sea"].speciesName[lang] = eval(lang)[i] + " " + (west[lang] ? west[lang] : west["en"])
                continue;
            } 
            //special formatting needed for gastrodon
            if(parseName(en[i]).startsWith("gastrodon")){
                new_pokemon[parseName(en[i]) + "_east_sea"].speciesName[lang] = eval(lang)[i] + " " + (east[lang] ? east[lang] : east["en"])
                new_pokemon[parseName(en[i]) + "_west_sea"].speciesName[lang] = eval(lang)[i] + " " + (west[lang] ? west[lang] : west["en"])
                continue;
            } 
            //special formatting needed for giratina
            if(parseName(en[i]).startsWith("giratina")){
                new_pokemon[parseName(en[i]) + "_origin"].speciesName[lang] = eval(lang)[i] + " " + (origin[lang] ? origin[lang] : origin["en"])
                new_pokemon[parseName(en[i]) + "_altered"].speciesName[lang] = eval(lang)[i] + " " + (altered[lang] ? altered[lang] : altered["en"])
                continue;
            } 
            //special formatting needed for shaymin
            if(parseName(en[i]).startsWith("shaymin")){
                new_pokemon[parseName(en[i]) + "_land"].speciesName[lang] = eval(lang)[i] + " " + (land[lang] ? land[lang] : land["en"])
                new_pokemon[parseName(en[i]) + "_sky"].speciesName[lang] = eval(lang)[i] + " " + (sky[lang] ? sky[lang] : sky["en"])
                continue;
            } 
            //special formatting needed for darmanitan
            if(parseName(en[i]).startsWith("darmanitan")){
                new_pokemon[parseName(en[i]) + "_galarian_zen"].speciesName[lang] = eval(lang)[i] + " " + (galarian[lang] ? galarian[lang] : galarian["en"]).slice(0,-1) + " " + (zen[lang] ? zen[lang] : zen["en"]).substring(1)
                new_pokemon[parseName(en[i]) + "_galarian_standard"].speciesName[lang] = eval(lang)[i] + " " + (galarian[lang] ? galarian[lang] : galarian["en"]).slice(0,-1) + " " + (standard[lang] ? standard[lang] : standard["en"]).substring(1)
                new_pokemon[parseName(en[i]) + "_standard"].speciesName[lang] = eval(lang)[i] + " " + (standard[lang] ? standard[lang] : standard["en"])
                new_pokemon[parseName(en[i]) + "_zen"].speciesName[lang] = eval(lang)[i] + " " + (zen[lang] ? zen[lang] : zen["en"])
                continue;
            } 
            //special formatting needed for tornadus
            if(parseName(en[i]).startsWith("tornadus")){
                new_pokemon[parseName(en[i]) + "_therian"].speciesName[lang] = eval(lang)[i] + " " + (therian[lang] ? therian[lang] : therian["en"])
                new_pokemon[parseName(en[i]) + "_incarnate"].speciesName[lang] = eval(lang)[i] + " " + (incarnate[lang] ? incarnate[lang] : incarnate["en"])
                continue;
            } 
            //special formatting needed for thundurus
            if(parseName(en[i]).startsWith("thundurus")){
                new_pokemon[parseName(en[i]) + "_therian"].speciesName[lang] = eval(lang)[i] + " " + (therian[lang] ? therian[lang] : therian["en"])
                new_pokemon[parseName(en[i]) + "_incarnate"].speciesName[lang] = eval(lang)[i] + " " + (incarnate[lang] ? incarnate[lang] : incarnate["en"])
                continue;
            } 
            //special formatting needed for landorus
            if(parseName(en[i]).startsWith("landorus")){
                new_pokemon[parseName(en[i]) + "_therian"].speciesName[lang] = eval(lang)[i] + " " + (therian[lang] ? therian[lang] : therian["en"])
                new_pokemon[parseName(en[i]) + "_incarnate"].speciesName[lang] = eval(lang)[i] + " " + (incarnate[lang] ? incarnate[lang] : incarnate["en"])
                continue;
            } 
            //special formatting needed for kyurem
            if(parseName(en[i]).startsWith("kyurem")){
                new_pokemon[parseName(en[i]) + "_black"].speciesName[lang] = eval(lang)[i] + " " + (black[lang] ? black[lang] : black["en"])
                new_pokemon[parseName(en[i]) + "_white"].speciesName[lang] = eval(lang)[i] + " " + (white[lang] ? white[lang] : white["en"])
            } 
            //special formatting needed for keldeo
            if(parseName(en[i]).startsWith("keldeo")){
                new_pokemon[parseName(en[i]) + "_ordinary"].speciesName[lang] = eval(lang)[i] + " " + (ordinary[lang] ? ordinary[lang] : ordinary["en"])
                new_pokemon[parseName(en[i]) + "_resolute"].speciesName[lang] = eval(lang)[i] + " " + (resolute[lang] ? resolute[lang] : resolute["en"])
                continue;
            } 
            //special formatting needed for meloetta
            if(parseName(en[i]).startsWith("meloetta")){
                new_pokemon[parseName(en[i]) + "_aria"].speciesName[lang] = eval(lang)[i] + " " + (aria[lang] ? aria[lang] : aria["en"])
                new_pokemon[parseName(en[i]) + "_pirouette"].speciesName[lang] = eval(lang)[i] + " " + (pirouette[lang] ? pirouette[lang] : pirouette["en"])
                continue;
            } 
            //special formatting needed for genesect
            if(parseName(en[i]).startsWith("genesect")){
                new_pokemon[parseName(en[i]) + "_burn"].speciesName[lang] = eval(lang)[i] + " " + (burn[lang] ? burn[lang] : burn["en"])
                new_pokemon[parseName(en[i]) + "_chill"].speciesName[lang] = eval(lang)[i] + " " + (chill[lang] ? chill[lang] : chill["en"])
                new_pokemon[parseName(en[i]) + "_douse"].speciesName[lang] = eval(lang)[i] + " " + (douse[lang] ? douse[lang] : douse["en"])
                new_pokemon[parseName(en[i]) + "_shock"].speciesName[lang] = eval(lang)[i] + " " + (shock[lang] ? shock[lang] : shock["en"])
            }
            //special formatting needed for the god almighty 🙏 
            if(parseName(en[i]).startsWith("arceus")){
                new_pokemon[parseName(en[i]) + "_bug"].speciesName[lang] = eval(lang)[i] + " (" + (bug[lang] ? bug[lang] : bug["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_dragon"].speciesName[lang] = eval(lang)[i] + " (" + (dragon[lang] ? dragon[lang] : dragon["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_dark"].speciesName[lang] = eval(lang)[i] + " (" + (dark[lang] ? dark[lang] : dark["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_electric"].speciesName[lang] = eval(lang)[i] + " (" + (electric[lang] ? electric[lang] : electric["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_fairy"].speciesName[lang] = eval(lang)[i] + " (" + (fairy[lang] ? fairy[lang] : fairy["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_fighting"].speciesName[lang] = eval(lang)[i] + " (" + (fighting[lang] ? fighting[lang] : fighting["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_fire"].speciesName[lang] = eval(lang)[i] + " (" + (fire[lang] ? fire[lang] : fire["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_flying"].speciesName[lang] = eval(lang)[i] + " (" + (flying[lang] ? flying[lang] : flying["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_ghost"].speciesName[lang] = eval(lang)[i] + " (" + (ghost[lang] ? ghost[lang] : ghost["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_grass"].speciesName[lang] = eval(lang)[i] + " (" + (grass[lang] ? grass[lang] : grass["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_ground"].speciesName[lang] = eval(lang)[i] + " (" + (ground[lang] ? ground[lang] : ground["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_ice"].speciesName[lang] = eval(lang)[i] + " (" + (ice[lang] ? ice[lang] : ice["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_poison"].speciesName[lang] = eval(lang)[i] + " (" + (poison[lang] ? poison[lang] : poison["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_psychic"].speciesName[lang] = eval(lang)[i] + " (" + (psychic[lang] ? psychic[lang] : psychic["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_rock"].speciesName[lang] = eval(lang)[i] + " (" + (rock[lang] ? rock[lang] : rock["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_steel"].speciesName[lang] = eval(lang)[i] + " (" + (steel[lang] ? steel[lang] : steel["en"]) + ")"
                new_pokemon[parseName(en[i]) + "_water"].speciesName[lang] = eval(lang)[i] + " (" + (water[lang] ? water[lang] : water["en"]) + ")"
            } 
            //special formatting needed for rotom
            if(parseName(en[i]).startsWith("rotom")){
                new_pokemon[parseName(en[i]) + "_wash"].speciesName[lang] = eval(lang)[i] + " " + (wash[lang] ? wash[lang] : wash["en"])
                new_pokemon[parseName(en[i]) + "_fan"].speciesName[lang] = eval(lang)[i] + " " + (fan[lang] ? fan[lang] : fan["en"])
                new_pokemon[parseName(en[i]) + "_mow"].speciesName[lang] = eval(lang)[i] + " " + (mow[lang] ? mow[lang] : mow["en"])
                new_pokemon[parseName(en[i]) + "_frost"].speciesName[lang] = eval(lang)[i] + " " + (frost[lang] ? frost[lang] : frost["en"])
                new_pokemon[parseName(en[i]) + "_heat"].speciesName[lang] = eval(lang)[i] + " " + (heat[lang] ? heat[lang] : heat["en"])
            }
            //special formatting needed for pikachu
            if(parseName(en[i]).startsWith("pikachu")){
                new_pokemon[parseName(en[i]) + "_libre"].speciesName[lang] = eval(lang)[i] + " " + (libre[lang] ? libre[lang] : libre["en"])
                new_pokemon[parseName(en[i]) + "_flying"].speciesName[lang] = eval(lang)[i] + " (" + (flying[lang] ? flying[lang] : flying["en"]) + ")"
            }
            //special formatting needed for mewtwo
            if(parseName(en[i]).startsWith("mewtwo")){
                new_pokemon[parseName(en[i]) + "_armored"].speciesName[lang] = eval(lang)[i] + " " + (armored[lang] ? armored[lang] : armored["en"])
            }
            //special formatting needed for meowstic
            if(parseName(en[i]).startsWith("meowstic")){
                new_pokemon[parseName(en[i]) + "_female"].speciesName[lang] = eval(lang)[i] + " " + (female[lang] ? female[lang] : female["en"])
            }
            //special formatting needed for pyroar
            if(parseName(en[i]).startsWith("pyroar")){
                new_pokemon[parseName(en[i]) + "_female"].speciesName[lang] = eval(lang)[i] + " " + (female[lang] ? female[lang] : female["en"])
            }
            //special formatting needed for deoxys
            if(parseName(en[i]).startsWith("deoxys")){
                new_pokemon[parseName(en[i]) + "_defense"].speciesName[lang] = eval(lang)[i] + " " + (defense[lang] ? defense[lang] : defense["en"])
                new_pokemon[parseName(en[i]) + "_attack"].speciesName[lang] = eval(lang)[i] + " " + (attack[lang] ? attack[lang] : attack["en"])
                new_pokemon[parseName(en[i]) + "_speed"].speciesName[lang] = eval(lang)[i] + " " + (speed[lang] ? speed[lang] : speed["en"])
            }
            if(parseName(en[i]).startsWith("castform")){
                new_pokemon[parseName(en[i]) + "_rainy"].speciesName[lang] = eval(lang)[i] + " " + (rainy[lang] ? rainy[lang] : rainy["en"])
                new_pokemon[parseName(en[i]) + "_snowy"].speciesName[lang] = eval(lang)[i] + " " + (snowy[lang] ? snowy[lang] : snowy["en"])
                new_pokemon[parseName(en[i]) + "_sunny"].speciesName[lang] = eval(lang)[i] + " " + (sunny[lang] ? sunny[lang] : sunny["en"])
            }
            //mega pokemon
            if(parseName(en[i]).startsWith("venusaur")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"])
            } 
            if(parseName(en[i]).startsWith("blastoise")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"])
            } 
            if(parseName(en[i]).startsWith("charizard")){
                new_pokemon[parseName(en[i]) + "_mega_x"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"]).slice(0,-1) + " X)"
                new_pokemon[parseName(en[i]) + "_mega_y"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"]).slice(0,-1) + " Y)"
            } 
            if(parseName(en[i]).startsWith("beedrill")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"])
            } 
            if(parseName(en[i]) == "pidgeot"){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"])
            } 
            if(parseName(en[i]).startsWith("gengar")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"])
            } 
            if(parseName(en[i]).startsWith("gyarados")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"])
            } 
            if(parseName(en[i]).startsWith("ampharos")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"])
            } 
            if(parseName(en[i]).startsWith("houndoom")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"])
            } 
            if(parseName(en[i]).startsWith("manectric")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"])
            } 
            if(parseName(en[i]).startsWith("altaria")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"])
            }
            if(parseName(en[i]).startsWith("lopunny")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"])
            } 
            if(parseName(en[i]).startsWith("abomasnow")){
                new_pokemon[parseName(en[i]) + "_mega"].speciesName[lang] = eval(lang)[i] + " " + (mega[lang] ? mega[lang] : mega["en"])
            } 

            //Alolan pokemon
            if(parseName(en[i]).startsWith("rattata")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            } 
            if(parseName(en[i]).startsWith("raticate")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("raichu")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("sandshrew")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("sandslash")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("vulpix")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("ninetales")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("diglett")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("dugtrio")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("meowth")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("persian")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("geodude")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("graveler")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("golem")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("grimer")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("muk")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("exeggutor")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }
            if(parseName(en[i]).startsWith("marowak")){
                new_pokemon[parseName(en[i]) + "_alolan"].speciesName[lang] = eval(lang)[i] + " " + (alolan[lang] ? alolan[lang] : alolan["en"])
            }

            //Galarian pokemon
            if(parseName(en[i]).startsWith("meowth")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + (galarian[lang] ? galarian[lang] : galarian["en"])
            }
            if(parseName(en[i]).startsWith("ponyta")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + (galarian[lang] ? galarian[lang] : galarian["en"])
            }
            if(parseName(en[i]).startsWith("rapidash")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + (galarian[lang] ? galarian[lang] : galarian["en"])
            }
            if(parseName(en[i]).startsWith("farfetchd")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + (galarian[lang] ? galarian[lang] : galarian["en"])
            }
            if(parseName(en[i]).startsWith("weezing")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + (galarian[lang] ? galarian[lang] : galarian["en"])
            }
            if(parseName(en[i]).startsWith("mr_mime")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + (galarian[lang] ? galarian[lang] : galarian["en"])
            }
            if(parseName(en[i]).startsWith("zigzagoon")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + (galarian[lang] ? galarian[lang] : galarian["en"])
            }
            if(parseName(en[i]).startsWith("linoone")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + (galarian[lang] ? galarian[lang] : galarian["en"])
            }
            if(parseName(en[i]).startsWith("yamask")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + (galarian[lang] ? galarian[lang] : galarian["en"])
            }
            if(parseName(en[i]).startsWith("stunfisk")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + (galarian[lang] ? galarian[lang] : galarian["en"])
            }
            if(parseName(en[i]).startsWith("darumaka")){
                new_pokemon[parseName(en[i]) + "_galarian"].speciesName[lang] = eval(lang)[i] + " " + (galarian[lang] ? galarian[lang] : galarian["en"])
            }
          
            
           
            //Pokemon not yet added to the gamemaster, gen7+
            if(!new_pokemon[parseName(en[i])]){
                continue;
            }
            new_pokemon[parseName(en[i])].speciesName[lang] = eval(lang)[i]
            if(new_pokemon[parseName(en[i]) + "_shadow"]){
                new_pokemon[parseName(en[i]) + "_shadow"].speciesName[lang] = eval(lang)[i] + " " + (shadow[lang] ? shadow[lang] : shadow["en"])
            }
        }
        //Gen 8 pokes aren't added to the api yet, manual override
        new_pokemon.runerigus.speciesName[lang] = "Runerigus"
        new_pokemon.mr_rime.speciesName[lang] = "Mr. Rime"
        new_pokemon.sirfetchd.speciesName[lang] = "Sirfetch'd"
        new_pokemon.perrserker.speciesName[lang] = "Perrserker"
        new_pokemon.obstagoon.speciesName[lang] = "Obstagoon"
    
    })
    
    fs.writeFileSync("data/pokemon.json", JSON.stringify(new_pokemon, null, 2))
}

mergePokemon()