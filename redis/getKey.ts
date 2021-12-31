import { Rule, RuleDescription } from "../types/rule";

export function getBattleRequestKey(format: RuleDescription): string {
    return "searchBattle:" + JSON.stringify(format);
    //return "searchBattle:" + (format.include ? format.include?.map(tag => JSON.stringify(tag)).join(", ") : "") + "|" + (format.exclude ? format.exclude?.map(tag => JSON.stringify(tag)).join(", ") : "") + "|" + format.maxBestBuddy + "|" + format.maxCP + "|" + format.maxLevel
}

export function getUserStatusKey(id: string): string {
    return "{userStatus}:" + id;
    //return "searchBattle:" + (format.include ? format.include?.map(tag => JSON.stringify(tag)).join(", ") : "") + "|" + (format.exclude ? format.exclude?.map(tag => JSON.stringify(tag)).join(", ") : "") + "|" + format.maxBestBuddy + "|" + format.maxCP + "|" + format.maxLevel
}