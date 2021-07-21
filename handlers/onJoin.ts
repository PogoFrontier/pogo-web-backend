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

async function onJoin(id: string, payload: OnJoinPayload) {
    let { room, team } = payload;
    const currentRoom = rooms.get(room);

    if (currentRoom) {
        const { allowed, reason } = isAllowed(currentRoom, id)
        if(!allowed) {
            pubClient.publish("messagesToUser:" + id, "$error" + reason);
            return;
        }

        if(currentRoom.format.advancedOptions?.random) {
            team = getRandomTeam(currentRoom.format, "en")
        }

        if (!team || !Array.isArray(team) || team.length <= 0) {
            pubClient.publish("messagesToUser:" + id, "$errorYour team has an invalid format. It should be an array.");
            return;
        }
        
        let teamMembers = parseToTeamMembers(team);
        let strings : any= {}
        await getStrings("en").then(s => strings = s)
        const { isValid, violations } = isTeamValid(teamMembers, currentRoom.format, strings);
        if (!isValid) {
            pubClient.publish("messagesToUser:" + id, "$errorYour team is invalid.\n" + violations.join("\r"));
            return;
        }

        for (let i = 0; i < currentRoom.players.length; i++) {
            if (currentRoom.players[i] === null) {
                
                currentRoom.players[i] = { id, team: teamMembers }
                to(room, JSON.stringify({
                    type: CODE.room_join,
                    payload: { team: reduceTeam(teamMembers) }
                }), id)

                console.info(`Socket ${id} has joined ${room}.`);

                // Clear joinTimeout
                if (i === 1 && currentRoom.joinTimeout) {
                    clearTimeout(currentRoom.joinTimeout);
                }

                // Notify user
                pubClient.publish("messagesToUser:" + id, "$start");

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
