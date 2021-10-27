import { reduceTeamMemberForPlayer } from "../actions/reduceInformation";
import { rooms } from "../matchhandling_server";
import { pubClient } from "../redis/clients";
import { OnGetOpponentPayload } from "../types/handlers";

function onGetOwnTeam(id: string, payload: OnGetOpponentPayload) {
  const { room } = payload;
  const currentRoom = rooms.get(room);
  if (currentRoom) {
    const player = currentRoom.players.find((x) => (x?.id === id))
    if (player) {
      pubClient.publish("messagesToUser:" + id, "$yourTeamIs:" + JSON.stringify(player.team.map(reduceTeamMemberForPlayer)));
      return;
    }
  }
  console.error("No opponent found");
}

export default onGetOwnTeam;
