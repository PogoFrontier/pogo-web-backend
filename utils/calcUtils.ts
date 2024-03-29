import { PokemonSpecies } from "../types/team";

export const shadowMult = [1.2, 0.83333331]

var cpms = [0.0939999967813492, 0.1351374320893390, 0.1663978695869450, 0.1926509131553250, 0.2157324701547620, 
    0.2365726514248220, 0.2557200491428380, 0.2735303721065720, 0.2902498841285710, 0.3060573813898630, 
    0.3210875988006590, 0.3354450319964510, 0.3492126762866970, 0.3624577366099390, 0.3752355873584750, 
    0.3875924077138780, 0.3995672762393950, 0.4111935532161000, 0.4225000143051150, 0.4329264205125090, 
    0.4431075453758240, 0.4530599481650490, 0.4627983868122100, 0.4723360853112780, 0.4816849529743190, 
    0.4908558071795490, 0.4998584389686580, 0.5087017489616000, 0.5173939466476440, 0.5259425161103220, 
    0.5343543291091920, 0.5426357538035990, 0.5507926940917970, 0.5588305844903850, 0.5667545199394230, 
    0.5745691281453700, 0.5822789072990420, 0.5898879078889450, 0.5974000096321110, 0.6048236486651710, 
    0.6121572852134700, 0.6194041079582340, 0.6265671253204350, 0.6336491787485760, 0.6406529545784000, 
    0.6475809713865540, 0.6544356346130370, 0.6612192658058590, 0.6679340004920950, 0.6745818856474920, 
    0.6811649203300480, 0.6876849012553730, 0.6941436529159550, 0.7005429010330630, 0.7068842053413390, 
    0.7131690748738230, 0.7193990945816040, 0.7255755869151540, 0.7317000031471250, 0.7347410385504290, 
    0.7377694845199580, 0.7407855797371360, 0.7437894344329830, 0.7467811972477650, 0.7497610449790950, 
    0.7527290997322810, 0.7556855082511900, 0.7586303702098510, 0.7615638375282290, 0.7644860495921800, 
    0.7673971652984620, 0.7702972936773620, 0.7731865048408510, 0.7760649470649920, 0.7789327502250670, 
    0.7817900507676660, 0.7846369743347170, 0.7874736085132750, 0.7903000116348270, 0.792803950958807, 
    0.795300006866455, 0.797803921486970, 0.800300002098083, 0.802803892322847, 0.805299997329711, 
    0.807803863460723, 0.810299992561340, 0.812803834895026, 0.815299987792968, 0.817803806620319, 
    0.820299983024597, 0.822803778631297, 0.825299978256225, 0.827803750922782, 0.830299973487854, 
    0.832803753381377, 0.835300028324127, 0.837803755931569, 0.840300023555755, 0.842803729034748, 
    0.845300018787384, 0.847803702398935, 0.850300014019012, 0.852803676019539, 0.855300009250640, 
    0.857803649892077, 0.860300004482269, 0.862803624012168, 0.865299999713897]

export interface statset {
    atk: number
    def: number
    hp: number
}

export function calculateCP(baseStats: statset, level: number, iv: statset){
    var cpm = getCpmByLevel(level)
	var cp = Math.floor(( (baseStats.atk+iv.atk) * Math.pow(baseStats.def+iv.def, 0.5) * Math.pow(baseStats.hp+iv.hp, 0.5) * Math.pow(cpm, 2) ) / 10);

	return cp;
}

export function calculateHP(baseStat: number, level: number, iv: number){
    var cpm = getCpmByLevel(level)
    var hp = Math.max(Math.floor(cpm * (baseStat + iv)), 10)
    return hp
}

export function calculateAtk(baseStat: number, level: number, iv: number) {
    var cpm = getCpmByLevel(level)
    var atk =  cpm * (baseStat + iv);

    return atk;
}

