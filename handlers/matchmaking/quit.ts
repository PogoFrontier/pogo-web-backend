import { SearchBattlePayload } from "../../types/handlers";
import { storeClient } from "../../redis/clients";
import { getBattleRequestKey } from "../../redis/getKey";
import { User } from "../../types/user";

function quit(user: User, payload: SearchBattlePayload) {
    const key = getBattleRequestKey(payload.format);

    storeClient.LREM(key, 1, JSON.stringify(user), (err, removedRequests) => {
        if (err) {
            console.error(err);
            return;
        }

        // It didn'tworked
        if(removedRequests !== 1) {
            console.warn("The removal of the battle request didn't work");
            return;
        }
    });
}

export default quit;