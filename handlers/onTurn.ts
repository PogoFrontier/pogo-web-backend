import indexOfMax from "../actions/indexOfMax";
import { CHARGE_WAIT, GAME_TIME, SWAP_COOLDOWN, SWITCH_WAIT, TURN_LENGTH } from "../config";
import { moves, rooms } from "../server";
import { Actions, CODE } from "../types/actions";
import { ResolveTurnPayload, Update } from "../types/handlers";
import { Move, RoomStatus } from "../types/room";
import { calcDamage } from "../utils/damageUtils";
import endGame from "./endGame";
import { pubClient } from "../redis/clients";

function evaluatePayload(room: string): [Update | null, Update | null] {
  const payload: [Update | null, Update | null] = [null, null];
  const currentRoom = rooms.get(room);
  const shouldSwitch = [-1, -1];
  const shouldCharge = [-1, -1];
  if (currentRoom) {
    for (let i = 0; i < currentRoom.players.length; i++) {
      const player = currentRoom.players[i];
      if (player && player.current?.action) {
        switch (player.current.action.id) {
          case Actions.FAST_ATTACK:
            if (!player.current.action.move
              || currentRoom.status === RoomStatus.STARTING
              || currentRoom.status === RoomStatus.SELECTING
              || currentRoom.status === RoomStatus.CHARGE) {
              break;
            }
            player.current.action.move!.cooldown -= 500;
            if (player.current.action.move!.cooldown <= 0) {
              const j = i === 0 ? 1 : 0;

              player.current.team[player.current.active].current!.energy = 
                Math.min(100, (player.current.team[player.current.active].current!.energy || 0) + moves[player.current.action.move.moveId].energyGain)

              payload[i] = {
                ...payload[i],
                id: player.id,
                active: player.current.active,
                hp: payload[i]?.hp || player.current.team[player.current.active].current!.hp,
                shouldReturn: true,
                energy: player.current.team[player.current.active].current!.energy,
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
                    delete opponent.current.action; //Cancel fast attacks
                    delete opponent.current.bufferedAction;
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
            shouldCharge[i] = player.current.team[player.current.active].atk;
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
          // Reset debuffs
          player.current!.team[oldActive].current!.atk = player.current!.team[oldActive].atk;
          player.current!.team[oldActive].current!.def = player.current!.team[oldActive].def;
          player.current!.team[oldActive].current!.status = [0, 0];
          // Set new active Pokemon
          player!.current!.active = shouldSwitch[i];
          // Generate payload
          if (payload[i] === null) {
            payload[i] = {
              id: currentRoom.players[i]!.id,
              active: shouldSwitch[i],
              hp: player.team[oldActive] ? player.team[oldActive].current?.hp : 0,
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
          delete player.current!.action;
        }
      }
    } else if (currentRoom.wait) {
      currentRoom.wait = Number((currentRoom.wait - 0.5).toFixed(1));
      const wait = Math.ceil(currentRoom.wait);
      for (let i = 0; i < currentRoom.players.length; i++) {
        const player = currentRoom.players[i];
        if (payload[i] === null && player) {
          if (wait <= 0) {
            if (currentRoom.status === RoomStatus.CHARGE
              || currentRoom.status === RoomStatus.LISTENING) {
              currentRoom.status = RoomStatus.LISTENING;
            } else {
              currentRoom.status = RoomStatus.STARTED;
              if (player.current!.team[player.current!.active].current!.hp <= 0) {
                player.current!.active = player.current!.team.findIndex(x => x.current!.hp > 0);
              }
            }
          }
          payload[i] = {
            id: player.id,
            active: player.current!.active,
            wait: wait <= 0 ? -1 : wait
          }
        }
      }
      return payload;
    }
    if (currentRoom.status !== RoomStatus.FAINT && (shouldCharge[0] > -1 || shouldCharge[1] > -1)) {
      let i = 0;
      if (shouldCharge[0] === shouldCharge[1] ) {
        i = Math.round(Math.random());
      } else {
        i = indexOfMax(shouldCharge);
      }
      const j = i === 0 ? 1 : 0;
      currentRoom.status = RoomStatus.CHARGE;
      currentRoom.wait = CHARGE_WAIT;
      currentRoom.charge = {
        subject: i,
        move: currentRoom.players[i]!.current!.action!.move!
      };
      if (shouldCharge[j] > -1) {
        currentRoom.charge.cmp = currentRoom.players[j]!.current!.action!.move!
      }
      delete currentRoom.players[i]!.current!.action;
      delete currentRoom.players[i]!.current!.bufferedAction;
      delete currentRoom.players[j]!.current!.bufferedAction;
      payload[i] = {
        ...payload[i],
        id: currentRoom.players[i]!.id,
        active: currentRoom.players[i]?.current?.active || 0,
        shouldReturn: true,
        wait: CHARGE_WAIT,
        charge: 1
      };
      if (currentRoom.players[j]?.current?.action?.move) {
        currentRoom.players[j]!.current!.action!.move!.cooldown = 0;
      }
      payload[j] = {
        ...payload[j],
        id: currentRoom.players[j]!.id,
        active: currentRoom.players[j]?.current?.active || 0,
        shouldReturn: true,
        wait: CHARGE_WAIT,
        charge: 2
      };
    }
  }

  return payload;
}

const onTurn = (room: string, id: string) => {
  const currentRoom = rooms.get(room);
  if (currentRoom
    && currentRoom.timerId === id
    && currentRoom.players
    && currentRoom.status !== RoomStatus.SELECTING
    && currentRoom.status !== RoomStatus.STARTING
    && currentRoom.status !== RoomStatus.LISTENING) {
    currentRoom.turn = currentRoom.turn ? currentRoom.turn + 1 : 1;
    const time = Math.ceil(Number((GAME_TIME - currentRoom.turn * 0.5).toFixed(1)))
    if (time === 0) {
      endGame(room, true);
      return;
    }
    const payload: ResolveTurnPayload = {
      time,
      update: evaluatePayload(room),
      switch: 0
    };
    if (currentRoom) {
      for (let i = 0; i < currentRoom.players.length; i++) {
        const player = currentRoom.players[i];
        const j = i === 0 ? 1 : 0;
        if (player) {
          if (player.current
            && player.current.bufferedAction
            && !player.current.action
            && currentRoom.status === RoomStatus.STARTED) {
              let buffString = player.current.bufferedAction.string!;
              player.current.action = player.current.bufferedAction;
              setTimeout(() => {
                const oppId = currentRoom.players[j]!.id;
                pubClient.publish("messagesToUser:" + oppId, buffString);
              }, TURN_LENGTH / 2)
              delete player.current.bufferedAction;
          }
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
          
          pubClient.publish("messagesToUser:" + player.id, JSON.stringify(data));
        }
      }
    }
  }
}

export default onTurn;
