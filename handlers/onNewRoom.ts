import to from "../actions/to";
import { rooms } from "../server";
import { CODE } from "../types/actions";
import { OnNewRoomPayload } from "../types/handlers";
import { Room, RoomStatus } from "../types/room";
import { useRoom, setupRoom } from "../redis/rooms";
import { subClient, pubClient } from "../redis/clients";
import onJoin from "./onJoin";

function onNewRoom(id: string, payload: OnNewRoomPayload, callback:  (roomId: string) => void) {
  const { room, team } = payload;

  useRoom(room, (err, isNew) => {
    const player = {id, team};

    if (err) {
      console.error(err);
      return;
    }
  
    if (isNew) {
      let roomObj: Room = {
        id: room,
        players: [player, null],
        status: RoomStatus.SELECTING,
        subClient: subClient.duplicate()
      }
      rooms.set(room, roomObj);

      setupRoom(roomObj);

      console.info(`Room ${room} has been created. Socket ${id} has joined.`);

    } else {
      let joinObj = {
        sender: id,
        data: {
          type: CODE.room_join,
          payload: {
            room: room,
            team: team
          },
        }
      }
      pubClient.publish("commands:" + room, JSON.stringify(joinObj));
    }

    callback(room);
  });
}

export default onNewRoom;
