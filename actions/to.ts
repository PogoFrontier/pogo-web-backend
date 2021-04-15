import { rooms } from "../matchhandling_server";
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
    }), (err) => {
      if (err) {
          console.error(err);
          return;
      }

      // Let redis destroy room after one hour. This is only neccessary if the server is restarted before the battle is finished.
      storeClient.expire("room:" + room, 60 * 60);
  });

    for (let player of rooms.get(room)!.players) {
      if (player && player.id !== id) {
        pubClient.publish("messagesToUser:" + player.id, data)
      }
    }
  }
}

export default to;
