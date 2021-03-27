import to from "../actions/to";
import { rooms } from "../server";
import { CODE } from "../types/actions";
import { OnJoinPayload } from "../types/handlers";

function onJoin(id: string, payload: OnJoinPayload) {
    const { room, team } = payload;
    const currentRoom = rooms.get(room);
    if (currentRoom) {
        for (let i = 0; i < currentRoom.players.length; i++) {
            if (currentRoom.players[i] === null) {
                currentRoom.players[i] = { id, team }
                to(room, JSON.stringify({
                    type: CODE.room_join,
                    payload: { team }
                }), id)
                console.info(`Socket ${id} has joined ${room}.`);
                return room;
            }
        }
    }
}

export default onJoin;
