import { RuleDescription, Rule } from "../types/rule";
import r from '../data/rules.json';

const RULESETS: {
  [key: string]: Object
} = r

export function parseToRule(object: RuleDescription): Rule {
  if (typeof object === "string") {
    object = {
      name: object
    }
  }
  
  if (!instanceOfRule(object)) {
      let rule = RULESETS[object.name] as Rule
      if (!rule) {
          throw new Error(`Format ${object.name} doesn't exist.`);
      }
      return rule;
  }

  return object;
}

function instanceOfRule(object: any): object is Rule {
  return 'maxCP' in object && 'maxLevel' in object && 'maxBestBuddy' in object && 'maxMega' in object;
}