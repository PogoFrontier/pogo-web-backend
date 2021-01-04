import to from "../actions/to";
import { GAME_TIME, SWAP_COOLDOWN, SWITCH_WAIT } from "../config";
import { onlineClients, rooms } from "../server";
import { Move } from "../types";
import { Actions, CODE } from "../types/actions";
import { ResolveTurnPayload, Update } from "../types/handlers";
import { RoomStatus } from "../types/room";
import { TeamMember } from "../types/team";
import moves from '../data/moves.json';

const moveDetails :{ [index:string] : Move } = moves;

const types = new Array(
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.625, 0.390625, 1, 1, 0.625, 1, 1],// Normal
  [1, 0.625, 0.625, 1, 1.6, 1.6, 1, 1, 1, 1, 1, 1.6, 0.625, 1, 0.625, 1, 1.6, 1, 1],// Fire
  [1, 1.6, 0.625, 1, 0.625, 1, 1, 1, 1.6, 1, 1, 1, 1.6, 1, 0.625, 1, 1, 1, 1],// Water
  [1, 1, 1.6, 0.625, 0.625, 1, 1, 1, 0.390625, 1.6, 1, 1, 1, 1, 0.625, 1, 1, 1, 1],// Electric
  [1, 0.625, 1.6, 1, 0.625, 1, 1, 0.625, 1.6, 0.625, 1, 0.625, 1.6, 1, 0.625, 1, 0.625, 1, 1],// Grass
  [1, 0.625, 0.625, 1, 1.6, 0.625, 1, 1, 1.6, 1.6, 1, 1, 1, 1, 1.6, 1, 0.625, 1, 1],// Ice
  [1.6, 1, 1, 1, 1, 1.6, 1, 0.625, 1, 0.625, 0.625, 0.625, 1.6, 0.390625, 1, 1.6, 1.6, 0.625, 1],// Fighting
  [1, 1, 1, 1, 1.6, 1, 1, 0.625, 0.625, 1, 1, 1, 0.625, 0.625, 1, 1, 0.390625, 1.6, 1],// Poison
  [1, 1.6, 1, 1.6, 0.625, 1, 1, 1.6, 1, 0.390625, 1, 0.625, 1.6, 1, 1, 1, 1.6, 1, 1],// Ground
  [1, 1, 1, 0.625, 1.6, 1, 1.6, 1, 1, 1, 1, 1.6, 0.625, 1, 1, 1, 0.625, 1, 1],// Flying
  [1, 1, 1, 1, 1, 1, 1.6, 1.6, 1, 1, 0.625, 1, 1, 1, 1, 0.390625, 0.625, 1, 1],// Psychic
  [1, 0.625, 1, 1, 1.6, 1, 0.625, 0.625, 1, 0.625, 1.6, 1, 1, 0.625, 1, 1.6, 0.625, 0.625, 1],// Bug
  [1, 1.6, 1, 1, 1, 1.6, 0.625, 1, 0.625, 1.6, 1, 1.6, 1, 1, 1, 1, 0.625, 1, 1],// Rock
  [0.390625, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6, 1, 1, 1.6, 1, 0.625, 1, 1, 1],// Ghost
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6, 1, 0.625, 0.390625, 1],// Dragon
  [1, 1, 1, 1, 1, 1, 0.625, 1, 1, 1, 1.6, 1, 1, 1.6, 1, 0.625, 1, 0.625, 1],// Dark
  [1, 0.625, 0.625, 0.625, 1, 1.6, 1, 1, 1, 1, 1, 1, 1.6, 1, 1, 1, 0.625, 1.6, 1],// Steel
  [1, 0.625, 1, 1, 1, 1, 1.6, 0.625, 1, 1, 1, 1, 1, 1, 1.6, 1.6, 0.625, 1, 1],// Fairy
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);// None
  
const type_name: { [key: string]: number } = {
  "normal": 0,
  "fire": 1,
  "water": 2,
  "electric": 3,
  "grass": 4,
  "ice": 5,
  "fighting": 6,
  "poison": 7,
  "ground": 8,
  "flying": 9,
  "psychic": 10,
  "bug": 11,
  "rock": 12,
  "ghost": 13,
  "dragon": 14,
  "dark": 15,
  "steel": 16,
  "fairy": 17
};

function getMultiplier(attackerTypes: string[], defenderTypes: string[], moveType: string): number {
  let mult = 1;
  for (const type of defenderTypes) {
    if (type_name[type] && type_name[moveType]) {
      mult *= types[type_name[moveType]][type_name[type]]
    }
  }
  if (attackerTypes.findIndex(x => x === moveType) > -1) {  //STAB
    mult *= 1.2;
  }
  return mult;
}

function calcDamage(attacker: TeamMember, defender: TeamMember, move: Move): number {
  const mult = getMultiplier(attacker.types, defender.types, move.type);
  const damage = Math.floor(0.5 * (attacker.current!.atk / defender.current!.def) * move.power * mult) + 1;
  return Math.max(defender.current!.hp - damage, 0);
}

function endGame(room: string) {
  const currentRoom = rooms.get(room);
  if (currentRoom) {
    if (currentRoom.timer) {
      clearInterval(rooms.get(room)!.timer);
      delete rooms.get(room)!.timer;
    }
    to(room, "$end");
    rooms.delete(room);
  }
}

