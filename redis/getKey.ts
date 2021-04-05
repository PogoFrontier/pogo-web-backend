import { Rule } from "../types/rule";

export function getBattleRequestKey(format: Rule): string {
    return "searchBattle:" + JSON.stringify(format);
    //return "searchBattle:" + (format.include ? format.include?.map(tag => JSON.stringify(tag)).join(", ") : "") + "|" + (format.exclude ? format.exclude?.map(tag => JSON.stringify(tag)).join(", ") : "") + "|" + format.maxBestBuddy + "|" + format.maxCP + "|" + format.maxLevel
}