import { rooms } from "../matchhandling_server";
import { ResolveTurnPayload } from "../types/handlers";
import { reduceTeamMemberForPlayer } from "../actions/reduceInformation"
import { GAME_TIME, SWITCH_WAIT, SWITCH_WAIT_LAST } from "../config";
import { RoomStatus } from "../types/room";
import endGame from "./endGame";

export default function onFaint(room: string) {
    const currentRoom = rooms.get(room);
    if(currentRoom && currentRoom.players[0] && currentRoom.players[1]) {
        const time = Math.ceil(Number((GAME_TIME - currentRoom.turn! * 0.5).toFixed(1)))
        const player1 = currentRoom.players[0]
        const player2 = currentRoom.players[1]
        const payload: ResolveTurnPayload = {
            time,
            update: [
              {
                id: player1.id,
                active: player1.current!.active,
                wait: -1
              },
              {
                id: player2.id,
                active: player2.current!.active,
                wait: -1
              }
            ],
            team: player1.current!.team.map(reduceTeamMemberForPlayer),
            turn: currentRoom.turn!,
            switch: player1.current!.switch
        };

        for(let i in currentRoom.players) {
            const player = currentRoom.players[i]!
            const otherPlayer = currentRoom.players[[1,0][i]]!
            if(player!.current!.team[player!.current!.active].current!.hp <= 0) {    
                if (player!.current!.remaining <= 0) {
                    endGame(room);
                } else if (currentRoom.status !== RoomStatus.FAINT) {
                    currentRoom.status = RoomStatus.FAINT;
                    let waitTime = (player!.current!.remaining === 1) ? SWITCH_WAIT_LAST : SWITCH_WAIT;
                    currentRoom.status = RoomStatus.FAINT;
                    currentRoom.wait = waitTime;
                }
            }
            payload.update[i]!.remaining = player!.current!.remaining;
            delete otherPlayer!.current?.bufferedAction;
        }
    }

}