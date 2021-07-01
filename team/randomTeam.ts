import fs from "fs";
import { Rule } from "../types/rule";
import { TeamMember, PokemonSpecies, typeId } from "../types/team";
import { calculateCP, getIVs } from "../utils/calcUtils"
import m from "../data/moves.json";
import p from "../data/pokemon.json";
import p2 from "../data/pokemonWithMainSeriesMoves.json";

let moves: any = m;
let quickmoves: Array<string> = [];
let chargemoves: Array<string> = [];
for (let move of Object.keys(moves)) {
    if (moves[move].energy) {
        chargemoves.push(move)
    } else {
        quickmoves.push(move)
    }
}
const pokemon: any = p;
const pokemon2: any = p2;

type TeamMemberWithDex = TeamMember & {
    dex: number
    price?: number
}

type getRandomPokemonParams = {
  rule: Rule
  previousPokemon: TeamMemberWithDex[]
  className?: string
  language: string
}

export function getRandomTeam(rule: Rule, language: string): TeamMember[] {
    const t: TeamMemberWithDex[] = []
    let className: string | undefined = rule.classes
        ? rule.classes[Math.floor(Math.random() * rule.classes.length)].name
        : undefined

    for (let i = 0; i < 6; i++) {
        t.push(getRandomPokemon({
            rule,
            previousPokemon: t,
            className,
            language
        }))
    }

    return t
}

function getRandomPokemon({
    rule,
    previousPokemon,
    className,
    language
  }: getRandomPokemonParams): TeamMemberWithDex {

    // get a random pokemon
    const speciesPool = getAvailableSpecies(rule, previousPokemon, className)
    const randPokemon = getRandomPokemonSpecies(speciesPool)
  
    // get random moves
    const moveset =
      rule.advancedOptions?.movesets === undefined
        ? 'original'
        : rule.advancedOptions.movesets
    const cap = rule.maxCP
    const pokemonSource = rule.advancedOptions?.movesets === "mainseries" ? pokemon2 : pokemon;
    const baseStats = pokemonSource[randPokemon.speciesId].baseStats
    const stats = getIVs({
        pokemon: randPokemon,
        baseStats,
        targetCP: cap ? cap : 10000,
        bbAllowed: previousPokemon.map(poke => poke.level > rule.maxLevel).filter(Boolean).length < rule.maxBestBuddy
    })[0]
  
    let fastMove: string, chargedMoves: [string] | [string, string] = [""];
    if(randPokemon.moveset) {
        fastMove = randPokemon.moveset[0]
        chargedMoves = [randPokemon.moveset[1], randPokemon.moveset[2]]
    } else {
        let chargedMovePool: string[] = [];
        let fastMovePool: string[] = [];
        if(rule.advancedOptions?.movesets === "norestrictions") {
            chargedMovePool = [...chargemoves]
        } else {
            fastMovePool = pokemonSource[randPokemon.speciesId].fastMoves
            chargedMovePool = [...pokemonSource[randPokemon.speciesId].chargedMoves]

            const isShadow = randPokemon.tags?.includes('shadow')
            if (randPokemon.tags?.includes('shadoweligible')) {
              chargedMovePool.push('RETURN')
            } else if (isShadow) {
              chargedMovePool.push('FRUSTRATION')
            }
        }

        let randomMoves = getRandomMoves(
          fastMovePool,
          chargedMovePool
        )
        fastMove = randomMoves.fastMove
        chargedMoves = randomMoves.chargedMoves
    }
  
    return {
        speciesId: randPokemon.speciesId,
        speciesName: (randPokemon.speciesName && randPokemon.speciesName[language]) ? randPokemon.speciesName[language] : randPokemon.speciesId,
        hp: stats.hp,
        atk: stats.atk,
        def: stats.def,
        level: stats.level,
        iv: stats.ivs,
        baseStats: baseStats,
        cp: calculateCP(baseStats, stats.level, stats.ivs),
        price: randPokemon.price,
        types: randPokemon.types as [typeId, typeId],
        fastMove,
        chargeMoves: chargedMoves,
        sid: pokemonSource[randPokemon.speciesId].sid,
        dex: randPokemon.dex,
    }
}

