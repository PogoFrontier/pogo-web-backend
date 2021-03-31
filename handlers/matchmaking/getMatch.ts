import { Rule } from "../../types/rule";
import { User } from "../../types/user";

function getMatch(format: Rule, user: User, battleRequests: Array<User>): User | undefined {
    // TODO: Adapt matchmaking to ranking
    return battleRequests[Math.floor(Math.random() * battleRequests.length)];
}

export default getMatch;