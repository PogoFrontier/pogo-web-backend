import { storeClient, pubClient } from "../../redis/clients"
import { getKeyValue } from "./util"
import { QuitChallengePayload } from "../../types/handlers"

function quitChallenge(challengerId: string, payload: QuitChallengePayload) {
    const { opponentId } = payload

    const {
        key
    } = getKeyValue(challengerId, opponentId, "")

    storeClient.del(key)
    pubClient.publish("messagesToUser:" + opponentId, "$challengeCancelled|" + challengerId)
}

export default quitChallenge;