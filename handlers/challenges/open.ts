import { OpenChallengePayload } from '../../types/handlers'
import { firestore } from '../../firestore/firestore';
import { storeClient, pubClient } from '../../redis/clients';
import { getKeyValue } from './util';
import { parseToRule } from '../../actions/parseToRule';

function openChallenge(challengerId: string, payload: OpenChallengePayload) {
    const userDocRef = firestore.collection('users').doc(challengerId)
    userDocRef.get().then(user => {
        const { opponentId, format } = payload

        // Check for valid format
        try {
            parseToRule(format)
        } catch(e) {
            return;
        }

        // You cannot send challenges to strangers
        if (!user.data()?.friends?.includes(opponentId)) {
            return
        }

        const {
            key,
            value
        } = getKeyValue(challengerId, opponentId, format)

        // save challenge to redis
        storeClient.setnx(key, value, (err, worked) => {
            if (err) {
                console.error(err);
                return;
            }
            if (!worked) {
                console.error("Can't overwrite existing challenge")
            }

            // notify opponent
            pubClient.publish("messagesToUser:" + opponentId, "$challengedBy|" + JSON.stringify({
                challenger: challengerId,
                format: format
            }))
        })
    }).catch(err => {
        console.error(err);
    })
}

export default openChallenge;