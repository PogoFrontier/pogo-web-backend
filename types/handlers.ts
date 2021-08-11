import { TeamMember, TeamMemberDescription } from "./team";
import { RuleDescription } from "./rule";
import { Move } from "./room";
import { Actions } from "./actions";

export interface OnGetOpponentPayload {
  room: string,
}

export interface OnJoinPayload {
  room: string,
  team: TeamMemberDescription[]
}

export interface OnNewRoomPayload {
  room: string,
  format?: RuleDescription,
  team: TeamMemberDescription[],
  fromMatchmaker?: boolean
}

export interface OnReadyGamePayload {
  room: string,
}

export interface OnTeamSubmitPayload {
  room: string,
  indexes: number[]
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
  turn: number,
  team: TeamMember[]
  update: [Update | null, Update | null],
  switch: number
}

export interface SearchBattlePayload {
  format: RuleDescription,
}

type a = typeof Actions

export interface Anim {
  move?: Move,
  type: "faint" | a["FAST_ATTACK"] | a["CHARGE_ATTACK"] | a["SWITCH"],
  turn?: number,
  id: string
}

export interface OpenChallengePayload {
  opponentId: string,
  format: RuleDescription
}

export interface QuitChallengePayload {
  opponentId: string
}

export interface DeclineOrAcceptChallengePayload {
  challengerId: string
}
