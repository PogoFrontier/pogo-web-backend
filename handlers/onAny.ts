import {rooms} from "../matchhandling_server";
import { CODE } from "../types/actions";
import {RoomStatus} from "../types/room";
import onAction from "./onAction";
import onChargeEnd from "./onChargeEnd";
import onClose from "./onClose";
import onGetOpponent from "./onGetOpponent";
import onJoin from "./onJoin";
import onTeamSubmit from "./onTeamSubmit";
import onReadyGame from "./onReadyGame";

function onAny(senderId: string, roomId: string, data: string) {
    if (typeof data === "string" && data.startsWith("$")) {
        if (rooms.get(roomId) && rooms.get(roomId)?.status === RoomStatus.LISTENING) {
            onChargeEnd({ id: senderId, room: roomId, data })
        }
    } else if (typeof data === "string" && data.startsWith("#")) {
        if (rooms.get(roomId)
        && rooms.get(roomId)?.status !== RoomStatus.SELECTING
        && rooms.get(roomId)?.status !== RoomStatus.STARTING
        && rooms.get(roomId)?.status !== RoomStatus.CHARGE) {
            onAction({ id: senderId, room: roomId, data });
        }
    } else {
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
                onClose({socketId: senderId}, payload.room);
                break;
            default:
                console.error(`Message not recognized: ${data}`);
        }
    }
}
  
export default onAny;