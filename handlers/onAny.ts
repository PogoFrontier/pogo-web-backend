import {rooms} from "../matchhandling_server";
import { CODE } from "../types/actions";
import {RoomStatus} from "../types/room";
import onAction from "./onAction";
import onSetCharge from "./onSetCharge";
import onClose from "./onClose";
import onGetOpponent from "./onGetOpponent";
import onJoin from "./onJoin";
import onTeamSubmit from "./onTeamSubmit";
import { onReadyGame } from "./onReadyGame";
import endGame from "./endGame";

function onAny(senderId: string, roomId: string, data: string) {
    const room = rooms.get(roomId)
    if (data === "forfeit") {
        if (room) {
            const playerNum = room.players.findIndex((player) => player !== null && player.id === senderId)
            const result = playerNum === 0 ? "p2" : "p1"
            if(playerNum !== -1) {
                endGame(roomId, false, result)
            }
        }
    } else if (typeof data === "string" && data.startsWith("$")) {
        if (room && room.status === RoomStatus.CHARGE) {
            onSetCharge({ id: senderId, room: roomId, data })
        }
    } else if (typeof data === "string" && data.startsWith("#")) {
        if (rooms.get(roomId)
        && rooms.get(roomId)?.status !== RoomStatus.SELECTING
        && rooms.get(roomId)?.status !== RoomStatus.STARTING
        && rooms.get(roomId)?.status !== RoomStatus.CHARGE
        && rooms.get(roomId)?.status !== RoomStatus.ANIMATING) {
            onAction({ id: senderId, room: roomId, data });
        }
    } else {
        try{
            const { type, payload } = JSON.parse(data);
            payload.room = roomId;
            switch (type) {
                case CODE.get_opponent:
                    onGetOpponent(senderId, payload);
                    break;
                case CODE.room_join:
                    onJoin(senderId, payload);
                    break;
                case CODE.team_submit:
                    onTeamSubmit(senderId, payload);
                    break;
                case CODE.ready_game:
                    onReadyGame(senderId, payload);
                    break;
                case CODE.close:
                    onClose(senderId, payload.room);
                    break;
                default:
                    console.error(`Message not recognized: ${data}`);
            }
        } catch(e) {
            console.error(e)
        }
    }
}
  
export default onAny;