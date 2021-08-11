import { RuleDescription, Rule } from "../types/rule";
import r from '../data/rules.json';
import unrankedRules from '../data/unrankedrules.json';
import { CODE } from "../types/actions";

const RULESETS: {
  [key: string]: Object
} = r

export function parseToRule(format: RuleDescription): Rule {
  if (!instanceOfRule(format)) {

    // Check for the unranked suffix
    let unranked = false
    if(format.endsWith(CODE.UnrankedSuffix)) {
      unranked = true
      format = format.slice(0, -CODE.UnrankedSuffix.length)

      if(!unrankedRules.includes(format)) {
        throw new Error("Invalid unranked format")
      }
    }

    let rule = {...RULESETS[format]} as Rule
    rule.unranked = unranked

    if (!rule) {
      throw new Error(`Format ${format} doesn't exist.`);
    }

    return rule;
  }

  format.unranked = false
  return format;
}

function instanceOfRule(object: any): object is Rule {
  return typeof object !== "string" && 'maxCP' in object && 'maxLevel' in object && 'maxBestBuddy' in object && 'maxMega' in object;
}