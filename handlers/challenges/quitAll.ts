import { storeClient, pubClient } from "../../redis/clients"
import { getKeyPatternForChallengesByMe } from "./util"
import { User } from "../../types/user"

function quitAll(challenger: User) {
    storeClient.keys(getKeyPatternForChallengesByMe(challenger)).then((keys) => {
        for(let key of keys) {
            storeClient.del(key)

            const opponentId = key.split(":")[1]
            pubClient.publish("messagesToUser:" + opponentId, "$challengeCancelled|" + JSON.stringify({ id: challenger.googleId, username: challenger.username }))
        }
    })
}

export default quitAll;