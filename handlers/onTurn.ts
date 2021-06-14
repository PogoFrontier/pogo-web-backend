import { reduceActionForOpponent, reduceTeamMemberForPlayer } from "../actions/reduceInformation";
import indexOfMax from "../actions/indexOfMax";
import { ANIMATING_WAIT, CHARGE_WAIT, GAME_TIME, SWAP_COOLDOWN } from "../config";
import { moves, rooms } from "../matchhandling_server";
import { Actions, CODE } from "../types/actions";
import { ResolveTurnPayload, Update } from "../types/handlers";
import { Room, RoomStatus, } from "../types/room";
import { calcDamage } from "../utils/damageUtils";
import onFaint from "./onFaint";
import endGame from "./endGame";
import onChargeEnd from "./onChargeEnd"
import { pubClient } from "../redis/clients";

function evaluatePayload(room: string): [Update | null, Update | null] {
  const payload: [Update | null, Update | null] = [null, null];
  const currentRoom = rooms.get(room);
  const shouldFA: [boolean, boolean] = [false, false];
  const shouldSwitch = [-1, -1];
  const shouldCharge = [-1, -1];
  const activeBefore = currentRoom?.players.map(player => player?.current?.active)
  if (currentRoom && currentRoom.status !== RoomStatus.ANIMATING) {
    for (let i = 0; i < currentRoom.players.length; i++) {
      const j = i === 0 ? 1 : 0;
      const player = currentRoom.players[i];

      const activePokemon = player?.current?.team[player.current.active];
      if (player && player.current?.action) {
        switch (player.current.action.id) {
          case Actions.FAST_ATTACK:
            if (!player.current.action.move
              || currentRoom.status === RoomStatus.STARTING
              || currentRoom.status === RoomStatus.SELECTING
              || currentRoom.status === RoomStatus.CHARGE
              || currentRoom.previousStatus === RoomStatus.CHARGE
              || !activePokemon?.current?.hp) {
              break;
            }
            shouldFA[i] = true;
            break;

          case Actions.CHARGE_ATTACK:
            if (currentRoom.previousStatus === RoomStatus.CHARGE) {
              break;
            }
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
      if(player && player.current?.afterCharge && currentRoom.previousStatus === RoomStatus.CHARGE) {
        shouldFA[i] = true;
      }
    }

    if(currentRoom.previousStatus !== RoomStatus.CHARGE) {
      for(let i in shouldFA) {
        if(shouldFA[i]) {
          makeFastAttack({
            currentRoom,
            payload,
            active: activeBefore![i]!,
            i: parseInt(i)
          })
        }
      }
    }

    // Clear inputs on faint
    if ([RoomStatus.FAINT, RoomStatus.ANIMATING].includes(currentRoom.status)) {
      for (const player of currentRoom.players) {
        const action = player?.current?.action?.id ? player?.current?.action?.id : "";
        if ([Actions.CHARGE_ATTACK, Actions.FAST_ATTACK].includes(action)) {
          delete player?.current?.action;
        }
        delete player?.current?.bufferedAction;
        shouldCharge[0] = -1
        shouldCharge[1] = -1
      }
    }

    if (shouldSwitch[0] > -1 || shouldSwitch[1] > -1) {
      for (let i = 0; i < shouldSwitch.length; i++) {
        if (shouldSwitch[i] > -1) {
          const player = currentRoom.players[i]!
          const oldActive = player!.current!.active;
          const oldActivePokemon = player.current!.team[oldActive]
          // Reset debuffs
          oldActivePokemon.current!.atk = oldActivePokemon.atk;
          oldActivePokemon.current!.def = oldActivePokemon.def;
          oldActivePokemon.current!.status = [0, 0];
          // Set new active Pokemon
          player!.current!.active = shouldSwitch[i];

          // Update time spend alive
          if(oldActivePokemon.current?.switchedIn) {
            oldActivePokemon.current.timeSpendAlive += new Date().getTime() - oldActivePokemon.current.switchedIn.getTime()
            delete oldActivePokemon.current.switchedIn
          }
          player.current!.team[shouldSwitch[i]].current!.switchedIn = new Date()

          // Generate payload
          if (payload[i] === null) {
            let newActivePokemon = player.team[shouldSwitch[i]]
            payload[i] = {
              id: currentRoom.players[i]!.id,
              active: shouldSwitch[i],
              hp: newActivePokemon && newActivePokemon.current?.hp ? newActivePokemon.current.hp / newActivePokemon.hp : 0,
              shouldReturn: true
            };
          } else {
            payload[i]!.id = currentRoom.players[i]!.id;
            payload[i]!.active = shouldSwitch[i];
            payload[i]!.shouldReturn = true;
          }
          if (currentRoom.status === RoomStatus.STARTED) {
            player.current!.switch = currentRoom.format.advancedOptions?.switchTimer !== undefined ?currentRoom.format.advancedOptions?.switchTimer : SWAP_COOLDOWN;
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
          pubClient.publish("messagesToUser:" + currentRoom.players[[1, 0][i]]!.id, reduceActionForOpponent("#sw:" + player.current?.active, player.current!.team, player.current!.action?.move, currentRoom.turn ? currentRoom.turn : 0));
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
            currentRoom.status = RoomStatus.STARTED;
            if (player.current!.team[player.current!.active].current!.hp <= 0) {
              player.current!.active = player.current!.team.findIndex(x => x.current!.hp > 0);
              // notify other user
              const oppId = currentRoom.players[[1, 0][i]]!.id;
              player.current!.team[player.current!.active].current!.switchedIn = new Date()
              pubClient.publish("messagesToUser:" + oppId, reduceActionForOpponent(`#${Actions.SWITCH}:` + player.current!.active, player!.current!.team));
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
        delete currentRoom.players[j]!.current!.action;
      }
      delete currentRoom.players[i]!.current!.action;
      delete currentRoom.players[i]!.current!.bufferedAction;
      delete currentRoom.players[j]!.current!.bufferedAction;
      const myActive = currentRoom.players[i]?.current?.active || 0;
      const myCurrent = currentRoom.players[i]?.current?.team[myActive];
      payload[i] = {
        ...payload[i],
        id: currentRoom.players[i]!.id,
        active: myActive,
        shouldReturn: true, 
        wait: CHARGE_WAIT,
        energy: (myCurrent && myCurrent.current) ? myCurrent.current.energy : 0,
        charge: 1
      };
      if (currentRoom.players[j]?.current?.action?.move) {
        currentRoom.players[j]!.current!.action!.move!.cooldown = 0;
        currentRoom.players[j]!.current!.afterCharge = currentRoom.players[j]!.current!.action
        delete currentRoom.players[j]!.current!.action
      }
      payload[j] = {
        ...payload[j],
        id: currentRoom.players[j]!.id,
        active: currentRoom.players[j]?.current?.active || 0,
        shouldReturn: true,
        wait: CHARGE_WAIT,
        charge: 2
      };
      setTimeout(() => onChargeEnd(currentRoom.id), CHARGE_WAIT * 1000)
    }

    
    if(currentRoom.previousStatus === RoomStatus.CHARGE) {
      for(let i in shouldFA) {
        if(shouldFA[i]) {
          makeFastAttack({
            currentRoom,
            payload,
            i: parseInt(i),
            active: activeBefore![i]!,
            useAfterCharge: true
          })
        }
      }
    }

    currentRoom.previousStatus = currentRoom.status
  }

  return payload;
}

function makeFastAttack ({currentRoom, payload, i, active, useAfterCharge}: {
  currentRoom: Room,
  payload: [Update | null, Update | null],
  i: number,
  active: number
  useAfterCharge?: boolean
}) {
  const j = [1, 0][i]
  const player = currentRoom.players[i]!
  const opponent = currentRoom.players[j]!
  const current = player.current!
  const action = useAfterCharge ? current.afterCharge! : current.action!
  delete current.afterCharge
  const activePokemon = current.team[active]!

  if(!action.animated) {
    pubClient.publish("messagesToUser:" + opponent.id, reduceActionForOpponent("#fa:", current.team, action.move, currentRoom.turn ? currentRoom.turn : 0));
    action.animated = true
  }

  action.move!.cooldown -= 500;
  if (action.move!.cooldown <= 0) {
    activePokemon.current!.energy = 
      Math.min(100, (activePokemon.current!.energy || 0) + moves[action.move!.moveId].energyGain)

    payload[i] = {
      ...payload[i], 
      id: player.id,
      active: current.active,
      hp: payload[i]?.hp || activePokemon.current!.hp / activePokemon.hp,
      shouldReturn: true,
      energy: activePokemon.current!.energy,
    }
    const opponentActivePokemon = opponent.current!.team[opponent.current!.active];
    opponentActivePokemon.current!.hp = calcDamage(
      activePokemon,
      opponentActivePokemon,
      action!.move!
    );
    payload[j] = {
      ...payload[j],
      id: opponent.id,
      active: opponent.current!.active,
      hp: opponentActivePokemon.current!.hp / opponentActivePokemon.hp,
    }

    if (opponentActivePokemon.current && opponentActivePokemon.current.hp <= 0) {
      opponent.current!.remaining -= 1;
      if (opponent.current?.action?.move) {
        if (opponent.current?.action?.move.cooldown >= 500) {
          delete opponent.current.action; //Cancel fast attacks
          delete opponent.current.bufferedAction;
        }
      }
      
      opponentActivePokemon.current.timeSpendAlive += new Date().getTime() - opponentActivePokemon.current.switchedIn!.getTime()
      delete opponentActivePokemon.current.switchedIn

      payload[j]!.remaining = opponent.current!.remaining;
      delete current.bufferedAction;

      currentRoom.status = RoomStatus.ANIMATING
      setTimeout(() => onFaint(currentRoom.id), ANIMATING_WAIT * 1000)
    }
    if(!useAfterCharge) {
      delete current.action;
    }
  }
}

const onTurn = (room: string, id: string) => {
  const currentRoom = rooms.get(room);
  if (currentRoom
    && currentRoom.timerId === id
    && currentRoom.players
    && currentRoom.status !== RoomStatus.SELECTING
    && currentRoom.status !== RoomStatus.STARTING) {
    currentRoom.turn = currentRoom.turn ? currentRoom.turn + 1 : 1;
    const time = Math.ceil(Number((GAME_TIME - currentRoom.turn * 0.5).toFixed(1)))

    // Transform charge moves into quick moves if neccessary
    for (let player of currentRoom.players) {
      const activePoke = player?.current?.team[player.current.active]
      const energy = activePoke?.current?.energy
      if (player && player.current?.action?.move && activePoke && energy !== undefined && player.current.action.id === Actions.CHARGE_ATTACK && player.current.action.move.energy > energy) {
        player.current.action.id  = Actions.FAST_ATTACK
        player.current.action.move = {...moves[activePoke.fastMove]}
        player.current.action.active = player.current.active
        player.current.action.string = "#fa:" + activePoke.fastMove
      }
    }

    if (time <= 0 && currentRoom.status !== RoomStatus.CHARGE) {
      endGame(room, true);
      return;
    }
    const payload: ResolveTurnPayload = {
      time,
      update: evaluatePayload(room),
      switch: 0,
      team: [],
      turn: currentRoom.turn
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
              player.current.action = player.current.bufferedAction;
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
          payload.team = player.current!.team.map(reduceTeamMemberForPlayer)
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
