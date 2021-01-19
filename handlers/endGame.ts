import to from "../actions/to";
import { rooms } from "../server";

function endGame(room: string) {
  const currentRoom = rooms.get(room);
  if (currentRoom) {
    if (currentRoom.timer) {
      clearInterval(rooms.get(room)!.timer);
      delete rooms.get(room)!.timer;
    }
    to(room, "$end");
    rooms.delete(room);
  }
}

export default endGame;
