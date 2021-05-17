import { Actions } from './actions';
import { Rule } from "./rule";
import { TeamMember } from "./team";
import { Redis, Cluster } from "ioredis";

export enum RoomStatus {
  READY,
  SELECTING,
  STARTING,
  STARTED,
  FAINT,
  CHARGE,
  ANIMATING,
  ENDED
}

export interface Move {
  "moveId": string,
  "name": string,
  "type": string,
  "power": number,
  "energy": number,
  "energyGain": number,
  "cooldown": number,
  "buffs"?: [number, number],
  "buffTarget"?: string,
  "buffApplyChance"?: string
}

export interface TurnAction {
  id: typeof Actions[keyof typeof Actions],
  active: number,
  move?: Move,
  string?: string
}

export interface Player {
  id: string,
  team: TeamMember[],
  current?: {
    team: TeamMember[],
    ready: boolean,
    action?: TurnAction,
    bufferedAction?: TurnAction,
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
  timerId?: string,
  joinTimeout?: NodeJS.Timeout,
  reservedSeats?: [string, string],
  rated?: boolean,
  charge?: {
    subject: number,
    move: Move,
    shield?: number,
    multiplier?: number,
    cmp?: Move
  },
  format: Rule,
  subClient: Cluster | Redis | any
}