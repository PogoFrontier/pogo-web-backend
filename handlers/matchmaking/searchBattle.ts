import { SearchBattlePayload } from "../../types/handlers";
import { storeClient } from "../../redis/clients";
import { getBattleRequestKey } from "../../redis/getKey";
import { UserInQueue, User } from "../../types/user";
import getMatch from "./getMatch";
import startMatch from "./startMatch";
import { Rule } from "../../types/rule";
import { parseToRule } from "../../actions/parseToRule";

function searchBattle(user: User, payload: SearchBattlePayload, recursionCounter?: number) {
    let format: Rule;
    try{        
        format = parseToRule(payload.format);
    } catch(e) {
        console.error(e);
        return;
    }

    // Guest users cannot participate in ranked matches
    if(user.isGuest && !format.unranked) {
        return;
    }

    const key = getBattleRequestKey(payload.format);

    // Get current battle requests for this format
    storeClient.lrange(key, 0, -1, (err, requests) => {
        if (err) {
            console.error(err);
            return;
        }

        const usersInQueue: Array<UserInQueue> = requests.map(request => JSON.parse(request));

        const userWithTimestamp: UserInQueue = {
            googleId: user.googleId,
            username: user.username,
            isGuest: user.isGuest,
            waitingSince: new Date().getTime()
        }
        if(format.unranked) {
            userWithTimestamp.ranking = 0
        }

        if (usersInQueue.some(userInQueue => userInQueue.googleId === user.googleId)) {
            console.error("This is an attempt to enter the queue twice")
            return;
        }

        // Find a good battle partner for this player
        const match = getMatch(payload.format, userWithTimestamp, usersInQueue);

        // No partner found? Let's put this player on the list so another server can match him
        if (!match) {
            storeClient.lpush(key, JSON.stringify(userWithTimestamp), (err) => {
                if (err) {
                    console.error(err);
                }
            });
            return;
        }

        // Remove the matched client from the list
        storeClient.lrem(key, 1, JSON.stringify(match), (err, removedRequests) => {
            if (err) {
                console.error(err);
                return;
            }

            // It worked. Now let's start the match
            if(removedRequests === 1) {
                startMatch(payload.format, [user, match], !format.unranked);
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
                storeClient.lpush(key, JSON.stringify(userWithTimestamp), (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            }
            
        });

    });
}

export default searchBattle;