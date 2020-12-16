import { onlineClients, rooms } from "../server";
import { Actions, CODE } from "../types/actions";
import { ResolveTurnPayload, Update } from "../types/handlers";
import { TeamMember } from "../types/team";

function calcDamage(attacker: TeamMember, defender: TeamMember): number {
  // const damage = Math.floor(0.5 * attacker.current!.atk / defender.current!.def) + 1
  return defender.current!.hp - 10;
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
            console.log("MEOW")
            if (!player.current.action.move) {
              break;
            }
            console.log("MEOW2")
            player.current.action.move!.cooldown -= 500;
            console.log(player.current.action.move!.cooldown)
            if (player.current.action.move!.cooldown <= 0) {
              console.log("MEOW3")
              player.current.action = undefined
              const j = i === 0 ? 1 : 0;
              payload[i] = {
                id: player.id,
                active: player.current.active,
                hp: player.current.team[player.current.active].current!.hp
              }
              const opponent = currentRoom.players[j]!;
              opponent.current!.team[opponent.current!.active].current!.hp = calcDamage(
                player.current.team[player.current.active],
                opponent.current!.team[opponent.current!.active]
              );
              payload[j] = {
                id: opponent.id,
                active: opponent.current!.active,
                hp: opponent.current!.team[opponent.current!.active].current!.hp
              }
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
          player!.current!.active = shouldSwitch[i];
          if (payload[i] === null) {
            payload[i] = {
              id: currentRoom.players[i]!.id,
              active: shouldSwitch[i],
              hp: player.team[shouldSwitch[i]].current!.hp
            };
          } else {
            payload[i]!.id = currentRoom.players[i]!.id;
            payload[i]!.active = shouldSwitch[i];
          }
          player.current!.action = undefined;
        }
      }
    }
  }

  return payload;
}

const onTurn = (time: number, shouldCountdown: boolean, room: string) => {
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
  const payload: ResolveTurnPayload = {
    time,
    update: evaluatePayload(room)
  };
  for (let player of rooms.get(room)!.players) {
    if (player) {
      payload.update.sort((a) => {
        return a?.id === player!.id ? -1 : 1
      })
      const data = {
        type: CODE.turn,
        payload
      };
      onlineClients.get(player.id)!.send(JSON.stringify(data));
    }
  }
}

export default onTurn;
