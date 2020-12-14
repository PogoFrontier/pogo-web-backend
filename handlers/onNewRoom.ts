import to from "../actions/to";
import { rooms } from "../server";
import { CODE } from "../types/actions";
import { RoomStatus } from "../types/room";
import { TeamMember } from "../types/team";

export interface OnNewRoomPayload {
  room: string,
  team: TeamMember[]
}

function onNewRoom(id: string, payload: OnNewRoomPayload): string {
  const { room, team } = payload
  const currentRoom = rooms.get(room);
  const player = {id, team};

  if (!currentRoom) {
      rooms.set(room, {
          id: room,
          players: [player, null],
          status: RoomStatus.SELECTING
      });
      console.info(`Room ${room} has been created. Socket ${id} has joined.`);
      return room;
  }

  for (let i = 0; i < currentRoom.players.length; i++) {
      if (currentRoom.players[i] === null) {
        currentRoom.players[i] = player
        to(room, JSON.stringify({
          type: CODE.room_join,
          payload: { team }
      }), id)
      console.info(`Socket ${id} has joined ${room}.`);
      return room;
    }
  }

  return "";
}

export default onNewRoom;
