import { TeamMember } from "../types/team";
import { Rule, RuleDescription, parseToRule } from "../types/rule";
import { isTeamValid } from "../checks/checkTeam";

export function onTeamValidate(team: TeamMember[], chosenRule: RuleDescription) {
  console.log("Team Validate");
  console.log(chosenRule);

  let rule: Rule
  try{
    rule = parseToRule(chosenRule);
  }catch(e) {
    return e.toString();
  }

  console.log("rule");
  console.log(rule);
  const {isValid, violations} = isTeamValid(team, rule);

  if (!isValid) {
    console.error(violations);
    return violations.join("\n");
  }

  return team;
}

  export default onTeamValidate;