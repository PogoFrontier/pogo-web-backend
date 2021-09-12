import { OpenChallengePayload } from '../../types/handlers'
import { firestore } from '../../firestore/firestore';
import { storeClient, pubClient } from '../../redis/clients';
import { getKeyValue } from './util';
import { parseToRule } from '../../actions/parseToRule';
import { User } from '../../types/user';

function openChallenge(challengerId: string, payload: OpenChallengePayload) {
    const { opponentId, format } = payload

    // Check for valid format
    try {
        parseToRule(format)
    } catch (e) {
        return;
    }
    if(typeof format !== "string") {
        return
    }

    const userDocRef = firestore.collection('users').doc(challengerId)
    userDocRef.get().then(user => {
        const challenger = user.data()
        // You cannot send challenges to strangers
        if (!challenger?.friends?.includes(opponentId)) {
            return
        }

        const {
            key,
            value
        } = getKeyValue(challenger as User, opponentId, format)

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
                challenger: {
                    googleId: user.id,
                    username: user.data()?.username
                },
                format: format
            }))
        })
    }).catch(err => {
        console.error(err);
    })
}

export default openChallenge;