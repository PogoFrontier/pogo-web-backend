import { Actions } from "../types/actions";
import { Move } from "../types/room";
import { TeamMember } from "../types/team"

export function reduceTeam(teamMembers: TeamMember[]): object[] {
    if (teamMembers && teamMembers.length) {
        return teamMembers.map(reduceTeamMemberForOpponent)
    }
    return []
}

export function reduceActionForOpponent(action: string, teamMembers: TeamMember[], move?: Move, turn?: number): string {
    if(action.startsWith("#ca")) {
        return "#ca";
    }
    
    if (action.startsWith(`#${Actions.SWITCH}:`)) {
        let index = parseInt(action.split(":")[1]);
        return `#${Actions.SWITCH}:` + JSON.stringify(reduceTeamMemberForOpponent(teamMembers[index]))
    }

    if (action.startsWith(`#${Actions.FAST_ATTACK}:`) && move && typeof turn === "number") {
        return `#${Actions.FAST_ATTACK}:` + JSON.stringify(
            {
                type: Actions.FAST_ATTACK,
                move,
                turn
            }
        )
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

export function reduceTeamMemberForPlayer(member: TeamMember): TeamMember {
    member = {...member}
    if (member.current) {
        member.current = {
            hp: member.current ? member.current.hp / member.hp : 0,
            def: member.current ? member.current.def : 0,
            atk: member.current ? member.current.atk : 0,
            status: member.current ? member.current.status : [0,0],
            energy: member.current ? member.current.energy : 0,
        }
    }

    return member;
}