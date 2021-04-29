import Redis from "ioredis";
import {REDIS_URL} from "../config";
export let storeClient = process.env.REDIS_URL 
  ? new Redis.Cluster([
    {
      port: 6379,
      host: REDIS_URL,
    }])
  : new Redis(6379, REDIS_URL);
export const pubClient = storeClient.duplicate();
export const subClient = storeClient.duplicate();