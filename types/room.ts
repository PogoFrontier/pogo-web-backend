import { TeamMember } from "./team";
import { Actions } from './actions';

export enum RoomStatus {
  SELECTING,
  STARTING,
  STARTED,
  FAINT,
  CHARGE,
  LISTENING
}

export interface Move {
  "moveId": string,
  "name": string,
  "type": string,
  "power": number,
  "energy": number,
  "energyGain": number,
  "cooldown": number
}

export interface TurnAction {
  id: keyof typeof Actions,
  active: number,
  move?: Move,
}

export interface Player {
  id: string,
  team: TeamMember[],
  current?: {
    team: TeamMember[],
    ready: boolean,
    action?: TurnAction,
    active: number,
    switch: number,
    shields: number,
    remaining: number,
  }
}

export interface Room {
  id: string,
  players: [Player | null, Player | null],
  turn?: number,
  status: RoomStatus,
  wait?: number,
  timer?: any,
  charge?: {
    subject: number,
    move: Move,
    shield?: number,
    multiplier?: number,
    cmp?: Move
  }
}