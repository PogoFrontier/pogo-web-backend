import { CHARGE_WAIT, GAME_TIME, SWITCH_WAIT, SWITCH_WAIT_LAST, maxBuffStages, buffDivisor } from "../config";
import { reduceTeamMemberForPlayer } from "../actions/reduceInformation"
import { pubClient } from "../redis/clients";
import { rooms } from "../matchhandling_server";
import { CODE } from "../types/actions";
import { OnChargeEndProps, ResolveTurnPayload } from "../types/handlers";
import { RoomStatus } from "../types/room";
import { calcDamage } from "../utils/damageUtils";
import endGame from "./endGame";

function getMessage(attacker: string, move: string, shield: number) {
  const shielded = shield === 0 ? "" : " It was shielded!";
  return `${attacker} used ${move}!${shielded}`;
}

function onChargeEnd({
  room, data
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
        player.current!.team[player.current!.active].current!.energy -= currentRoom.charge.move.energy
        let message = getMessage(player.current.team[player.current.active].speciesName, currentRoom.charge.move.name, currentRoom.charge.shield)
        // Apply buffs/debuffs
        const r = Math.random()
        if (currentRoom.charge.move.buffApplyChance && r <= parseFloat(currentRoom.charge.move.buffApplyChance)) {
          if (currentRoom.charge.move.buffTarget === "opponent") {
            // Atk
            opponent.current.team[opponent.current.active].current!.status[0] = currentRoom.charge.move.buffs![0] > 0
              ? Math.min(maxBuffStages, currentRoom.charge.move.buffs![0])
              : Math.max(-maxBuffStages, currentRoom.charge.move.buffs![0])
            const atkMult = opponent.current.team[opponent.current.active].current!.status[0] > 0
              ? (buffDivisor + opponent.current.team[opponent.current.active].current!.status[0]) / buffDivisor
              : buffDivisor / (buffDivisor - opponent.current.team[opponent.current.active].current!.status[0])
            opponent.current.team[opponent.current.active].current!.atk *= atkMult
            // Def
            opponent.current.team[opponent.current.active].current!.status[1] = currentRoom.charge.move.buffs![1] > 0
              ? Math.min(maxBuffStages, currentRoom.charge.move.buffs![1])
              : Math.max(-maxBuffStages, currentRoom.charge.move.buffs![1])
            const defMult = opponent.current.team[opponent.current.active].current!.status[1] > 0
              ? (buffDivisor + opponent.current.team[opponent.current.active].current!.status[1]) / buffDivisor
              : buffDivisor / (buffDivisor - opponent.current.team[opponent.current.active].current!.status[1])
            opponent.current.team[opponent.current.active].current!.def *= defMult
            // Change message
            message = `${message} ${opponent.current!.team[opponent.current!.active].speciesName}'s stats were changed.`
          } else if (currentRoom.charge.move.buffTarget === "self") {
            // Atk
            player.current.team[player.current.active].current!.status[0] = currentRoom.charge.move.buffs![0] > 0
              ? Math.min(maxBuffStages, currentRoom.charge.move.buffs![0])
              : Math.max(-maxBuffStages, currentRoom.charge.move.buffs![0])
            const atkMult = player.current.team[player.current.active].current!.status[0] > 0
              ? (buffDivisor + player.current.team[player.current.active].current!.status[0]) / buffDivisor
              : buffDivisor / (buffDivisor - player.current.team[player.current.active].current!.status[0])
            player.current.team[player.current.active].current!.atk *= atkMult
            // Def
            player.current.team[player.current.active].current!.status[1] = currentRoom.charge.move.buffs![1] > 0
              ? Math.min(maxBuffStages, currentRoom.charge.move.buffs![1])
              : Math.max(-maxBuffStages, currentRoom.charge.move.buffs![1])
            const defMult = player.current.team[player.current.active].current!.status[1] > 0
              ? (buffDivisor + player.current.team[player.current.active].current!.status[1]) / buffDivisor
              : buffDivisor / (buffDivisor - player.current.team[player.current.active].current!.status[1])
            player.current.team[player.current.active].current!.def *= defMult
            // Change message
            message = `${message} ${player.current!.team[player.current!.active].speciesName}'s stats were changed.`
          }
        }
        const time = Math.ceil(Number((GAME_TIME - currentRoom.turn! * 0.5).toFixed(1)))
        const targetPokemon = opponent.current!.team[opponent.current!.active]
        const payload: ResolveTurnPayload = {
          time,
          update: [
            {
              id: player.id,
              active: player.current.active,
              energy: player.current!.team[player.current!.active].current!.energy,
              wait: -1,
              message
            },
            {
              id: opponent.id,
              active: opponent.current.active,
              hp: targetPokemon.current!.hp / targetPokemon.hp,
              wait: -1,
              message
            }
          ],
          team: player.current.team.map(reduceTeamMemberForPlayer),
          turn: currentRoom.turn!,
          switch: player.current.switch
        };
        if (currentRoom.charge.shield) {
          opponent.current.shields -= 1;
          payload.update[1]!.shields = opponent.current.shields;
        }
        if (opponent.current!.team[opponent.current!.active].current!.hp <= 0) {
          opponent.current!.remaining -= 1;
          payload.update[1]!.remaining = opponent.current!.remaining;
          if (opponent.current!.remaining <= 0) {
            endGame(room);
          } else if (currentRoom.status !== RoomStatus.FAINT) {
            currentRoom.status = RoomStatus.FAINT;
            currentRoom.wait = (opponent.current!.remaining === 1) ? SWITCH_WAIT_LAST : SWITCH_WAIT;
            payload.update[0]!.wait = currentRoom.wait;
            payload.update[1]!.wait = currentRoom.wait;
            payload.update[1]!.remaining = opponent.current!.remaining;
          }
        } else if (currentRoom.charge.cmp) {
          currentRoom.status = RoomStatus.CHARGE;
          currentRoom.wait = CHARGE_WAIT;
          payload.update[0]!.wait = CHARGE_WAIT;
          payload.update[0]!.charge = 2;
          payload.update[1]!.wait = CHARGE_WAIT;
          payload.update[1]!.charge = 1;
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
            switch: opponent.current.switch,
            turn: currentRoom.turn!
          }
        }
        delete currentRoom.players[i]!.current!.bufferedAction;
        delete currentRoom.players[i]!.current!.action;
        pubClient.publish("messagesToUser:" + player.id, JSON.stringify(dta));
        pubClient.publish("messagesToUser:" + opponent.id, JSON.stringify(dta1));
        if (currentRoom.status === RoomStatus.LISTENING) {
          currentRoom.status = RoomStatus.STARTED
        }
      }
    }
  }
}

export default onChargeEnd;
