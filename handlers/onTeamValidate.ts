import { TeamMember } from "../types/team";
import { Rule, RuleDescription } from "../types/rule";
import { isTeamValid } from "../checks/checkTeam";
import { parseToRule } from "../actions/parseToRule";

export function onTeamValidate(team: TeamMember[], chosenRule: RuleDescription) {
  let rule: Rule
  try{
    rule = parseToRule(chosenRule);
  }catch(e) {
    return e.toString();
  }

  const {isValid, violations} = isTeamValid(team, rule);

  if (!isValid) {
    console.error(violations);
    return violations.join("\n");
  }

  return team;
}

  export default onTeamValidate;