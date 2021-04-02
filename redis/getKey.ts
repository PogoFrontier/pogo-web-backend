import { Rule } from "../types/rule";

export function getBattleRequestKey(format: Rule): string {
    return "searchBattle:" + (format.allowedPokemon ? format.allowedPokemon?.join(", ") : "") + "|" + format.maxBestBuddy + "|" + format.maxCP + "|" + format.maxLevel + "|" + format.name
}