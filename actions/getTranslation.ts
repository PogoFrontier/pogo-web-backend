import axios from "axios"

const supportedLanguages = ["en", "fr", "de", "nl", "es"]

async function getStrings(lang: string){
    lang = supportedLanguages.includes(lang) ? lang : "en"
    const res = await axios.get(`https://d1bbfbaqrr54l0.cloudfront.net/locale/${lang}.json`)
    if (res.data) {
    const d: any = {}
    for (const key of Object.keys(res.data)) {
        d[key] = res.data[key]
    }
    return d
    }
}
export { getStrings}
