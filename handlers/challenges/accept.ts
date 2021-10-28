import { getKeyValue } from './util';
import { storeClient } from '../../redis/clients';
import { DeclineOrAcceptChallengePayload } from '../../types/handlers'
import startMatch from '../matchmaking/startMatch';
import { User } from '../../types/user';

function accept(user: User, payload: DeclineOrAcceptChallengePayload) {
    const { challenger } = payload

    const {
        key
    } = getKeyValue(challenger, user.googleId, "")

    storeClient.get(key).then(value => {
        storeClient.del(key);

        startMatch(value!, [challenger, user], false)
    })
}

export default accept;