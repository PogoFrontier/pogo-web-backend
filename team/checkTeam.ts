import Filter from "bad-words"
import { ClassOption, Rule, Selector } from "../types/rule";
import { Pokemon, TeamMember, TeamMemberDescription, typeId, PokemonSpecies } from "../types/team";
import { calculateCP, calculateHP, calculateAtk,calculateDef } from "../utils/calcUtils";
import pokeData from "../data/pokemon.json";
import moves from "../data/moves.json";
import mainSeriesPokeData from "../data/pokemonWithMainSeriesMoves.json";

const curseWordFilter = new Filter() 

export function isTeamValid(team: TeamMember[], format: Rule, strings: any): {isValid: boolean, violations: string[]} {
    let violations = new Array<string>();
    //Get strings
    if (team.length !== 6) {
      violations.push(strings.team_verify_wrong_length.replace('%1', team.length))
    }
  
    let megaCounter = 0;
    let bestBuddyCounter = 0;
    let pointsUsed = 0;
    let selectedSpecies = Array<PokemonSpecies>();
  
    for (const index in team) {
      const pokemon = team[index];
  
      // Check if pokemon exists
      if (! (pokemon.speciesId in pokeData)) {
        violations.push(strings.team_verify_invalid_id.replace('%1', pokemon.speciesId));
        continue;
      }
  
      // Check valid iv
      if (pokemon.iv.atk < 0 || pokemon.iv.atk > 15) {
        violations.push(strings.team_verify_invalid_attack.replace('%1', index).replace("%2", pokemon.iv.atk));
      }
      if (pokemon.iv.def < 0 || pokemon.iv.def > 15) {
        violations.push(strings.team_verify_invalid_defense.replace('%1', index).replace("%2", pokemon.iv.def));
      }
      if (pokemon.iv.hp < 0 || pokemon.iv.hp > 15) {
        violations.push(strings.team_verify_invalid_hp.replace('%1', index).replace("%2", pokemon.iv.hp));
      }
  
      // Check valid level
      if (pokemon.level < 1 || pokemon.level > format.maxLevel + 1) {
        violations.push(strings.team_verify_invalid_level.replace('%1', index).replace("%2", pokemon.level));
      } else if (pokemon.level > format.maxLevel) {
        bestBuddyCounter++;
      }
  
      // Check valid cp
      if (pokemon.cp > format.maxCP) {
        violations.push(strings.team_verify_invalid_cp.replace('%1', index).replace("%2", pokemon.cp));
      }

      // Check nickname length
      if(pokemon.name && pokemon.name.length > 12) {
        violations.push(strings.team_verify_invalid_nickname.replace('%1', pokemon.name));
      }

      // Check nickname for curse words
      if(pokemon.name && curseWordFilter.isProfane(pokemon.name)) {
        violations.push(strings.team_verify_cursed_nickname.replace('%1', pokemon.name));
      }

      // check if pokémon is legal
      const {
        violations: speciesViolations
      } = isSpeciesAllowed(pokemon, format, parseInt(index), strings);
      violations.push(...speciesViolations)
  
      // Get species data
      const shouldUseMainSeriesData = format.advancedOptions && format.advancedOptions.movesets === "mainseries"
      let speciesData: Pokemon;
      if (shouldUseMainSeriesData === true) {
        speciesData = mainSeriesPokeData[pokemon.speciesId as keyof typeof mainSeriesPokeData] as Pokemon;
      } else {
        speciesData = pokeData[pokemon.speciesId as keyof typeof pokeData] as Pokemon;
      }
      
      // Check if pokémon violates any of the rules defined in flags
      if(format.flags) {
        if (format.flags.speciesClauseByDex && selectedSpecies.some(species => species.dex === speciesData.dex)) {
          violations.push(strings.team_verify_clause_by_dex.replace('%1', index));
        }
        if (format.flags.speciesClauseByForm && selectedSpecies.some(species => species.speciesId.replace("_shadow", "") === speciesData.speciesId.replace("_shadow", ""))) {
          violations.push(strings.team_verify_clause_by_dex.replace('%1', index));
        }
        if (format.flags.typeClause && selectedSpecies.some(species => isThereADuplicateType(species, speciesData))) {
          violations.push(strings.team_verify_clause_by_type.replace('%1', index));
        }
      }

      //Increase number of points used
      let price = format.pointLimitOptions?.prices.find(priceOption => priceOption.pokemonIds.includes(pokemon.speciesId))?.price
      if(price) {
        pointsUsed += price
      }

      selectedSpecies.push(speciesData);

      if (speciesData.tags && speciesData.tags.some(tag => tag === "mega")) {
          megaCounter++;
      }
    }
  
    // Check if we have too many best buddies
    if (bestBuddyCounter > format.maxBestBuddy) {
      violations.push(strings.team_verify_invalid_bestbuddy.replace("%1", bestBuddyCounter).replace("%2", format.maxBestBuddy));
    }
  
    // Check if we have too many megas
    if (megaCounter > format.maxMega) {
      violations.push(strings.team_verify_invalid_megas.replace("%1", megaCounter).replace("%2", format.maxMega));
    }

    // Check if the budget was overused
    if(format.pointLimitOptions && pointsUsed > format.pointLimitOptions.maxPoints) {
      violations.push(strings.team_verify_invalid_points.replace("%1", pointsUsed).replace("%2", format.pointLimitOptions.maxPoints));
    }

    // Check if the team matches one class
    if(format.classes && !getClassForTeam(format.classes, team)) {
      violations.push(strings.team_verify_invalid_class);
    }

    return {
        isValid: violations.length === 0,
        violations: violations
    }
}

