import { Actions } from "../types/actions";
import { Move } from "../types/room";
import { TeamMember, TeamMemberDescription } from "../types/team"

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
        member.current = {...member.current}
        member.current.hp = member.current.hp / member.hp
    }

    return member;
}

export function reduceTeamForEnd(team?: TeamMember[]): object[] | undefined {
    return team?.map(member => {
        return {
            name: member.name,
            sid: member.sid,
            current: {
                hp: member.current?.hp,
                energy: member.current?.energy,
                damageDealt: member.current?.damageDealt,
                chargeMovesUsed: member.current?.chargeMovesUsed,
                timeSpendAlive: member.current?.timeSpendAlive
            }
        }
    })
}