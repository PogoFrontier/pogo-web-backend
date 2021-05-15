import Filter from "bad-words"
import { ClassOption, Rule, Selector } from "../types/rule";
import { Pokemon, TeamMember, TeamMemberDescription, typeId, PokemonSpecies } from "../types/team";
import { calculateCP, calculateHP, calculateAtk,calculateDef } from "../utils/calcUtils";
import pokeData from "../data/pokemon.json";
import mainSeriesPokeData from "../data/pokemonWithMainSeriesMoves.json";

const curseWordFilter = new Filter() 

export function isTeamValid(team: TeamMember[], format: Rule): {isValid: boolean, violations: string[]} {
    let violations = new Array<string>();
  
    if (team.length !== 6) {
      violations.push(`Wrong team length ${team.length}. Should be 6.`)
    }
  
    let megaCounter = 0;
    let bestBuddyCounter = 0;
    let pointsUsed = 0;
    let selectedSpecies = Array<PokemonSpecies>();
  
    for (const index in team) {
      const pokemon = team[index];
  
      // Check if pokemon exists
      if (! (pokemon.speciesId in pokeData)) {
        violations.push(`Pokemon with id ${pokemon.speciesId} doesn't exist`);
        continue;
      }
  
      // Check valid iv
      if (pokemon.iv.atk < 0 || pokemon.iv.atk > 15) {
        violations.push(`Pokemon in index ${index} has invalid attack iv of ${pokemon.iv.atk}`);
      }
      if (pokemon.iv.def < 0 || pokemon.iv.def > 15) {
        violations.push(`Pokemon in index ${index} has invalid defense iv of ${pokemon.iv.def}`);
      }
      if (pokemon.iv.hp < 0 || pokemon.iv.hp > 15) {
        violations.push(`Pokemon in index ${index} has invalid hp iv of ${pokemon.iv.hp}`);
      }
  
      // Check valid level
      if (pokemon.level < 1 || pokemon.level > format.maxLevel + 1) {
        violations.push(`Pokemon in index ${index} has invalid level ${pokemon.level}`);
      } else if (pokemon.level > format.maxLevel) {
        bestBuddyCounter++;
      }
  
      // Check valid cp
      if (pokemon.cp > format.maxCP) {
        violations.push(`Pokemon in index ${index} has too many cp: ${pokemon.cp}`);
      }

      // Check nickname length
      if(pokemon.name && pokemon.name.length > 12) {
        violations.push(`The nickname ${pokemon.name} exceeds the character limit of 12`);
      }

      // Check nickname for curse words
      if(pokemon.name && curseWordFilter.isProfane(pokemon.name)) {
        violations.push(`We don't like the nickname ${pokemon.name}. Your pokémon have feelings, too.`);
      }

      // check if pokémon is legal
      const {
        violations: speciesViolations
      } = isSpeciesAllowed(pokemon, format, parseInt(index));
      violations.push(...speciesViolations)
  
      // Get species data
      const shouldUseMainSeriesData = format.advancedOptions && format.advancedOptions.movesets === "mainseries"
      const speciesData: Pokemon = shouldUseMainSeriesData === true ? mainSeriesPokeData[pokemon.speciesId as keyof typeof mainSeriesPokeData] : pokeData[pokemon.speciesId as keyof typeof pokeData];
      
      // Check if pokémon violates any of the rules defined in flags
      if(format.flags) {
        if (format.flags.speciesClauseByDex && selectedSpecies.some(species => species.dex === speciesData.dex)) {
          violations.push(`Pokemon in index ${index} is a duplicate and violates the species clause by dex`);
        }
        if (format.flags.speciesClauseByForm && selectedSpecies.some(species => species.speciesId.replace("_shadow", "") === speciesData.speciesId.replace("_shadow", ""))) {
          violations.push(`Pokemon in index ${index} is a duplicate and violates the species clause by form`);
        }
        if (format.flags.typeClause && selectedSpecies.some(species => isThereADuplicateType(species, speciesData))) {
          violations.push(`Pokemon in index ${index} has a duplicate type and violates the typeClause`);
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
      violations.push(`Team has too many best buddies: ${bestBuddyCounter}`);
    }
  
    // Check if we have too many megas
    if (megaCounter > format.maxMega) {
      violations.push(`Team has too many megas: ${megaCounter}`);
    }

    // Check if the budget was overused
    if(format.pointLimitOptions && pointsUsed > format.pointLimitOptions.maxPoints) {
      violations.push(`Team uses up too many points: ${pointsUsed}`);
    }

    // Check if the team matches one class
    if(format.classes && !getClassForTeam(format.classes, team)) {
      violations.push(`Team doesn't match any class`);
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
}

export function isSpeciesAllowed(pokemon: reducedPoke, format: Rule, position: number): {isValid: boolean, violations: string[]} {
  let violations: Array<string> = []

  // Get species data
  const shouldUseMainSeriesData = format.advancedOptions && format.advancedOptions.movesets === "mainseries"
  const speciesData: Pokemon = shouldUseMainSeriesData ? mainSeriesPokeData[pokemon.speciesId as keyof typeof mainSeriesPokeData] : pokeData[pokemon.speciesId as keyof typeof pokeData];

  // Check moves
  if (pokemon.fastMove !== undefined && (!format.advancedOptions || format.advancedOptions.movesets !== "norestrictions")) {
    if (!speciesData.fastMoves.includes(pokemon.fastMove)) {
      violations.push(`Pokemon in index ${position} cannot use ${pokemon.fastMove}`);
    }
  }
  if (pokemon.chargeMoves !== undefined && (!format.advancedOptions || format.advancedOptions.movesets !== "norestrictions")) {
    const illegalChargeMoves = pokemon.chargeMoves.filter(chargeMove => {
      return chargeMove !== "NONE" &&
      !(chargeMove === "RETURN" && speciesData.tags && speciesData.tags.some(tag => tag === "shadoweligible")) &&
      !(chargeMove === "FRUSTRATION" && speciesData.tags && speciesData.tags.some(tag => tag === "shadow")) &&
      !speciesData.chargedMoves.includes(chargeMove);
    });
    for (let illegalChargeMove of illegalChargeMoves) {
      violations.push(`Pokemon in index ${position} cannot use ${illegalChargeMove}`);
    }
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
      violations.push(`Pokemon in index ${position} is not allowed`);
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
      violations.push(`Pokemon in index ${position} is banned`);
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
          sid: 0
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
        speciesName: speciesData.speciesName,
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
        sid: speciesData.sid
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