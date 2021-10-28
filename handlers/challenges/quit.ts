import { storeClient, pubClient } from "../../redis/clients"
import { getKeyValue } from "./util"
import { QuitChallengePayload } from "../../types/handlers"
import { User } from '../../types/user';

function quitChallenge(challenger: User, payload: QuitChallengePayload) {
    const { opponentId } = payload

    const {
        key
    } = getKeyValue(challenger, opponentId, "")

    storeClient.del(key)
    pubClient.publish("messagesToUser:" + opponentId, "$challengeCancelled|" + JSON.stringify({ id: challenger.googleId, username: challenger.username }))
}

export default quitChallenge;