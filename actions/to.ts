import { onlineClients, rooms } from "../server";

function to(room: string, data: string, id?: string) {
  if (rooms.get(room)) {
      for (let player of rooms.get(room)!.players) {
          if (player && player.id !== id && onlineClients.get(player.id)) {
              onlineClients.get(player.id)!.send(data);
          }
      }
  }
}

export default to;
