import { getKeyValue } from './util';
import { storeClient, pubClient } from '../../redis/clients';
import { DeclineOrAcceptChallengePayload } from '../../types/handlers'

function decline(userId: string, payload: DeclineOrAcceptChallengePayload) {
    const { challengerId } = payload

    const {
        key
    } = getKeyValue(challengerId, userId, "")

    storeClient.del(key)
    pubClient.publish("messagesToUser:" + challengerId, "$challengeDeclined|" + userId)
}

export default decline;