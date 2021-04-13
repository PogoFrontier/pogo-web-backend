import { SearchBattlePayload } from "../../types/handlers";
import { storeClient } from "../../redis/clients";
import { getBattleRequestKey } from "../../redis/getKey";
import { parseToRule } from "../../types/rule";
import { User } from "../../types/user";

function quit(user: User, payload: SearchBattlePayload) {
    try{        
        const format = parseToRule(payload.format);
        const key = getBattleRequestKey(format);
    
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
    } catch(e) {
        console.error(e);
        return;
    }
}

export default quit;