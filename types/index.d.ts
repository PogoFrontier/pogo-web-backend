import * as team from './team';
import * as room from './room';
import * as handlers from './handlers';
export interface TeamMember extends team.TeamMember {
}
export interface Current extends team.Current {
}
export interface TurnAction extends room.TurnAction {
}
export interface Player extends room.Player {
}
export interface Room extends room.Room {
}
export interface OnGetOpponentPayload extends handlers.OnGetOpponentPayload {
}
export interface OnNewRoomPayload extends handlers.OnNewRoomPayload {
}
export interface OnReadyGamePayload extends handlers.OnReadyGamePayload {
}
export interface OnTeamSubmitPayload extends handlers.OnTeamSubmitPayload {
}
