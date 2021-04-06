import to from "../actions/to";
import { rooms } from "../server";
import { CODE } from "../types/actions";
import { OnJoinPayload } from "../types/handlers";
import { parseToTeamMembers, isTeamValid } from "../checks/checkTeam";
import { Room } from "../types/room";

function onJoin(id: string, payload: OnJoinPayload) {
    const { room, team } = payload;
    const currentRoom = rooms.get(room);

    if (currentRoom) {
        if(!isAllowed(currentRoom, id)) {
            console.error(`Socket ${id} is not allowed to join room ${room}.`);
            return;
        }
        
        let teamMembers = parseToTeamMembers(team);

        if (!isTeamValid(teamMembers, currentRoom.format).isValid) {
            console.error("Invalid team");
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

                return room;
            }
        }
    }
}

function isAllowed(room: Room, socketId: string): boolean {

    // Is player already in that room? If yes, get out.
    if (room.players.some(player => player !== null && player.id === socketId)) {
        return false;
    }

    // Are there reservations and is this player not on the list? If yes, get out.
    if (room.reservedSeats && room.reservedSeats.includes(socketId)) {
        return false;
    }

    // Everything is fine
    return true;
}

export default onJoin;
