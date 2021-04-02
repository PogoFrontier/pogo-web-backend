import { SearchBattlePayload } from "../../types/handlers";
import { storeClient } from "../../redis/clients";
import { getBattleRequestKey } from "../../redis/getKey";
import { User } from "../../types/user";
import getMatch from "./getMatch";
import startMatch from "./startMatch";

function searchBattle(user: User, payload: SearchBattlePayload, recursionCounter?: number) {
    const key = getBattleRequestKey(payload.format);

    // Get current battle requests for this format
    storeClient.LRANGE(key, 0, -1, (err, requests) => {
        if (err) {
            console.error(err);
            return;
        }

        const usersInQueue: Array<User> = requests.map(request => JSON.parse(request));

        // Find a good battle partner for this player
        const match = getMatch(payload.format, user, usersInQueue);

        // No partner found? Let's put this player on the list so another server can match him
        if (!match) {
            storeClient.LPUSH(key, JSON.stringify(user), (err) => {
                if (err) {
                    console.error(err);
                }
            });
            return;
        }

        // Remove the matched client from the list
        storeClient.LREM(key, 1, JSON.stringify(match), (err, removedRequests) => {
            if (err) {
                console.error(err);
                return;
            }

            // It worked. Now let's start the match
            if(removedRequests === 1) {
                startMatch(payload.format, [user, match]);
                return;
            }
            
            // It didn't work. Let's try again. First we update the recursion counter to avoid a stack overflow
            if(!recursionCounter) {
                recursionCounter = 0;
            }
            recursionCounter++;

            // Call method again.
            if(recursionCounter <=10) {
                searchBattle(user, payload, recursionCounter)

            // If this is the eleventh iteration (which should be extremly rare), just give up and add our name to the list
            } else {
                storeClient.LPUSH(key, JSON.stringify(user), (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            }
            
        });

    });
}

export default searchBattle;