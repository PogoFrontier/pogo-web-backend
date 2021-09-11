import { RuleDescription } from "../../types/rule"
import { User } from "../../types/user"

export function getKeyValue(challenger: User, opponentId: string, format: RuleDescription) {
    return {
        key: "challenge:" + opponentId + ":by:" + JSON.stringify({ googleId: challenger.googleId, username: challenger.username}),
        value: JSON.stringify(format)
    }
}

export function getKeyPatternForChallengesToMe(user: User) {
    return "challenge:" + user.googleId + ":by:*"
}

export function getKeyPatternForChallengesByMe(user: User) {
    return "challenge:*:by:" + JSON.stringify({ googleId: user.googleId, username: user.username })
}

export function getChallengerOfKey(key: string) {
    return JSON.parse(key.slice(key.indexOf(":by:") + 4)!)
}