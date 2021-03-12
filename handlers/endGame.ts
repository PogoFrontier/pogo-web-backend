import { onlineClients, rooms } from "../server";

function endGame(room: string, timeout?: boolean) {
  const currentRoom = rooms.get(room);
  if (currentRoom) {
    if (currentRoom.timer) {
      clearInterval(currentRoom.timer);
    }
    if (rooms.get(room)!.players && rooms.get(room)!.players.length === 2) {
      let p = rooms.get(room)!.players[0]!;
      let o = rooms.get(room)!.players[1]!;
      if (timeout) { //Timeout
        if (p.current!.remaining !== o.current!.remaining) {        // First check if more Pokemon
          if (p.current!.remaining > o.current!.remaining) {
            onlineClients.get(p.id)!.send("$endwon");
            onlineClients.get(o.id)!.send("$endlost");
          } else {
            onlineClients.get(p.id)!.send("$endlost");
            onlineClients.get(o.id)!.send("$endwon");
          }
        } else {  //Else check remaining health
          if (p.current!.team[p.current!.active].current!.hp > o.current!.team[o.current!.active].current!.hp) {
            onlineClients.get(p.id)!.send("$endwon");
            onlineClients.get(o.id)!.send("$endlost");
          } else if (p.current!.team[p.current!.active].current!.hp < o.current!.team[o.current!.active].current!.hp) {
            onlineClients.get(p.id)!.send("$endlost");
            onlineClients.get(o.id)!.send("$endwon");
          } else {
            onlineClients.get(p.id)!.send("$endtied");
            onlineClients.get(o.id)!.send("$endtied");
          }
        }
      } else if (p.current!.remaining > 0) {
        onlineClients.get(p.id)!.send("$endwon");
        onlineClients.get(o.id)!.send("$endlost");
      } else if (o.current!.remaining > 0) {
        onlineClients.get(p.id)!.send("$endlost");
        onlineClients.get(o.id)!.send("$endwon");
      } else {  //Else both clients fainted at the same time
        onlineClients.get(p.id)!.send("$endtied");
        onlineClients.get(o.id)!.send("$endtied");
      }
    }
  }
  rooms.delete(room);
}

export default endGame;
