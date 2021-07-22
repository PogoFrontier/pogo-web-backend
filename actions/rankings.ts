import { User } from '../types/user';
import {RuleDescription } from '../types/rule'
import { firestore } from '../firestore/firestore';
import EloRank from 'elo-rank';
const elo = new EloRank(15)

export function getRanking(user: User, format: RuleDescription) {
    if (!user.ranking) {
        user.ranking = 1000;
    }
    return user.ranking
}

export function updateRankings(userIds: [string, string], p1win: boolean, format: RuleDescription) {
    const p1DocRef = firestore.collection('users').doc(userIds[0])
    const p2DocRef = firestore.collection('users').doc(userIds[1])
    p1DocRef.get().then((p1: any) => {
        p2DocRef.get().then((p2: any) => {
            var expectedScore1 = elo.getExpected(getRanking(p1, format), getRanking(p2, format));
            var expectedScore2 = elo.getExpected(getRanking(p2, format), getRanking(p1, format));

            p1DocRef.update({
                ranking: elo.updateRating(expectedScore1, 1, getRanking(p1, format))
            }).catch(err => {
                console.error("Can't update player ranking")
                console.log(err);
            });
            p2DocRef.update({
                ranking: elo.updateRating(expectedScore2, 0, getRanking(p2, format))
            }).catch(err => {
                console.error("Can't update player ranking")
                console.log(err);
            });
        })
    })
}