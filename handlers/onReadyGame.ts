import to from "../actions/to";
import { reduceTeam } from "../actions/reduceInformation"
import m from '../data/moves.json';
import { TURN_LENGTH } from "../config";
import { rooms } from "../matchhandling_server";
import { CODE } from "../types/actions";
import { OnReadyGamePayload } from "../types/handlers";
import { pubClient } from "../redis/clients";
import { Move, Player, RoomStatus } from "../types/room";
import onTurn from "./onTurn";
import { v4 as uuidv4 } from 'uuid';

const moves: any = m;

export function onReadyGame(id: string, payload: OnReadyGamePayload) {
  const { room } = payload;
  const currentRoom = rooms.get(room);
  if (currentRoom && currentRoom.status === RoomStatus.READY) {
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

export function startCountdown(room: string) {
  let countdown = 0;
  const currentRoom = rooms.get(room);
  if (currentRoom && currentRoom.status === RoomStatus.STARTING) {
    const x = setInterval(() => {
      if (currentRoom && currentRoom.status === RoomStatus.STARTING) {
        countdown++;
        if (countdown === 4) {
          for (let i in currentRoom.players) {
            const player = currentRoom.players[i];
            const opp = currentRoom.players[[1, 0][i]];
            to(room, JSON.stringify({
                type: CODE.game_start,
                payload: {
                  allMoves: getMovesOfPlayer(player),
                  current: reduceTeam(player?.current?.team!)
                }
            }), opp?.id);
          }
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
              && opponent.current) {
                pubClient.publish("messagesToUser:" + player.id, JSON.stringify({
                  type: CODE.game_check,
                  payload: {
                    countdown
                  }
                }));
            }
          }
        }
      } else {
        clearInterval(x);
      }
    }, 1000);
  }
}

function startGame(room: string) {
  console.info(`Room ${room} started a game`)
  const roomObj = rooms.get(room)

  if (roomObj) {
    if (roomObj.timer) {
      clearInterval(roomObj.timer);
      delete roomObj.timer;
    }
    const id = uuidv4();
    roomObj.timerId = id;
    roomObj.timer = setInterval(() => onTurn(room, id), TURN_LENGTH);

    for(let poke of roomObj.players.map(player => player?.current?.team[0])) {
      poke!.current!.switchedIn = new Date();
    }
  }
}

function getMovesOfPlayer(player: Player | null): Move[][] {
  if(!player || !player.current) {
    console.error("Get moves of player that isn't in a battle")
    return [];
  }

  let arr = [];
  for (const member of player.current.team) {
    let arr2 = [moves[member.fastMove]];
    for (const move of member.chargeMoves) {
        if (move !== "NONE") {
            arr2.push(moves[move]);
        }
    }
    arr.push(arr2);
  }
  return arr
}
