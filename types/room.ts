import { TeamMember } from "./team";

export enum RoomStatus {
  SELECTING,
  STARTING,
  STARTED
}

export interface TurnAction {

}

export interface Player {
  id: string,
  team: TeamMember[],
  current?: {
    team: TeamMember[],
    ready: boolean,
    action?: TurnAction
  }
}

export interface Room {
  id: string,
  players: [Player | null, Player | null],
  turn?: number,
  status: RoomStatus
}