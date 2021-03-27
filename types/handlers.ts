import { TeamMember } from "./team";

export interface OnGetOpponentPayload {
  room: string,
}

export interface OnJoinPayload {
  room: string,
  team: TeamMember[]
}

export interface OnNewRoomPayload {
  room: string,
  team: TeamMember[]
}

export interface OnReadyGamePayload {
  room: string,
}

export interface OnTeamSubmitPayload {
  room: string,
  team: TeamMember[]
}

export interface OnActionProps {
  id: string,
  room: string,
  data: string
}

export interface OnChargeEndProps {
  id: string,
  room: string,
  data: string
}

export interface Update {
  id: string,
  active: number,
  hp?: number,
  shouldReturn?: boolean,
  remaining?: number,
  wait?: number,
  energy?: number,
  shields?: number,
  charge?: 1 | 2, // 1 if attacker, 2 if shielder,
  message?: string
}

export interface ResolveTurnPayload {
  time: number,
  update: [Update | null, Update | null],
  switch: number
}