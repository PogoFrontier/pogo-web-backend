import axios from "axios"

const supportedLanguages = ["en", "fr", "de", "nl", "es"]

/**
 * Returns a JSON object with all the strings extracted from the s3 bucket and Lokalise
 * @param lang The language of the strings
 * @returns JSON object with all strings
 */
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
