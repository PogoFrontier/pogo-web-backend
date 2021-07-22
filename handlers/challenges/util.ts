import { RuleDescription } from "../../types/rule"

export function getKeyValue(challengerId: string, opponentId: string, format: RuleDescription) {
    return {
        key: "challenge:" + opponentId + ":by:" + challengerId,
        value: JSON.stringify(format)
    }
}

export function getKeyPatternForChallengesToMe(userId: string) {
    return "challenge:" + userId + ":by:*"
}

export function getKeyPatternForChallengesByMe(userId: string) {
    return "challenge:*:by:" + userId
}

export function getChallengerOfKey(key: string) {
    return key.split(":")[2]!
}