import { CHARGE_WAIT, GAME_TIME, SWITCH_WAIT } from "../config";
import { onlineClients, rooms } from "../server";
import { CODE } from "../types/actions";
import { OnChargeEndProps, ResolveTurnPayload } from "../types/handlers";
import { RoomStatus } from "../types/room";
import { calcDamage } from "../utils/damageUtils";
import endGame from "./endGame";

function onChargeEnd({
  id, room, data
}: OnChargeEndProps) {
  const type = data[1];
  const value = Number(data.substring(2));
  const currentRoom = rooms.get(room);
  if (currentRoom && currentRoom.charge) {
    switch (type) {
      case "s":
        currentRoom.charge.shield = value;
        break;
      case "c":
        currentRoom.charge.multiplier = value;
        break;
      default:
        console.error("Invalid code of " + data);
        break;
    }
    if (currentRoom.charge.shield !== undefined && currentRoom.charge.multiplier !== undefined) {
      const i = currentRoom.charge.subject;
      const j = i === 0 ? 1 : 0;
      const player = currentRoom.players[i];
      const opponent = currentRoom.players[j];
      if (player && opponent && player.current && opponent.current) {
        opponent.current!.team[opponent.current!.active].current!.hp = currentRoom.charge.shield === 0
        ? calcDamage(
          player.current.team[player.current.active],
          opponent.current!.team[opponent.current!.active],
          currentRoom.charge.move,
          currentRoom.charge.multiplier
        )
        : opponent.current!.team[opponent.current!.active].current!.hp - 1;
        if (currentRoom.charge.shield) {
          opponent.current.shields -= 1;
        }
        player.current!.team[player.current!.active].current!.energy -= currentRoom.charge.move.energy
        const time = Math.ceil(Number((GAME_TIME - currentRoom.turn! * 0.5).toFixed(1)))
        const payload: ResolveTurnPayload = {
          time,
          update: [
            {
              id: player.id,
              active: player.current.active,
              energy: player.current!.team[player.current!.active].current!.energy,
              wait: -1
            },
            {
              id: opponent.id,
              active: opponent.current.active,
              hp: opponent.current!.team[opponent.current!.active].current!.hp,
              shields: opponent.current.shields,
              wait: -1
            }
          ],
          switch: player.current.switch
        };
        if (opponent.current!.team[opponent.current!.active].current!.hp <= 0) {
          opponent.current!.remaining -= 1;
          if (opponent.current!.remaining <= 0) {
            endGame(room);
          } else if (currentRoom.status !== RoomStatus.FAINT) {
            currentRoom.status = RoomStatus.FAINT;
            currentRoom.wait = SWITCH_WAIT;
            payload.update[i]!.wait = SWITCH_WAIT;
            payload.update[j]!.wait = SWITCH_WAIT;
            payload.update[j]!.remaining = opponent.current.remaining;
          }
          payload.update[j]!.remaining = opponent.current!.remaining;
        } else if (currentRoom.charge.cmp) {
          currentRoom.status = RoomStatus.CHARGE;
          currentRoom.wait = CHARGE_WAIT;
          payload.update[i]!.wait = CHARGE_WAIT;
          payload.update[i]!.charge = 2;
          payload.update[j]!.wait = CHARGE_WAIT;
          payload.update[j]!.charge = 1;
          currentRoom.charge = {
            subject: j,
            move: currentRoom.charge.cmp
          };
        }
        const dta = {
          type: CODE.turn,
          payload
        }
        const dta1 = {
          type: CODE.turn,
          payload: {
            time: payload.time,
            update: [payload.update[1], payload.update[0]],
            switch: opponent.current.switch
          }
        }
        onlineClients.get(player.id)!.send(JSON.stringify(dta));
        onlineClients.get(opponent.id)!.send(JSON.stringify(dta1));
        if (currentRoom.status === RoomStatus.LISTENING) {
          currentRoom.status = RoomStatus.STARTED
        }
      }
    }
  }
}

export default onChargeEnd;
