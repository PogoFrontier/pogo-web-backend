import { getKeyValue } from './util';
import { storeClient, pubClient } from '../../redis/clients';
import { DeclineOrAcceptChallengePayload } from '../../types/handlers'

function decline(userId: string, payload: DeclineOrAcceptChallengePayload) {
    const { challenger } = payload

    const {
        key
    } = getKeyValue(challenger, userId, "")

    storeClient.del(key)
    pubClient.publish("messagesToUser:" + challenger.googleId, "$challengeDeclined|" + userId)
}

export default decline;