function evaluatePayload(room: string): [Update | null, Update | null] {
  const payload: [Update | null, Update | null] = [null, null];
  const currentRoom = rooms.get(room);
  const shouldSwitch = [-1, -1];
  if (currentRoom) {
    for (let i = 0; i < currentRoom.players.length; i++) {
      const player = currentRoom.players[i];
      if (player && player.current?.action) {
        switch (player.current.action.id) {
          case Actions.FAST_ATTACK:
            if (!player.current.action.move || currentRoom.status === RoomStatus.STARTING || currentRoom.status === RoomStatus.SELECTING) {
              break;
            }
            player.current.action.move!.cooldown -= 500;
            if (player.current.action.move!.cooldown <= 0) {
              const j = i === 0 ? 1 : 0;
              payload[i] = {
                ...payload[i],
                id: player.id,
                active: player.current.active,
                hp: payload[i]?.hp || player.current.team[player.current.active].current!.hp,
                shouldReturn: true,
                energy: Math.min(100, (payload[i]?.energy || 0) + moveDetails[player.current.action.move.moveId].energyGain),
              }
              const opponent = currentRoom.players[j]!;
              opponent.current!.team[opponent.current!.active].current!.hp = calcDamage(
                player.current.team[player.current.active],
                opponent.current!.team[opponent.current!.active],
                player.current.action!.move!
              );
              payload[j] = {
                ...payload[j],
                id: opponent.id,
                active: opponent.current!.active,
                hp: opponent.current!.team[opponent.current!.active].current!.hp,
              }
              if (opponent.current!.team[opponent.current!.active].current!.hp <= 0) {
                opponent.current!.remaining -= 1;
                if (opponent.current?.action?.move) {
                  if (opponent.current?.action?.move.cooldown > 500) {
                    delete opponent.current!.action; //Cancel fast attacks
                  }
                }
                if (opponent.current!.remaining <= 0) {
                  endGame(room);
                } else if (currentRoom.status !== RoomStatus.FAINT) {
                  currentRoom.status = RoomStatus.FAINT;
                  currentRoom.wait = SWITCH_WAIT;
                  payload[i]!.wait = SWITCH_WAIT;
                  payload[j]!.wait = SWITCH_WAIT;
                }
                payload[j]!.remaining = opponent.current!.remaining;
              }
              delete player.current.action;
            }
            break;

          case Actions.CHARGE_ATTACK:
            console.log("Sorry charge move is not implemented yet");
            break;

          case Actions.SWITCH:
            if (currentRoom.status === RoomStatus.CHARGE) {
              break;
            }
            shouldSwitch[i] = player.current.action.active;
            break;
        }
      }
    }
    if (shouldSwitch[0] > -1 || shouldSwitch[1] > -1) {
      for (let i = 0; i < shouldSwitch.length; i++) {
        if (shouldSwitch[i] > -1) {
          const player = currentRoom.players[i]!
          const oldActive = player!.current!.active;
          player!.current!.active = shouldSwitch[i];
          if (payload[i] === null) {
            payload[i] = {
              id: currentRoom.players[i]!.id,
              active: shouldSwitch[i],
              hp: player.team[oldActive].current?.hp,
              shouldReturn: true
            };
          } else {
            payload[i]!.id = currentRoom.players[i]!.id;
            payload[i]!.active = shouldSwitch[i];
            payload[i]!.shouldReturn = true;
          }
          if (currentRoom.status === RoomStatus.STARTED) {
            player.current!.switch = SWAP_COOLDOWN;
          } else {
            if (currentRoom.wait) {
              const j = i === 0 ? 1 : 0;
              if (currentRoom.players[j]!.current!.team[currentRoom.players[j]!.current!.active].current!.hp > 0) {
                currentRoom.status = RoomStatus.STARTED;
                delete currentRoom.wait;
                if (payload[j] === null) {
                  payload[j] = {
                    id: currentRoom.players[j]!.id,
                    active: currentRoom.players[j]?.current?.active || 0,
                    shouldReturn: true,
                    wait: -1
                  };
                } else {
                  payload[j]!.wait = -1;
                }
              }
              payload[i]!.wait = -1;
            }
          }
          player.current!.action = undefined;
        }
      }
    } else if (currentRoom.wait) {
      currentRoom.wait = Number((currentRoom.wait - 0.5).toFixed(1));
      const wait = Math.ceil(currentRoom.wait);
      for (let i = 0; i < currentRoom.players.length; i++) {
        const player = currentRoom.players[i];
        if (payload[i] === null && player) {
          if (wait <= 0) {
            currentRoom.status = RoomStatus.STARTED;
            if (player.current!.team[player.current!.active].current!.hp <= 0) {
              player.current!.active = player.current!.team.findIndex(x => x.current!.hp > 0);
            }
          }
          payload[i] = {
            id: player.id,
            active: player.current!.active,
            wait: wait <= 0 ? -1 : wait
          }
        }
      }
    }
  }

  return payload;
}

const onTurn = (room: string) => {
  const currentRoom = rooms.get(room);
  if (currentRoom && currentRoom.players && currentRoom.status != RoomStatus.SELECTING && currentRoom.status != RoomStatus.STARTING) {
    currentRoom.turn = currentRoom.turn ? currentRoom.turn + 1 : 1;
    const time = Math.ceil(Number((GAME_TIME - currentRoom.turn * 0.5).toFixed(1)))
    const payload: ResolveTurnPayload = {
      time,
      update: evaluatePayload(room),
      switch: 0
    };
    if (currentRoom) {
      for (let i = 0; i < currentRoom.players.length; i++) {
        const player = currentRoom.players[i]
        const j = i === 0 ? 1 : 0
        if (player) {
          if (payload.update[i]?.id !== payload.update[j]?.id && i === 1) {
            payload.update.reverse();
          }
          if (player.current && player.current?.switch > 0) {
            if (currentRoom.turn % 2 === 0) {
              player.current!.switch--;
            }
            payload.switch = player.current?.switch;
          } else {
            payload.switch = 0;
          }
          const data = {
            type: CODE.turn,
            payload
          };
          onlineClients.get(player.id)!.send(JSON.stringify(data));
        }
      }
    }
  }
}

export default onTurn;
