import to from "../actions/to";
import { pokemon, rooms, rule } from "../server";
import { CODE } from "../types/actions";
import { OnTeamSubmitPayload } from "../types/handlers"; 
import { Team } from "../types/team";
import { calculateCP, calculateHP, calculateAtk,calculateDef } from "../utils/calcUtils";

function onTeamSubmit(id: string, payload: OnTeamSubmitPayload) {
  const { room, team } = payload;
  const currentRoom = rooms.get(room);
  if (currentRoom) {
    var chosenRule: any = rule[team.format]
    validateTeam(team, chosenRule);
    const i = currentRoom.players.findIndex(x => x && x.id === id);
    if (i > -1) {
      let currentTeam = [];
      for (const member of team.members) {
        member.current = {
          hp: member.hp,
          atk: member.atk,
          def: member.def,
          status: [0, 0]
        }
        currentTeam.push(member);
      }
      currentRoom.players[i]!.current = {
        team: currentTeam,
        ready: false,
        active: 0,
        switch: 0,
        shields: 2,
        remaining: 3,
      }

      console.info(`Player ${id} is ready in room ${room}.`);

      const j = i === 0 ? 1 : 0;
      if (currentRoom.players[j] && currentRoom.players[j]!.current) {
        to(room, JSON.stringify({
            type: CODE.team_confirm,
        }));
        console.info(`Room ${room} will start.`);
      }
    }
  }
}


export function validateTeam(team: Team, chosenRule: any) {
  var bestBuddyCount = 0
  for (let member of team.members) {
    if (chosenRule.maxLevel && member.level > chosenRule.maxLevel) {
      bestBuddyCount += 1
    }
    if (bestBuddyCount > chosenRule.maxBestBuddy) {
      throw new Error(`Best buddy exceeds limit ${chosenRule.maxBestBuddy}`)
    }
    if (chosenRule.allowedPokemon && !chosenRule.allowedPokemon.includes(member.speciesId)) {
      throw new Error(`Pokemon ${member.speciesId} is not allowed`)
    }

    var chosenPokemon: any = pokemon[member.speciesId]
    var cp: number = calculateCP(chosenPokemon, member.level, member.iv)
    if (chosenRule.maxCP && cp > chosenRule.maxCP) {
      throw new Error("CP is over limit")
    }

    if (!chosenPokemon.fastMoves.include(member.fastMove)) {
      throw new Error(`fast move ${member.fastMove} for Pokemon ${chosenPokemon.speciesId} not allowed`)
    }

    for (const cmove in member.chargeMoves) {
      if (!chosenPokemon.chargeMoves.include(cmove)) {
        throw new Error(`charge move ${cmove} Pokemon ${chosenPokemon.speciesId} not allowed`)
      }
    }

    member.cp = cp
    member.hp = calculateHP(chosenPokemon.baseStats.hp, member.level, member.iv.hp)
    member.atk = calculateAtk(chosenPokemon.baseStats.atk, member.level, member.iv.atk)
    member.def = calculateDef(chosenPokemon.baseStats.def, member.level, member.iv.def)
  }
}

export default onTeamSubmit;