type reducedPoke = {
  speciesId: string
  fastMove?: string
  chargeMoves?: string[]
  gender?: "M" | "F" | "N"
}

export function isSpeciesAllowed(pokemon: reducedPoke, format: Rule, position: number, strings? : any): {isValid: boolean, violations: string[]} {
  let violations: Array<string> = []

  // Get species data
  const shouldUseMainSeriesData = format.advancedOptions?.movesets === "mainseries"
  let speciesData: Pokemon;
  if (shouldUseMainSeriesData === true) {
    speciesData = mainSeriesPokeData[pokemon.speciesId as keyof typeof mainSeriesPokeData] as Pokemon;
  } else {
    speciesData = pokeData[pokemon.speciesId as keyof typeof pokeData] as Pokemon;
  }

  // Check fast moves
  if (pokemon.fastMove !== undefined) {
    // Can the pokémon learn this move?
    if ((format.advancedOptions?.movesets !== "norestrictions") && !speciesData.fastMoves.includes(pokemon.fastMove)) {
      violations.push(strings.team_verify_invalid_move.replace("%1", position).replace("%2", pokemon.fastMove));
    }
    // Does this move even exist?
    if(!Object.keys(moves).includes(pokemon.fastMove)) {
      violations.push(strings.team_verify_move_doesnt_exist?.replace("%1", pokemon.fastMove))
    // Is the fast move a fast move and not a charge move?
    } else if (moves[pokemon.fastMove].energy) {
      violations.push(strings.team_verify_fa_is_ca?.replace("%1", pokemon.fastMove))
    }
  }

  // Check fast moves
  if (pokemon.chargeMoves !== undefined) {
    // Can the pokémon learn the moves?
    const illegalChargeMoves = pokemon.chargeMoves.filter(chargeMove => {
      return format.advancedOptions?.movesets !== "norestrictions" && 
      chargeMove !== "NONE" &&
      !(chargeMove === "RETURN" && speciesData.tags && speciesData.tags.some(tag => tag === "shadoweligible")) &&
      !(chargeMove === "FRUSTRATION" && speciesData.tags && speciesData.tags.some(tag => tag === "shadow")) &&
      !speciesData.chargedMoves.includes(chargeMove);
    });
    for (let illegalChargeMove of illegalChargeMoves) {
      violations.push(strings.team_verify_invalid_move?.replace("%1", position).replace("%2", illegalChargeMove));
    }
    // Does this move even exist?
    const nonExistentChargeMoves = pokemon.chargeMoves.filter(chargeMove => chargeMove !== "NONE" && moves[chargeMove] === undefined)
    for (let illegalChargeMove of nonExistentChargeMoves) {
      violations.push(strings.team_verify_move_doesnt_exist?.replace("%1", illegalChargeMove));
    }
    // Is the charge move a charge move and not a fast move?
    const chargeMovesThatAreFastMoves = pokemon.chargeMoves.filter(chargeMove => !!moves[chargeMove]?.energyGain);
    for (let illegalChargeMove of chargeMovesThatAreFastMoves) {
      violations.push(strings.team_verify_ca_is_fa?.replace("%1", illegalChargeMove));
    }
  }

  // Check gender
   if (!speciesData.gender && pokemon.gender === "N") {
    violations.push(strings.team_verify_invalid_neutral_gender.replace("%1", position.toString()));
  } else if (pokemon.gender && speciesData.gender && pokemon.gender !== speciesData.gender) {
    const genderMap = {
      M: strings.gender_male,
      F: strings.gender_female, 
      N: strings.gender_neutral
    }
    violations.push(strings.team_verify_invalid_wrong_gender.replace("%1", position.toString().replace("%2", genderMap[pokemon.gender])));
  }

  // Check if pokemon is included
  let includeList = Array<Selector>();
  if (format.include) {
      includeList = format.include;
  }
  if (format.teamPattern && format.teamPattern[position] && format.teamPattern[position].include) {
      includeList = includeList.concat(format.teamPattern[position].include!);
  }
  if (includeList.length) {
    let included = false;

    for (let tag of includeList) {
      included = doesSelectorDescribePokémon(tag, speciesData);
      if (included) {
        break;
      }
    }

    if(!included) {
      strings ? violations.push(strings.team_verify_invalid_pokemon.replace("%1", position)) : violations.push("invalid");
    }
  }

  // Check if pokemon is excluded
  let excludeList = Array<Selector>();
  if (format.exclude) {
    excludeList = format.exclude;
  }
  if (format.teamPattern && format.teamPattern[position] && format.teamPattern[position].exclude) {
    excludeList = excludeList.concat(format.teamPattern[position].exclude!);
  }
  if (excludeList.length) {
    let excluded = false;

    for (let tag of excludeList) {
      excluded = doesSelectorDescribePokémon(tag, speciesData);
      if (excluded) {
        break;
      }
    }

    if(excluded) {
      strings ? violations.push(strings.team_verify_banned_pokemon.replace('%1', position)) : violations.push("invalid");
    }
  }

  return {
    isValid: violations.length === 0,
    violations: violations
  }

}
  