export function calculateDef(baseStat: number, level: number, iv: number){
    var cpm = getCpmByLevel(level)
    var atk =  cpm * (baseStat + iv);

    return atk;
}

interface GetIVsProps {
    pokemon: PokemonSpecies
    baseStats: statset,
    targetCP: number
    sortStat?: 'atk' | 'def' | 'overall'
    sortDirection?: number
    resultCount?: number
    ivFloor?: number
    bbAllowed: boolean
}
  
export function getIVs({
    pokemon,
    baseStats,
    targetCP,
    sortStat = 'overall',
    sortDirection = 1,
    resultCount = 1,
    ivFloor,
    bbAllowed = true
  }: GetIVsProps) {
    const levelCap = 50
    let level = 0.5
    let atkIV = 15
    let defIV = 15
    let hpIV = 15
    let calcCP = 0
    let overall = 0
    let bestStat = 0
    let cpm = 0
    const combinations = []
  
    if (sortDirection === -1) {
      bestStat = Infinity
    }
  
    let floor = 0
  
    if (pokemon.tags && pokemon.tags.includes('legendary')) {
      floor = 1
    }
  
    if (ivFloor) {
      floor = ivFloor
    }
  
    if (pokemon.tags && pokemon.tags.includes('untradeable')) {
      floor = 10
    }
  
    hpIV = 15
    while (hpIV >= floor) {
      defIV = 15
      while (defIV >= floor) {
        atkIV = 15
        while (atkIV >= floor) {
          level = getMaxLevel(
            baseStats,
            { atk: atkIV, def: defIV, hp: hpIV },
            targetCP,
            levelCap,
            bbAllowed
          )
          cpm = cpms[(level - 1) * 2]
          calcCP = calculateCP(baseStats, level, { atk: atkIV, def: defIV, hp: hpIV })
  
          if (calcCP <= targetCP) {
            const atk = cpm * (baseStats.atk + atkIV)
            const def = cpm * (baseStats.def + defIV)
            const hp = Math.floor(cpm * (baseStats.hp + hpIV))
            overall = hp * atk * def
  
            const combination = {
              level,
              ivs: {
                atk: atkIV,
                def: defIV,
                hp: hpIV,
              },
              atk,
              def,
              hp,
              overall,
              cp: calcCP,
            }
  
            if (pokemon.tags && pokemon.tags.includes('shadow')) {
              combination.atk *= shadowMult[0]
              combination.def *= shadowMult[1]
            }
  
            let valid = true
  
            // This whole jumble won't include combinations that don't beat our best or worst if we just want one result
            if (resultCount === 1) {
              if (sortDirection === 1) {
                if (combination[sortStat] < bestStat) {
                  valid = false
                }
              } else if (sortDirection === -1) {
                if (combination[sortStat] > bestStat) {
                  valid = false
                }
              }
              if (valid) {
                bestStat = combination[sortStat]
              }
            }
            if (valid) {
              combinations.push(combination)
            }
          }
          atkIV--
        }
        defIV--
      }
      hpIV--
    }
  
    combinations.sort((a, b) =>
      a[sortStat] > b[sortStat]
        ? -1 * sortDirection
        : b[sortStat] > a[sortStat]
        ? 1 * sortDirection
        : 0
    )
    const results = combinations.splice(0, resultCount)
  
    return results
}

  
function getMaxLevel(
    baseStats: statset,
    iv: statset,
    targetCP: number,
    levelCap: number,
    bbAllowed: boolean
  ): number {
    let level = 0.5
    if(bbAllowed) {
        levelCap += 1 // For best buddy
    }
    let calcCP = 0
  
    while (level < levelCap && calcCP <= targetCP) {
      level += 0.5
      calcCP = calculateCP(baseStats, level, iv)
    }
  
    if (calcCP > targetCP) {
      level -= 0.5
    }
  
    return level
  }

function getCpmByLevel(level: number){
    return  cpms[(level - 1) * 2]
}
