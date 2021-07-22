import { storeClient } from "../../redis/clients"
import { getKeyPatternForChallengesByMe } from "./util"

function quitAll(challengerId: string) {
    storeClient.keys(getKeyPatternForChallengesByMe(challengerId)).then((keys) => {
        for(let key in keys) {
            storeClient.del(key)
        }
    })
}

export default quitAll;