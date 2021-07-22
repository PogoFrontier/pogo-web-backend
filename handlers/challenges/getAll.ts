import { storeClient, pubClient } from "../../redis/clients"
import { getKeyPatternForChallengesToMe, getChallengerOfKey } from "./util"

function getAll(userId: string) {
    storeClient.keys(getKeyPatternForChallengesToMe(userId)).then((keys) => {

        // Look up each challenge and notify the user for each separately
        for (let key of keys) {
            storeClient.get(key).then((value) => {
                pubClient.publish("messagesToUser:" + userId, "$challengedBy|" + JSON.stringify({
                    challenger: getChallengerOfKey(key),
                    format: value
                }))
            })
        }
    })
}

export default getAll;