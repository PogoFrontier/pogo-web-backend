import { rooms } from "../matchhandling_server";
import { SELECT_TEAM_TIME } from "../config";
import { OnTeamSubmitPayload } from "../types/handlers"; 
import { RoomStatus } from "../types/room";
import endGame from "./endGame";
import to from "../actions/to";
import { CODE } from "../types/actions";

function onStartTimer(id: string, payload: OnTeamSubmitPayload) {
  const { room } = payload;

  const currentRoom = rooms.get(room);
  if (currentRoom && currentRoom.status === RoomStatus.SELECTING && !currentRoom.timeout && currentRoom.players.some(player => player?.id === id)) {

    //Notify users
    to(room, JSON.stringify({
      type: CODE.start_timer
    }))

    // Start timeout
    currentRoom.timeout = setTimeout(() => {
      // Both selected. Moving on.
      if(currentRoom.status !== RoomStatus.SELECTING) {
        if (currentRoom.timeout) {
          clearTimeout(currentRoom.timeout);
          delete currentRoom.timeout;
        }
        return
      }

      let result: "tie" | "p2" | "p1" = "tie"
      if (!currentRoom.players[0]?.current && currentRoom.players[1]?.current) {
        result = "p2"
      } else if (!currentRoom.players[1]?.current && currentRoom.players[0]?.current) {
        result = "p1"
      }
      endGame(room, false, result)

    }, SELECT_TEAM_TIME * 1000)
  }

}

export default onStartTimer;