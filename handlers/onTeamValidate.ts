import { pokemon } from "../server";
import { TeamMember } from "../types/team";
import { calculateCP, calculateHP, calculateAtk,calculateDef } from "../utils/calcUtils";

export function onTeamValidate(team: TeamMember[], chosenRule: any) {
    var bestBuddyCount = 0
    for (let member of team) {
      if (chosenRule.maxLevel && member.level! > chosenRule.maxLevel) {
        bestBuddyCount += 1
      }
      if (bestBuddyCount > chosenRule.maxBestBuddy) {
        return `Number of best buddies exceeds limit of ${chosenRule.maxBestBuddy}`
      }
      if (chosenRule.allowedPokemon && !chosenRule.allowedPokemon.includes(member.speciesId)) {
        return `Pokemon ${member.speciesName} is not allowed`
      }
  
      var chosenPokemon: any = pokemon[member.speciesId]
      var cp: number = calculateCP(chosenPokemon, member.level!, member.iv)
      if (chosenRule.maxCP && cp > chosenRule.maxCP) {
        return `CP is over limit for Pokemon ${chosenPokemon.speciesName}`
      }
  
      if (!chosenPokemon.fastMoves || !chosenPokemon.fastMoves.includes(member.fastMove)) {
        return `Fast move ${member.fastMove} for Pokemon ${chosenPokemon.speciesName} is not allowed`
      }
  
      for (const cmove of member.chargeMoves) {
        if (!chosenPokemon.chargedMoves.includes(cmove)) {
          return `Charge move ${cmove} for Pokemon ${chosenPokemon.speciesName} is not allowed`
        }
      }
  
      member.cp = cp
      member.hp = calculateHP(chosenPokemon.baseStats.hp, member.level!, member.iv!.hp)
      member.atk = calculateAtk(chosenPokemon.baseStats.atk, member.level!, member.iv!.atk)
      member.def = calculateDef(chosenPokemon.baseStats.def, member.level!, member.iv!.def)
    }
    return team;
  }

  export default onTeamValidate;