export function parseToTeamMembers (team: TeamMemberDescription[]): TeamMember[] {
    return team.map(function(member): TeamMember {
      if (! (member.speciesId in pokeData) || !member.iv) {
        return {
          speciesId: member.speciesId,
          speciesName: "",
          hp: 0,
          def: 0,
          atk: 0,
          cp: 0,
          iv: {
            atk: 0,
            def: 0,
            hp: 0
          },
          level: 0,
          types: ["none", "none"],
          fastMove: "",
          chargeMoves: [""],
          sid: 0,
          gender: "N"
        };
      }
  
      // Calculate stats based on data
      const speciesData = pokeData[member.speciesId as keyof typeof pokeData];
      let baseStats = {
        atk: 0,
        def: 0,
        hp: 0
      }
      if ("atk" in speciesData.baseStats && "def" in speciesData.baseStats && "hp" in speciesData.baseStats) {
        baseStats = speciesData.baseStats;
      }
      const stats = {
        atk: calculateAtk(baseStats.atk, member.level, member.iv.atk),
        def: calculateDef(baseStats.def, member.level, member.iv.def),
        hp: calculateHP(baseStats.hp, member.level, member.iv.hp)
      }
      const cp = calculateCP(baseStats, member.level, member.iv);
  
      return {
        speciesId: member.speciesId,
        speciesName: speciesData.speciesName["en"],
        hp: stats.hp,
        def: stats.def,
        atk: stats.atk,
        iv: member.iv,
        level: member.level,
        cp: cp,
        types: speciesData.types as [typeId, typeId],
        fastMove: member.fastMove,
        chargeMoves: member.chargeMoves,
        shiny: member.shiny,
        name: member.name,
        sid: speciesData.sid,
        gender: member.gender
      };
    })
}

export function getClassForTeam(classes: ClassOption[], team: TeamMember[]): string | undefined {
  return classes.find((classOption) => {
    return team.every(member => doesClassDescribePokemon(member.speciesId, classOption))
  })?.name
}

export function doesClassDescribePokemon(speciesId: string, classOption: ClassOption): boolean {
  const speciesData = mainSeriesPokeData[speciesId as keyof typeof mainSeriesPokeData];
  if(classOption.include && !classOption.include.some(selector => doesSelectorDescribePokémon(selector, speciesData))) {
    return false
  }
  if(classOption.exclude && classOption.exclude.some(selector => doesSelectorDescribePokémon(selector, speciesData))) {
    return false
  }
  return true
}


function doesSelectorDescribePokémon(tag: Selector, poke: PokemonSpecies): boolean {
    if (!poke) {
      return false
    }
    switch (tag.filterType) {
        case "tag":
            return !!poke.tags && tag.values.some(value => poke.tags!.includes(value));
        case "id":
            return tag.values.includes(poke.speciesId)
        case "type":
            return tag.values.some(value => poke.types.includes(value));
        case "dex":
            return tag.values.some(value => {
              let [start, end] = value.split("-");
              let startInt = parseInt(start);
              let endInt = parseInt(end);
              return startInt <= poke.dex && poke.dex <= endInt;
            })
    }
}

function isThereADuplicateType(poke1: PokemonSpecies, poke2: PokemonSpecies): boolean {
    return poke1.types.some(type1 => poke2.types.some(type2 => type1 === type2 && type1 !== "none"));
}