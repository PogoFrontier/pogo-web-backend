import { GAME_TIME, ANIMATING_WAIT, maxBuffStages, buffDivisor } from "../config";
import { reduceTeamMemberForPlayer } from "../actions/reduceInformation"
import { pubClient } from "../redis/clients";
import { rooms } from "../matchhandling_server";
import { CODE } from "../types/actions";
import { ResolveTurnPayload } from "../types/handlers";
import { RoomStatus } from "../types/room";
import { calcDamage } from "../utils/damageUtils";
import onChargeAnimationEnd from "./onChargeAnimationEnd"

function getMessage(attacker: string | object, move: string, shield: number) {
  const shielded = shield === 0 ? "" : " It was shielded!";
  return `${attacker} used ${move}!${shielded}`;
}

function onChargeEnd(room: string) {
  const currentRoom = rooms.get(room);
  if (currentRoom && currentRoom.charge) {
    if(currentRoom.charge.shield === undefined) {
      currentRoom.charge.shield = 0
    }
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
        player.current!.team[player.current!.active].current!.chargeMovesUsed++
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
        console.log("target pokémon hp: " + (targetPokemon.current!.hp / targetPokemon.hp))

        if (currentRoom.charge.shield) {
          opponent.current.shields -= 1;
          payload.update[1]!.shields = opponent.current.shields;
        }

        if (targetPokemon.current && targetPokemon.current.hp <= 0) {
          opponent.current!.remaining -= 1;
          payload.update[1]!.remaining = opponent.current!.remaining;
          targetPokemon.current.timeSpendAlive += new Date().getTime() - targetPokemon.current.switchedIn!.getTime()
          delete targetPokemon.current.switchedIn
          payload.update[1]!.remaining = opponent.current!.remaining;
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

        currentRoom.status = RoomStatus.ANIMATING
        setTimeout(() => onChargeAnimationEnd(currentRoom.id), ANIMATING_WAIT * 1000)
      }
  }
}

export default onChargeEnd;
