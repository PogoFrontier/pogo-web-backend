export interface OnGetOpponentPayload {
  room: string,
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