import to from "../actions/to";
import { rooms } from "../server";
import { CODE } from "../types/actions";

export interface OnGetOpponentPayload {
  room: string,
}

function onGetOpponent(id: string, payload: OnGetOpponentPayload) {
  const { room } = payload;
  const currentRoom = rooms.get(room);
  if (currentRoom) {
    const opp = currentRoom.players.find((x) => (x !== null) && (x.id !== id))
    if (opp) {
      to(room, JSON.stringify({
        type: CODE.room_join,
        payload: { team: opp.team }
      }), opp.id)
      return;
    }
  }
  console.error("No opponent found");
}

export default onGetOpponent;
