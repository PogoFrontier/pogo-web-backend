export type typeId =
  | 'none'
  | 'bug'
  | 'dark'
  | 'dragon'
  | 'electric'
  | 'fairy'
  | 'fighting'
  | 'fire'
  | 'flying'
  | 'ghost'
  | 'grass'
  | 'ground'
  | 'ice'
  | 'normal'
  | 'poison'
  | 'psychic'
  | 'rock'
  | 'steel'
  | 'water'
  
  export interface TeamMember {
  speciesId: string
  speciesName: object | string
  hp: number
  def: number
  atk: number
  level: number
  iv: {
    atk: number
    def: number
    hp: number
  }
  cp: number
  types: [typeId, typeId]
  fastMove: string
  chargeMoves: [string, string] | [string]
  sid: number
  shiny?: boolean
  name?: string
  current?: Current
}
  
export interface TeamMemberDescription {
  speciesId: string
  level: number
  iv: {
    atk: number
    def: number
    hp: number
  }
  fastMove: string
  chargeMoves: [string, string] | [string]
  name?: string
  shiny?: boolean
}

export interface Pokemon {
  "dex": number
  "speciesName": object
  "speciesId": string
  "baseStats": {
    "atk": number
    "def": number
    "hp": number
  } | {},
  "types": string[]
  "fastMoves": string[]
  "chargedMoves": string[]
  "tags"?: string[]
  "level25CP"?: number
  "eliteMoves"?: string[]
  "sid": number
}

export interface Team {
  format: string
  members: Array<TeamMember>
}

export interface Current {
  hp: number
  def: number
  atk: number
  status: [number, number]
  energy: number
  damageDealt: number,
  chargeMovesUsed: number,
  timeSpendAlive: number,
  switchedIn?: Date
}

export interface PokemonSpecies {
  speciesName?: object
  speciesId: string
  dex: number
  tags?: string[]
  types: string[]
  ranking?: number
  price?: number
  moveset?: [string, string, string]
}