import { rooms } from "../matchhandling_server";
import { Room, RoomStatus } from "../types/room";
import { pubClient, storeClient } from "../redis/clients";
import { reduceTeamForEnd } from "../actions/reduceInformation"
import { updateRatings } from "../actions/ratings";

function endGame(room: string, timeout?: boolean, predefinedResult?: whoWon) {
  const currentRoom = rooms.get(room);
  if (currentRoom) {
    // Clear timer
    if (currentRoom.timer) {
      clearInterval(currentRoom.timer);
    }
    currentRoom.status = RoomStatus.ENDED

    // Cleat redis subscription
    if(currentRoom.subClient) {
      currentRoom.subClient.unsubscribe("commands:" + currentRoom.id);
      currentRoom.subClient.quit();
    }

    // Unset flag on redis so another server can host this room
    storeClient.del("room:" + currentRoom.id, (err) => {
      if (err) {
        console.error(err);
      }
    });

    currentRoom.players.forEach(player => {
      const currentPoke = player?.current?.team[player.current.active].current
      if(currentPoke?.switchedIn) {
        currentPoke.timeSpendAlive += new Date().getTime() - currentPoke.switchedIn.getTime()
      }
    })


    // Send results to players
    let result: "p1" | "p2" | "tie" = "tie"
    if (predefinedResult) {
      result = predefinedResult
    } else if (rooms.get(room)!.players && rooms.get(room)!.players.length === 2) {
      const currentRoom = rooms.get(room)!;
      let p = rooms.get(room)!.players[0];
      let o = rooms.get(room)!.players[1];
      if (p && o) {
        if (timeout) { //Timeout
          if (p.current!.remaining !== o.current!.remaining) {        // First check if more Pokemon
            if (p.current!.remaining > o.current!.remaining) {
              result = "p1"
            } else {
              result = "p2"
            }
          } else {  //Else check remaining health
            if (p.current!.team[p.current!.active].current!.hp > o.current!.team[o.current!.active].current!.hp) {
              result = "p1";
            } else if (p.current!.team[p.current!.active].current!.hp < o.current!.team[o.current!.active].current!.hp) {
              result = "p2"
            }
          }
        } else if (p.current!.remaining > 0) {
          result = "p1"
        } else if (o.current!.remaining > 0) {
          result = "p2"
        }
      }
    }

    sendResult(currentRoom, result);

    // update rankings
    if (currentRoom.rated && currentRoom.reservedSeats && currentRoom.formatName && result !== "tie") {
      updateRatings(currentRoom.reservedSeats!, result === "p1", currentRoom.formatName)
    }
  }
  rooms.delete(room);
}

type whoWon = "p1" | "p2" | "tie";

function sendResult(room: Room, result: whoWon) {
  let p = room.players[0];
  let o = room.players[1];
   
  if(result === "p1") {
    if(p)
      pubClient.publish("messagesToUser:" + p.id, "$endwon|" + JSON.stringify(reduceTeamForEnd(p.current?.team)));
    if(o)
      pubClient.publish("messagesToUser:" + o.id, "$endlost|" + JSON.stringify(reduceTeamForEnd(o.current?.team)));
  } else if (result === "p2") {
    if(p)
      pubClient.publish("messagesToUser:" + p.id, "$endlost|" + JSON.stringify(reduceTeamForEnd(p.current?.team)));
    if(o)
      pubClient.publish("messagesToUser:" + o.id, "$endwon|" + JSON.stringify(reduceTeamForEnd(o.current?.team)));
  } else {
    if(p)
      pubClient.publish("messagesToUser:" + p.id, "$endtied|" + JSON.stringify(reduceTeamForEnd(p.current?.team)));
    if(o)
      pubClient.publish("messagesToUser:" + o.id, "$endtied|" + JSON.stringify(reduceTeamForEnd(o.current?.team)));
  }
}

export default endGame;
