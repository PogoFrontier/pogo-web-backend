import {rooms} from "../matchhandling_server";
import { CODE } from "../types/actions";
import {RoomStatus} from "../types/room";
import onAction from "./onAction";
import onSetCharge from "./onSetCharge";
import onClose from "./onClose";
import onGetOpponent from "./onGetOpponent";
import onJoin from "./onJoin";
import onTeamSubmit from "./onTeamSubmit";
import onStartTimer from "./onStartTimer";
import { onReadyGame } from "./onReadyGame";
import endGame from "./endGame";
import { User } from "../types/user";

function onAny(user: User, roomId: string, data: string) {
    const room = rooms.get(roomId)
    if (data === "forfeit") {
        if (room) {
            const playerNum = room.players.findIndex((player) => player !== null && player.id === user.googleId)
            const result = playerNum === 0 ? "p2" : "p1"
            if(playerNum !== -1) {
                endGame(roomId, false, result)
            }
        }
    } else if (typeof data === "string" && data.startsWith("$")) {
        if (room && room.status === RoomStatus.CHARGE) {
            onSetCharge({ id: user.googleId, room: roomId, data })
        }
    } else if (typeof data === "string" && data.startsWith("#")) {
        if (rooms.get(roomId)
        && rooms.get(roomId)?.status !== RoomStatus.SELECTING
        && rooms.get(roomId)?.status !== RoomStatus.STARTING
        && rooms.get(roomId)?.status !== RoomStatus.CHARGE
        && rooms.get(roomId)?.status !== RoomStatus.ANIMATING) {
            onAction({ id: user.googleId, room: roomId, data });
        }
    } else {
        try{
            let { type, payload } = JSON.parse(data);
            if(!payload) {
                payload = {}
            }
            payload.room = roomId;
            switch (type) {
                case CODE.get_opponent:
                    onGetOpponent(user.googleId, payload);
                    break;
                case CODE.room_join:
                    onJoin(user, payload);
                    break;
                case CODE.team_submit:
                    onTeamSubmit(user.googleId, payload);
                    break;
                case CODE.start_timer:
                    onStartTimer(user.googleId, payload);
                    break;
                case CODE.ready_game:
                    onReadyGame(user.googleId, payload);
                    break;
                case CODE.close:
                    onClose(user.googleId, payload.room);
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