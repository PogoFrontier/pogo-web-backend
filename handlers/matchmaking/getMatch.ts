import { RuleDescription } from "../../types/rule";
import { User, UserInQueue } from "../../types/user";
import { getRanking } from "../../actions/rankings"

function getMatch(format: RuleDescription, user: User | UserInQueue, battleRequests: Array<UserInQueue>): User | undefined {
    const userRanking = getRanking(user, format)
    const timeUserWaiting = ("waitingSince" in user) ? new Date().getTime() - user.waitingSince.getTime() : 0;
    
    // Find players with a similar rank
    let matchingUsersInQueue = battleRequests.filter((userInQueue) => {
        const timeWaiting = Math.max(timeUserWaiting, new Date().getTime() - userInQueue.waitingSince.getTime());

        //Right now its timeInSecond*10, however, a step-by-step difference is also a possibility
        const maxRankingDifference = timeWaiting / 100;

        const rankingDifference = Math.abs(userInQueue.ranking - userRanking);
        return rankingDifference <= maxRankingDifference;
    })

    if(!matchingUsersInQueue.length) {
        return undefined
    }

    // Get longest waiting user
    return matchingUsersInQueue.reduce(function (prev, curr) {
        return prev.waitingSince < curr.waitingSince ? prev : curr;
    });
}

export default getMatch;