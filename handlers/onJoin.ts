import to from "../actions/to";
import { rooms } from "../matchhandling_server";
import { CODE } from "../types/actions";
import { OnJoinPayload } from "../types/handlers";
import { parseToTeamMembers, isTeamValid } from "../checks/checkTeam";
import { Room } from "../types/room";
import { pubClient } from "../redis/clients";

function onJoin(id: string, payload: OnJoinPayload) {
    const { room, team } = payload;
    const currentRoom = rooms.get(room);

    if (currentRoom) {
        const { allowed, reason } = isAllowed(currentRoom, id)
        if(!allowed) {
            pubClient.publish("messagesToUser:" + id, "$error" + reason);
            return;
        }
        
        let teamMembers = parseToTeamMembers(team);

        const { isValid, violations } = isTeamValid(teamMembers, currentRoom.format);
        if (!isValid) {
            pubClient.publish("messagesToUser:" + id, "$errorYour team is invalid.\n" + violations.join("\r"));
            return;
        }

        for (let i = 0; i < currentRoom.players.length; i++) {
            if (currentRoom.players[i] === null) {
                
                currentRoom.players[i] = { id, team: teamMembers }
                to(room, JSON.stringify({
                    type: CODE.room_join,
                    payload: { team: teamMembers }
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

function isAllowed(room: Room, socketId: string): {allowed: boolean, reason: string} {

    // Do we already have two players? If yes, get out.
    if (room.players.some(player => player !== null && player.id === socketId)) {
        return {
            allowed: false,
            reason: "Room is already full"
        }
    }

    // Is player already in that room? If yes, get out.
    if (room.players.some(player => player !== null && player.id === socketId)) {
        return {
            allowed: false,
            reason: "You already joined this room"
        }
    }

    // Are there reservations and is this player not on the list? If yes, get out.
    if (room.reservedSeats && !room.reservedSeats.includes(socketId)) {
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
