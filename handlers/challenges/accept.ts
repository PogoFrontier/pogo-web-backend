import { getKeyValue } from './util';
import { storeClient } from '../../redis/clients';
import { DeclineOrAcceptChallengePayload } from '../../types/handlers'
import startMatch from '../matchmaking/startMatch';

function accept(userId: string, payload: DeclineOrAcceptChallengePayload) {
    const { challengerId } = payload

    const {
        key
    } = getKeyValue(challengerId, userId, "")

    storeClient.get(key).then(value => {
        storeClient.del(key);

        startMatch(value!, [challengerId, userId], false)
    })
}

export default accept;