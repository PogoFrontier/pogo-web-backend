import { SearchBattlePayload } from "../../types/handlers";
import { storeClient } from "../../redis/clients";
import { getBattleRequestKey } from "../../redis/getKey";
import { User } from "../../types/user";
import { parseToRule } from "../../actions/parseToRule";

function quit(user: User, payload: SearchBattlePayload) {
    try{
        const key = getBattleRequestKey(payload.format);

        storeClient.lrange(key, 0, -1, (err, res) => {
            if (err) {
                console.error(err);
                return;
            }

            const index = res.
                map(asString => JSON.parse(asString)).
                findIndex((userInQueue) => userInQueue.googleId === user.googleId)
            if(index === -1) {
                console.warn("Battle request for deletion not found")
                return
            }

            storeClient.lrem(key, 1, res[index], (err, removedRequests) => {
                if (err) {
                    console.error(err);
                    return;
                }

                // It didn't work
                if (removedRequests !== 1) {
                    console.warn("The removal of the battle request didn't work");
                }
            });
 
        })
    } catch(e) {
        console.error(e);
        return;
    }
}

export default quit;