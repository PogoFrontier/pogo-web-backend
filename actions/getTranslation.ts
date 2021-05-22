import { LokaliseApi } from "@lokalise/node-api"
import axios from "axios"
const lokalise = new LokaliseApi({apiKey: ""})

//Get LOKALISE_API_KEY from .env
async function getTranslation(key_id : string) {
    const key = await lokalise.keys.get(key_id, {
        project_id: '991869486095447a82fab4.67696706',
        disable_references: 1,
    });
    let toReturn : any = {}
    key.translations.forEach((lang: { language_iso: string | number; translation: any; }) => {
        toReturn[lang.language_iso] = lang.translation
    });
    return toReturn
}
async function getStrings(lang :string){
    const res = await axios.get(`https://d1bbfbaqrr54l0.cloudfront.net/locale/${lang}.json`)
    if (res.data) {
    const d: any = {}
    for (const key of Object.keys(res.data)) {
        d[key] = res.data[key]
    }
    console.log(d)
    return d
    }
}
export {getTranslation, getStrings}