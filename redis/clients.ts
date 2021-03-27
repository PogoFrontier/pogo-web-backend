import redis from "redis";
import {REDIS_URL} from "../config";

export const storeClient = redis.createClient({
    url: REDIS_URL
  });
export const pubClient = storeClient.duplicate();
export const subClient = storeClient.duplicate();