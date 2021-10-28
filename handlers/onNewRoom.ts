import { rooms } from "../matchhandling_server";
import { CODE } from "../types/actions";
import { OnNewRoomPayload } from "../types/handlers";
import { Room, RoomStatus } from "../types/room";
import { useRoom, setupRoom } from "../redis/rooms";
import { subClient, pubClient } from "../redis/clients";
import onJoin from "./onJoin";
import { parseToRule } from "../actions/parseToRule";
import { User } from "../types/user";

function onNewRoom(user: User, payload: OnNewRoomPayload, callback:  (roomId: string) => void) {
  const { room, team } = payload;

  useRoom(room, (err, isNew) => {
    if (err) {
      console.error(err);
      return;
    }
  
    if (isNew) {
      let format = payload.format;
      if (!format) {
        format = "Great League"
      }
      try{        
        format = parseToRule(format);
      } catch(e) {
        console.error(e);
        return;
      }
      
      let roomObj: Room = {
        id: room,
        players: [null, null],
        status: RoomStatus.SELECTING,
        subClient: subClient.duplicate(),
        format: format
      }
      rooms.set(room, roomObj);

      setupRoom(roomObj);

      console.info(`Room ${room} has been created. Socket ${user.googleId} has joined.`);

    }

    let joinObj = {
      sender: user,
      data: {
        type: CODE.room_join,
        payload: {
          room: room,
          team: team
        },
      }
    }
    if (isNew) {
      onJoin(user, joinObj.data.payload);
    } else {
      pubClient.publish("commands:" + room, JSON.stringify(joinObj));
    }

    callback(room);
  });
}

export default onNewRoom;
