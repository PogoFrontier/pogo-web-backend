import { pokemon } from "../server";
import { Team } from "../types/team";
import { calculateCP, calculateHP, calculateAtk,calculateDef } from "../utils/calcUtils";

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

  export default validateTeam;