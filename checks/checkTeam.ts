import { Rule, Selector } from "../types/rule";
import { TeamMember, TeamMemberDescription, typeId } from "../types/team";
import { calculateCP, calculateHP, calculateAtk,calculateDef } from "../utils/calcUtils";
import pokeData from "./../data/pokemon.json";

export function isTeamValid(team: TeamMember[], format: Rule): {isValid: boolean, violations: string[]} {
    let violations = new Array<string>();
  
    if (team.length !== 6) {
      violations.push(`Wrong team length ${team.length}. Should be 6.`)
    }
  
    let megaCounter = 0;
    let bestBuddyCounter = 0;
    let selectedSpecies = Array<species>();
  
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
  
      // Get species data
      const speciesData = pokeData[pokemon.speciesId as keyof typeof pokeData];

      // Check moves
      if (!speciesData.fastMoves.includes(pokemon.fastMove)) {
        violations.push(`Pokemon in index ${index} cannot use ${pokemon.fastMove}`);
      }
      const illegalChargeMoves = pokemon.chargeMoves.filter(chargeMove => {
        return chargeMove !== "NONE" &&
        !(chargeMove === "RETURN" && "tags" in speciesData && speciesData.tags.some(tag => tag === "shadoweligible")) &&
        !(chargeMove === "FRUSTRATION" && "tags" in speciesData && speciesData.tags.some(tag => tag === "shadow")) &&
        !speciesData.chargedMoves.includes(chargeMove);
      });
      for (let illegalChargeMove of illegalChargeMoves) {
        violations.push(`Pokemon in index ${index} cannot use ${illegalChargeMove}`);
      }
  
      // Check if pokemon is included
      let includeList = Array<Selector>();
      if (format.include) {
          includeList = format.include;
      }
      if (format.teamPattern && format.teamPattern[index] && format.teamPattern[index].include) {
          includeList = includeList.concat(format.teamPattern[index].include!);
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
          violations.push(`Pokemon in index ${index} is not allowed`);
        }
      }

      // Check if pokemon is excluded
      let excludeList = Array<Selector>();
      if (format.exclude) {
        excludeList = format.exclude;
      }
      if (format.teamPattern && format.teamPattern[index] && format.teamPattern[index].exclude) {
        excludeList = includeList.concat(format.teamPattern[index].exclude!);
      }
      if (excludeList.length) {
        let excluded = false;

        for (let tag of excludeList) {
          let excluded = doesSelectorDescribePokémon(tag, speciesData);
          if (excluded) {
            break;
          }
        }

        if(excluded) {
          violations.push(`Pokemon in index ${index} is panned`);
        }
      }

      // Check if pokémon violates any of the rules defined in flags
      if(format.flags) {
        if (format.flags.speciesClauseByDex && selectedSpecies.some(species => species.dex === speciesData.dex)) {
          violations.push(`Pokemon in index ${index} is a duplicate and violates the species clause by dex`);
        }
        if (format.flags.speciesClauseByForm && selectedSpecies.some(species => species.speciesId === speciesData.speciesId)) {
          violations.push(`Pokemon in index ${index} is a duplicate and violates the species clause by form`);
        }
        if (format.flags.typeClause && selectedSpecies.some(species => isThereADuplicateType(species, speciesData))) {
          violations.push(`Pokemon in index ${index} has a duplicate type and violates the typeClause`);
        }
      }

      selectedSpecies.push(speciesData);

      if ("tags" in speciesData && speciesData.tags.some(tag => tag === "mega")) {
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
  
    return {
        isValid: violations.length === 0,
        violations: violations
    }
}
  
export function parseToTeamMembers (team: TeamMemberDescription[]): TeamMember[] {
    if (!team || team.length <= 0) {
      return []
    }
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
      const isShadow = 'tags' in speciesData && speciesData.tags.some(tag => tag === "shadow");
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

type species = {
    speciesId: string
    dex: number
    tags?: string[]
    types: string[]
}

function doesSelectorDescribePokémon(tag: Selector, poke: species): boolean {
    switch (tag.type) {
        case "tag":
            return !!poke.tags && poke.tags.includes(tag.name);
        case "id":
            return poke.speciesId === tag.name
        case "type":
            return poke.types.includes(tag.name);
        case "dex":
            let [start, end] = tag.name.split("-");
            let startInt = parseInt(start);
            let endInt = parseInt(end);
            return startInt <= poke.dex && poke.dex <= endInt;
    }
}

function isThereADuplicateType(poke1: species, poke2: species): boolean {
    return poke1.types.some(type1 => poke2.types.some(type2 => type1 === type2 && type1 !== "none"));
}