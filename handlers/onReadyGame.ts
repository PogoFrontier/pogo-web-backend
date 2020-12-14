import to from "../actions/to";
import { rooms, onlineClients } from "../server";
import { CODE } from "../types/actions";
import { OnReadyGamePayload } from "../types/handlers";

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
              startCountdown(room);
          }
        }
      }
  }
}

function startCountdown(room: string) {
  let countdown = 0;
  const x = setInterval(() => {
      countdown++;
      if (countdown === 4) {
          to(room, JSON.stringify({
              type: CODE.game_start
          }))
          clearInterval(x);
          startGame(room);
      } else {
        const currentRoom = rooms.get(room);
        if (currentRoom) {
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
  let time = 240;
  let shouldCountdown = false;
  const x = setInterval(() => {
    const currentRoom = rooms.get(room);
    if (currentRoom) {
      currentRoom.turn = currentRoom.turn ? currentRoom.turn + 1 : 1;
    }
    if (shouldCountdown) {
      time--;
      shouldCountdown = false;
    } else {
      shouldCountdown = true;
    }
    const payload = {
      time,
      update: [{}, {}]
    };
    const data = {
      type: CODE.turn,
      payload
    };
    to(room, JSON.stringify(data));
  }, 500);
}

export default onReadyGame;
