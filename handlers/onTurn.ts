import { GAME_TIME, SWAP_COOLDOWN } from "../config";
import { onlineClients, rooms } from "../server";
import { Move } from "../types";
import { Actions, CODE } from "../types/actions";
import { ResolveTurnPayload, Update } from "../types/handlers";
import { RoomStatus } from "../types/room";
import { TeamMember } from "../types/team";

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
  return defender.current!.hp - damage;
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
            if (!player.current.action.move) {
              break;
            }
            player.current.action.move!.cooldown -= 500;
            if (player.current.action.move!.cooldown <= 0) {
              const j = i === 0 ? 1 : 0;
              payload[i] = {
                id: player.id,
                active: player.current.active,
                hp: player.current.team[player.current.active].current!.hp,
                shouldReturn: true
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
              player.current.action = undefined
            }
            break;

          case Actions.CHARGE_ATTACK:
            console.log("Sorry charge move is not implemented yet");
            break;

          case Actions.SWITCH:
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
          player.current!.switch = SWAP_COOLDOWN;
          player.current!.action = undefined;
        }
      }
    }
  }

  return payload;
}

const onTurn = (room: string) => {
  const currentRoom = rooms.get(room);
  if (currentRoom && currentRoom.players && currentRoom.status === RoomStatus.STARTED) {
    currentRoom.turn = currentRoom.turn ? currentRoom.turn + 1 : 1;
    const time = Math.floor(GAME_TIME - currentRoom.turn * 0.5)
    const payload: ResolveTurnPayload = {
      time,
      update: evaluatePayload(room),
      switch: 0
    };
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

export default onTurn;
