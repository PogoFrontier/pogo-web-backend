import { SearchBattlePayload } from "../../types/handlers";
import { storeClient } from "../../redis/clients";
import { getBattleRequestKey } from "../../redis/getKey";
import { User } from "../../types/user";
import { parseToRule } from "../../actions/parseToRule";

function quit(user: User, payload: SearchBattlePayload) {
    try{        
        const format = parseToRule(payload.format);
        const key = getBattleRequestKey(format);
    
        storeClient.lrem(key, 1, JSON.stringify(user), (err, removedRequests) => {
            if (err) {
                console.error(err);
                return;
            }
    
            // It didn't work
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