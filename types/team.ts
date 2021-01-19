export interface TeamMember {
  speciesId: string
  speciesName: string
  hp: number
  def: number
  atk: number
  level?: number
  iv?: {
    atk: number
    def: number
    hp: number
  }
  cp: number
  types: [string, string]
  fastMove: string
  chargeMoves: [string, string] | [string]
  sid: number
  shiny?: boolean
  name?: string
  current?: Current
}

export interface Team {
  id: string,
  name: string,
  format: string
  members: Array<TeamMember>
}

export interface Current {
  hp: number
  def: number
  atk: number
  status: [number, number]
  energy: number
}
