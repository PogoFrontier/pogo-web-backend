import { Actions } from "../types/actions";
import { TeamMember } from "../types/team"

export function reduceTeam(teamMembers: TeamMember[]): object[] {
    return teamMembers.map(reduceTeamMemberForOpponent)
}

export function reduceActionForOpponent(action: string, teamMembers: TeamMember[]): string {
    if(action.startsWith("#ca")) {
        return "#ca";
    }
    
    if (action.startsWith(`#${Actions.SWITCH}:`)) {
        let index = parseInt(action.split(":")[1]);
        return `#${Actions.SWITCH}:` + JSON.stringify(reduceTeamMemberForOpponent(teamMembers[index]))
    }

    return action;
}

export function reduceTeamMemberForOpponent(member: TeamMember): object {
    let current;
    if (member.current) {
        current = {
            hp: member.current.hp / member.hp
        }
    }

    return {
        speciesId: member.speciesId,
        speciesName: member.speciesName,
        cp: member.cp,
        types: member.types,
        sid: member.sid,
        shiny: member.shiny,
        current: current
    };
}