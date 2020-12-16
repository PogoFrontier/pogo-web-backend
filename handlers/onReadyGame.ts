import to from "../actions/to";
import { rooms, onlineClients } from "../server";
import { CODE } from "../types/actions";
import { OnReadyGamePayload } from "../types/handlers";
import { RoomStatus } from "../types/room";
import onTurn from "./onTurn";

function onReadyGame(id: string, payload: OnReadyGamePayload) {
  const { room } = payload;
  const currentRoom = rooms.get(room);
  if (currentRoom) {
      const i = currentRoom.players.findIndex(x => x && x.id === id);
      if (i > -1) {
        const player = currentRoom.players[i];
        if (player?.current) {
          player.current.ready = true;
          const j = i === 0 ? 1 : 0;
          if (currentRoom.players[j]?.current?.ready) {
              console.info(`Room ${room} is starting countdown`)
              currentRoom.status = RoomStatus.STARTING;
              startCountdown(room);
          }
        }
      }
  }
}

function startCountdown(room: string) {
  let countdown = 0;
  const currentRoom = rooms.get(room);
  const x = setInterval(() => {
    if (currentRoom) {
      countdown++;
      if (countdown === 4) {
          to(room, JSON.stringify({
              type: CODE.game_start
          }));
          currentRoom.status = RoomStatus.STARTED;
          clearInterval(x);
          startGame(room);
      } else {
        for (let i = 0; i < currentRoom.players.length; i++) {
          const player = currentRoom.players[i];
          const j = i === 0 ? 1 : 0;
          const opponent = currentRoom.players[j];
          if (player
            && player.current
            && opponent
            && opponent.current
            && onlineClients.get(player.id)) {
            onlineClients.get(player.id)!.send(JSON.stringify({
              type: CODE.game_check,
              payload: {
                  countdown,
                  team: player.current.team,
                  opponent: opponent.current.team,
              }
          }))
          }
        }
      }
    }
  }, 1000);
}

function startGame(room: string) {
  console.info(`Room ${room} started a game`)
  const x = setInterval(() => onTurn(room), 500);
}

export default onReadyGame;