function getAvailableSpecies(rule: Rule, previousPokemon: TeamMemberWithDex[], className: string | undefined): PokemonSpecies[] {
    const position = previousPokemon.length;
    if(className === undefined) {
        className = ""
    } else {
        className = "_" + className
    }
    let fileName = `./data/pokemonForFormats/${rule.name}_${position}${className}.json`
    if(!fs.existsSync(fileName)) {
        fileName = `./data/pokemonForFormats/${rule.name}${className}.json`
    }
    fs.readFileSync(fileName)

    let result = JSON.parse(fs.readFileSync(fileName).toString());
    
    Object.keys(result).forEach(key => {
        if(!result[key].legal) {
            delete result[key];
        }
    })
    if (rule.flags && rule.flags.speciesClauseByForm) {
        previousPokemon.forEach(poke => {
            delete result[poke.speciesId]
            delete result[poke.speciesId + "_shadow"]
        })
    }
    if (rule.flags && rule.flags.speciesClauseByDex) {
        Object.keys(result).forEach(key => {
            if(previousPokemon
                .map((pokemon) => pokemon.dex)
                .includes(result[key].dex)) {
                    delete result[key];
            }
        })
    }
    if (rule.flags && rule.flags.typeClause) {
        Object.keys(result).forEach(key => {
            if(previousPokemon
                .map((pokemon) => pokemon.types)
                .some((poke1Types) =>
                  isThereADuplicateType(poke1Types, result[key].types)
                )) {
                  delete result[key];
            }
        })
    }
    if(rule.pointLimitOptions) {
        const remaining = rule.pointLimitOptions.maxPoints - previousPokemon
        .map(poke => poke.price ? poke.price : 0)
        .reduce((price1, price2) => price1 + price2, 0)
        Object.keys(result).forEach(key => {
            if(result[key].price && result[key].price > remaining) {
                  delete result[key];
            }
        })
    }

    return Object.keys(result).map(key => {
        return {
            ...result[key],
            speciesId: key
        }
    });
}
  
function getRandomPokemonSpecies(speciesPool: PokemonSpecies[]): PokemonSpecies {
    const ratingSum: number = speciesPool
      .map((species) => (species.ranking ? species.ranking : 0))
      .map((rating) => Math.pow(rating / 1000, 6))
      .reduce((r1, r2) => r1 + r2)
  
    if (ratingSum !== 0) {
      let rand = Math.random() * ratingSum
      const randPokemon = speciesPool.find((species) => {
        let rating: number = species.ranking ? species.ranking : 0
        rating = Math.pow(rating / 1000, 6)
        rand -= rating
        return rand <= 0
      })
      if (randPokemon) {
        return randPokemon
      }
    }
  
    return speciesPool[Math.floor(Math.random() * speciesPool.length)]
}
  
function getRandomMoves(
    fastMoves: string[],
    chargedMovePool: string[]
  ): {
    fastMove: string
    chargedMoves: [string, string]
  } {
    // Get moves with equal odds for all moves
    const randCharged1 =
      chargedMovePool[Math.floor(Math.random() * chargedMovePool.length)]
    chargedMovePool.splice(chargedMovePool.indexOf(randCharged1), 1)
    const randCharged2 = chargedMovePool.length === 0
      ? 'NONE'
      : chargedMovePool[Math.floor(Math.random() * chargedMovePool.length)];
    const randFast = fastMoves[Math.floor(Math.random() * fastMoves.length)]
  
    return {
      chargedMoves: [randCharged1, randCharged2],
      fastMove: randFast,
    }
  }
  
  function isThereADuplicateType(
    poke1Types: string[],
    poke2Types: string[]
  ): boolean {
    return poke1Types.some((type1) =>
      poke2Types.some((type2) => type1 === type2 && type1 !== 'none')
    )
  }