import { rooms } from "../matchhandling_server";
import { Room } from "../types/room";
import { pubClient, storeClient } from "../redis/clients";

function endGame(room: string, timeout?: boolean, predefinedResult?: whoWon) {
  const currentRoom = rooms.get(room);
  if (currentRoom) {
    // Clear timer
    if (currentRoom.timer) {
      clearInterval(currentRoom.timer);
    }

    // Cleat redis subscription
    if(currentRoom.subClient) {
      currentRoom.subClient.unsubscribe("commands:" + currentRoom.id);
    }

    // Unset flag on redis so another server can host this room
    storeClient.del("room:" + currentRoom.id, (err) => {
      if (err) {
        console.error(err);
      }
    });

    if (predefinedResult) {
      sendResult(currentRoom, predefinedResult);
      return;
    }

    // Send results to players
    if (rooms.get(room)!.players && rooms.get(room)!.players.length === 2) {
      const currentRoom = rooms.get(room)!;
      let p = rooms.get(room)!.players[0]!;
      let o = rooms.get(room)!.players[1]!;
      if (timeout) { //Timeout
        if (p.current!.remaining !== o.current!.remaining) {        // First check if more Pokemon
          if (p.current!.remaining > o.current!.remaining) {
            sendResult(currentRoom, "p1");
          } else {
            sendResult(currentRoom, "p2");
          }
        } else {  //Else check remaining health
          if (p.current!.team[p.current!.active].current!.hp > o.current!.team[o.current!.active].current!.hp) {
            sendResult(currentRoom, "p1");
          } else if (p.current!.team[p.current!.active].current!.hp < o.current!.team[o.current!.active].current!.hp) {
            sendResult(currentRoom, "p2");
          } else {
            sendResult(currentRoom, "tie");
          }
        }
      } else if (p.current!.remaining > 0) {
        sendResult(currentRoom, "p1");
      } else if (o.current!.remaining > 0) {
        sendResult(currentRoom, "p2");
      } else {  //Else both clients fainted at the same time
        sendResult(currentRoom, "tie");
      }
    }
  }
  rooms.delete(room);
}

type whoWon = "p1" | "p2" | "tie";
function sendResult(room: Room, result: whoWon) {
  let p = room.players[0]!;
  let o = room.players[1]!;
  if(result === "p1") {
    pubClient.publish("messagesToUser:" + p.id, "$endwon");
    pubClient.publish("messagesToUser:" + o.id, "$endlost");
  } else if (result === "p2") {
    pubClient.publish("messagesToUser:" + p.id, "$endlost");
    pubClient.publish("messagesToUser:" + o.id, "$endwon");
  } else {
    pubClient.publish("messagesToUser:" + p.id, "$endtied");
    pubClient.publish("messagesToUser:" + o.id, "$endtied");
  }
}

export default endGame;
