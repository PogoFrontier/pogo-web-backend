// in seconds
export const SWAP_COOLDOWN = 30;
export const GAME_TIME = 240;
export const SWITCH_WAIT = 12;
export const CHARGE_WAIT = 8;
// in ms
export const TURN_LENGTH = 500;

export const buffDivisor = 4;
export const maxBuffStages = 4;

// export const REDIS_URL = "redis://redis:6379";
export const REDIS_URL = process.env.NODE_ENV === "production"
? "redis://backend-redis.rvgxml.ng.0001.use2.cache.amazonaws.com:6379"
: "redis://127.0.0.1:6379";