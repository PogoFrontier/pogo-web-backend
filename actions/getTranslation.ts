import axios from "axios"

async function getStrings(lang: string){
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
