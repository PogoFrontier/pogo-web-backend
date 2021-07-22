import { User } from '../types/user';
import {RuleDescription } from '../types/rule'
import { firestore } from '../firestore/firestore';
import EloRank from 'elo-rank';
const elo = new EloRank(15)

export function getRating(user: User, format: RuleDescription) {
    if (!user.ranking) {
        user.ranking = 1000;
    }
    return user.ranking
}

export function updateRatings(userIds: [string, string], p1win: boolean, format: RuleDescription) {
    const p1DocRef = firestore.collection('users').doc(userIds[0])
    const p2DocRef = firestore.collection('users').doc(userIds[1])
    p1DocRef.get().then((p1: any) => {
        p2DocRef.get().then((p2: any) => {
            var expectedScore1 = elo.getExpected(getRating(p1.data(), format), getRating(p2.data(), format));
            var expectedScore2 = elo.getExpected(getRating(p2.data(), format), getRating(p1.data(), format));

            p1DocRef.update({
                ranking: elo.updateRating(expectedScore1, p1win ? 1 : 0, getRating(p1.data(), format))
            }).catch(err => {
                console.error("Can't update player ranking")
                console.log(err);
            });
            p2DocRef.update({
                ranking: elo.updateRating(expectedScore2, p1win ? 0 : 1, getRating(p2.data(), format))
            }).catch(err => {
                console.error("Can't update player ranking")
                console.log(err);
            });
        })
    })
}