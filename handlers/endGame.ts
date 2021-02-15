import { GAME_TIME } from "../config";
import { onlineClients, rooms } from "../server";

function endGame(room: string) {
  const currentRoom = rooms.get(room);
  if (currentRoom) {
    if (currentRoom.timer) {
      clearInterval(currentRoom.timer);
    }
    if (rooms.get(room)!.players && rooms.get(room)!.players.length === 2) {
      let p = rooms.get(room)!.players[0]!;
      let o = rooms.get(room)!.players[1]!;
      if (currentRoom.turn && currentRoom.turn === GAME_TIME * 2) { //Timeout
        if (p.current!.remaining !== o.current!.remaining) {        // First check if more Pokemon
          if (p.current!.remaining > o.current!.remaining) {
            onlineClients.get(p.id)!.send("$endwin");
            onlineClients.get(o.id)!.send("$endlose");
          } else {
            onlineClients.get(p.id)!.send("$endlose");
            onlineClients.get(o.id)!.send("$endwin");
          }
        } else {  //Else check remaining health
          if (p.current!.team[p.current!.active].current!.hp > o.current!.team[o.current!.active].current!.hp) {
            onlineClients.get(p.id)!.send("$endwin");
            onlineClients.get(o.id)!.send("$endlose");
          } else if (p.current!.team[p.current!.active].current!.hp < o.current!.team[o.current!.active].current!.hp) {
            onlineClients.get(p.id)!.send("$endlose");
            onlineClients.get(o.id)!.send("$endwin");
          } else {
            onlineClients.get(p.id)!.send("$endtie");
            onlineClients.get(o.id)!.send("$endtie");
          }
        }
      } else if (p.current!.remaining > 0) {
        onlineClients.get(p.id)!.send("$endwin");
        onlineClients.get(o.id)!.send("$endlose");
      } else if (o.current!.remaining > 0) {
        onlineClients.get(p.id)!.send("$endlose");
        onlineClients.get(o.id)!.send("$endwin");
      } else {  //Else both clients fainted at the same time
        onlineClients.get(p.id)!.send("$endtie");
        onlineClients.get(o.id)!.send("$endtie");
      }
    }
  }
  rooms.delete(room);
}

export default endGame;
