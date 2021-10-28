import startMatch from "./startMatch";
import { storeClient } from "../../redis/clients";
import getMatch from "./getMatch";
import { CODE } from "../../types/actions";

// Every 10s go through the requests and try to match players with each other
export default function start() {
setInterval(() => {
    // look for all formats
    storeClient.keys("searchBattle:*", (err, keys) => {
        for (let key of keys) {
            const format = JSON.parse(key.split(":")[1])

            // look into every battle request of this format
            storeClient.lrange(key, 0, -1, (err, requests) => {
                for (let i = 0; i < requests.length - 1; i++) {
                    const request = JSON.parse(requests[i]);
                    
                    // find match
                    const match = getMatch(format, request, requests.splice(i+1).map(req => JSON.parse(req)))

                    // if we found a match
                    if(match) {

                        // remove those items from local and from redis
                        i--;
                        requests = requests.filter(req => req !== JSON.stringify(request) && req !== JSON.stringify(match))
                        storeClient.
                            multi().
                            lrem(key, 1, JSON.stringify(request)).
                            lrem(key, 1, JSON.stringify(match)).
                            exec(err => {
                                if(err) {
                                    console.error(err)
                                    return;
                                }

                                // start the match
                                startMatch(format, [request, match], !key.endsWith(CODE.UnrankedSuffix));
                            })

                    }
                }
            })
        }
    })
}, 10000)
}