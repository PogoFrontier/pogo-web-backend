import { User } from '../types/user';
import {RuleDescription } from '../types/rule'
import { firestore } from '../firestore/firestore';
import EloRank from 'elo-rank';
import { parseToRule } from './parseToRule';
const elo = new EloRank(15)

export function getRating(user: User, format: RuleDescription) {
    let { name: formatname, ratingCategory, unranked } = parseToRule(format)
    if(unranked) {
        return 0
    }

    if (!ratingCategory) {
        ratingCategory = formatname
    }
    
    if (!user.ranking || typeof user.ranking === "number") {
        user.ranking = {};
    }
    if (!user.ranking[ratingCategory]) {
        user.ranking[ratingCategory] = 1000;
    }

    return user.ranking[ratingCategory]
}

export function updateRatings(userIds: [string, string], p1win: boolean, format: RuleDescription) {
    let { name: formatname, ratingCategory } = parseToRule(format)
    if (!ratingCategory) {
        ratingCategory = formatname
    }

    const p1DocRef = firestore.collection('users').doc(userIds[0])
    const p2DocRef = firestore.collection('users').doc(userIds[1])
    p1DocRef.get().then((p1: any) => {
        p2DocRef.get().then((p2: any) => {
            console.log("Update ratings")
            const p1data = p1.data(), p2data = p2.data()
            var expectedScore1 = elo.getExpected(getRating(p1data, format), getRating(p2data, format));
            var expectedScore2 = elo.getExpected(getRating(p2data, format), getRating(p1data, format));

            let ranking1 = p1data.ranking, ranking2 = p2data.ranking;
            ranking1[ratingCategory!] = elo.updateRating(expectedScore1, p1win ? 1 : 0, getRating(p1data, format))
            ranking2[ratingCategory!] = elo.updateRating(expectedScore2, p1win ? 0 : 1, getRating(p2data, format))

            p1DocRef.update({
                ranking: ranking1
            }).catch(err => {
                console.error("Can't update player ranking")
                console.log(err);
            });
            p2DocRef.update({
                ranking: ranking2
            }).catch(err => {
                console.error("Can't update player ranking")
                console.log(err);
            });
        })
    })
}