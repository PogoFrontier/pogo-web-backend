import { storeClient, pubClient } from "../../redis/clients"
import { getKeyPatternForChallengesByMe } from "./util"

function quitAll(challengerId: string) {
    storeClient.keys(getKeyPatternForChallengesByMe(challengerId)).then((keys) => {
        for(let key in keys) {
            storeClient.del(key)

            const opponentId = key.split(":")[1]
            pubClient.publish("messagesToUser:" + opponentId, "$challengeCancelled|" + challengerId)
        }
    })
}

export default quitAll;