import { reduceTeam } from "../actions/reduceInformation";
import to from "../actions/to";
import { rooms } from "../matchhandling_server";
import { CODE } from "../types/actions";
import { OnGetOpponentPayload } from "../types/handlers";

function onGetOpponent(id: string, payload: OnGetOpponentPayload) {
  const { room } = payload;
  const currentRoom = rooms.get(room);
  if (currentRoom) {
    const opp = currentRoom.players.find((x) => (x !== null) && (x.id !== id))
    if (opp) {
      to(room, JSON.stringify({
        type: CODE.room_join,
        payload: { team: reduceTeam(opp.team) }
      }), opp.id)
      return;
    }
  }
  console.error("No opponent found");
}

export default onGetOpponent;
