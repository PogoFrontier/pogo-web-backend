import { reduceTeam } from "../actions/reduceInformation";
import to from "../actions/to";
import { rooms } from "../matchhandling_server";
import { CODE } from "../types/actions";
import { OnJoinPayload } from "../types/handlers";
import { parseToTeamMembers, isTeamValid } from "../team/checkTeam";
import { Room } from "../types/room";
import { pubClient } from "../redis/clients";
import { getRandomTeam } from "../team/randomTeam";
import { getStrings } from "../actions/getTranslation";
import { User } from "../types/user";

async function onJoin(user: User, payload: OnJoinPayload) {
    let { room, team } = payload;
    const currentRoom = rooms.get(room);

    if (currentRoom) {
        const { allowed, reason } = isAllowed(currentRoom, user.googleId)
        if(!allowed) {
            pubClient.publish("messagesToUser:" + user.googleId, "$error" + reason);
            return;
        }

        if(currentRoom.format.advancedOptions?.random) {
            team = getRandomTeam(currentRoom.format, "en")
            pubClient.publish("messagesToUser:" + user.googleId, "$yourTeamIs:" + JSON.stringify(team));
        } else if (!team || !Array.isArray(team) || team.length <= 0) {
            pubClient.publish("messagesToUser:" + user.googleId, "$errorYour team has an invalid format. It should be an array.");
            return;
        }
        
        let teamMembers = parseToTeamMembers(team);
        let strings : any= {}
        await getStrings("en").then(s => strings = s)
        const { isValid, violations } = isTeamValid(teamMembers, currentRoom.format, strings);
        if (!isValid) {
            pubClient.publish("messagesToUser:" + user.googleId, "$errorYour team is invalid.\n" + violations.join("\r"));
            return;
        }

        for (let i = 0; i < currentRoom.players.length; i++) {
            if (currentRoom.players[i] === null) {
                
                currentRoom.players[i] = { 
                    id: user.googleId,
                    isGuest: !!user.isGuest,
                    username: user.username || "Guest", team: teamMembers
                }
                to(room, JSON.stringify({
                    type: CODE.room_join,
                    payload: { team: reduceTeam(teamMembers) }
                }), user.googleId)

                console.info(`Socket ${user.googleId} has joined ${room}.`);

                // Clear timeout
                if (i === 1 && currentRoom.timeout) {
                    clearTimeout(currentRoom.timeout);
                    delete currentRoom.timeout
                }

                // Notify user
                pubClient.publish("messagesToUser:" + user.googleId, "$start");

                return room;
            }
        }
    }
}

function isAllowed(room: Room, id: string): {allowed: boolean, reason: string} {

    // Do we already have two players? If yes, get out.
    if (!room.players.some(player => player === null)) {
        return {
            allowed: false,
            reason: "Room is already full"
        }
    }

    // Is player already in that room? If yes, get out.
    if (room.players.some(player => player !== null && player.id === id)) {
        return {
            allowed: false,
            reason: "You already joined this room"
        }
    }

    // Are there reservations and is this player not on the list? If yes, get out.
    if (room.reservedSeats && !room.reservedSeats.includes(id)) {
        return {
            allowed: false,
            reason: "You cannot enter this private room"
        };
    }

    // Everything is fine
    return {
        allowed: true,
        reason: ""
    };
}

export default onJoin;
