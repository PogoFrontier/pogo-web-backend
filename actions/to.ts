import { rooms } from "../server";
import { pubClient, storeClient } from "../redis/clients";

function to(room: string, data: string, id?: string) {
  const currentRoom = rooms.get(room)
  if (currentRoom) {

    storeClient.SET("room:" + room, JSON.stringify({
        id: room,
        players: currentRoom.players,
        turn: currentRoom.turn,
        wait: currentRoom.wait,
        timerId: currentRoom.timerId,
        charge: currentRoom.charge
    }));

    for (let player of rooms.get(room)!.players) {
      if (player && player.id !== id) {
        pubClient.publish("messagesToUser:" + player.id, data)
      }
    }
  }
}

export default to;
