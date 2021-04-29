import to from "../actions/to";
import { rooms } from "../matchhandling_server";
import { CODE } from "../types/actions";
import { RoomStatus } from "../types/room";
import { User } from "../types/user";
import { storeClient } from "../redis/clients";

function onClose(user: User, room: string) {
  const currentRoom = rooms.get(room);
  if (currentRoom) {

      if (currentRoom.players) {
          const index = currentRoom.players.findIndex(x => x && x.id === user.socketId);
          currentRoom.players[index] = null;
          if (currentRoom.status !== RoomStatus.SELECTING && currentRoom.status !== RoomStatus.STARTING) {
            to(room, "$endwin");
            console.info(`Socket ${user.socketId} has been removed from room ${room}, causing game end.`);
          } else {
            currentRoom.status = RoomStatus.SELECTING;
            to(room, JSON.stringify({
                type: CODE.room_leave,
            }), );
            console.info(`Socket ${user.socketId} has been removed from room ${room}.`);
          }
      }

      if (currentRoom.players[1] === null && currentRoom.players[0] === null) {
        // Cleat redis subscription
        if(currentRoom.subClient) {
          currentRoom.subClient.unsubscribe("commands:" + currentRoom.id);
        }
    
        // Unset flag on redis so another server can host this room
        storeClient.del("room:" + currentRoom.id, (err) => {
          if (err) {
            console.error(err);
          }
        });

        if (currentRoom.timer) {
          clearInterval(currentRoom.timer);
        }
        rooms.delete(room);
        console.info(`Room ${room} has been deleted.`);
      }
  }

  console.info(`Socket ${user.socketId} has disconnected.`);
}

export default onClose;
