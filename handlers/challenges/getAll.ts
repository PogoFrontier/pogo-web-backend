import { storeClient, pubClient } from "../../redis/clients"
import { getKeyPatternForChallengesToMe, getChallengerOfKey } from "./util"
import { User } from "../../types/user"

function getAll(user: User) {
    storeClient.keys(getKeyPatternForChallengesToMe(user)).then((keys) => {

        // Look up each challenge and notify the user for each separately
        for (let key of keys) {
            storeClient.get(key).then((value) => {
                pubClient.publish("messagesToUser:" + user.googleId, "$challengedBy|" + JSON.stringify({
                    challenger: getChallengerOfKey(key),
                    format: value
                }))
            })
        }
    })
}

export default getAll;