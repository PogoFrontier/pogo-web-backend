// in seconds
export const SWAP_COOLDOWN = 60;
export const GAME_TIME = 240;
export const SWITCH_WAIT = 12;
export const SWITCH_WAIT_LAST = 3;
export const CHARGE_WAIT = 8;
export const ANIMATING_WAIT = 3;
export const SELECT_TEAM_TIME = 92;
// in ms
export const TURN_LENGTH = 500;

export const buffDivisor = 4;
export const maxBuffStages = 4;

//export const REDIS_URL = "redis";
export const REDIS_URL = process.env.REDIS_URL || '127.0.0.1';