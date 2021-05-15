import { RuleDescription, Rule } from "../types/rule";
import r from '../data/rules.json';

const RULESETS: {
  [key: string]: Object
} = r

export function parseToRule(format: RuleDescription): Rule {
  if (!instanceOfRule(format)) {
      let rule = RULESETS[format] as Rule
      if (!rule) {
          throw new Error(`Format ${format} doesn't exist.`);
      }
      return rule;
  }

  return format;
}

function instanceOfRule(object: any): object is Rule {
  return typeof object !== "string" && 'maxCP' in object && 'maxLevel' in object && 'maxBestBuddy' in object && 'maxMega' in object;
}