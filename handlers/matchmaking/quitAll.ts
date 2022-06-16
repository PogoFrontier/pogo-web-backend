import quit from "./quit";
import { Rule } from "../../types/rule";
import { User } from "../../types/user";

function quitAll(user: User, formatsUsedForMatchmaking: Array<Rule>) {
    // Delete Battle requests
    for (const format of formatsUsedForMatchmaking) {
        quit(user, {format}, () => {})
    }
}

export default quitAll;