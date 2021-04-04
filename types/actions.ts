export const CODE = {
  room: "ROOM",
  matchmaking_search_battle: "MATCHMAKING_SEARCH_BATTLE",
  matchmaking_quit: "MATCHMAKING_QUIT",
  close: "CLOSE",
  get_opponent: "GET_OPPONENT",
  room_leave: "ROOM_LEAVE",
  room_join: "ROOM_JOIN",
  team_submit: "TEAM_SUBMIT",
  team_confirm: "TEAM_CONFIRM",
  ready_game: 'READY_GAME',
  game_check: 'GAME_CHECK',
  game_start: 'GAME_START',
  turn: 'TURN'
}

export const Actions = {
  FAST_ATTACK: "fa",
  SWITCH: "sw",
  CHARGE_ATTACK: "ca"
}

export type Action = | typeof Actions.FAST_ATTACK | typeof Actions.SWITCH | typeof Actions.CHARGE_ATTACK;