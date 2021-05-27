import { CHARGE_WAIT, GAME_TIME, SWITCH_WAIT, SWITCH_WAIT_LAST, maxBuffStages, buffDivisor } from "../config";
import { reduceTeamMemberForPlayer } from "../actions/reduceInformation"
import { pubClient } from "../redis/clients";
import { rooms } from "../matchhandling_server";
import { CODE } from "../types/actions";
import { ResolveTurnPayload } from "../types/handlers";
import { RoomStatus } from "../types/room";
import onFaint from "./onFaint";

function onChargeAnimationEnd(room: string) {
  const currentRoom = rooms.get(room);
  if (currentRoom?.charge) {
      const i = currentRoom.charge.subject;
      const j = i === 0 ? 1 : 0;
      const player = currentRoom.players[i];
      const opponent = currentRoom.players[j];
      if (player && opponent && player.current && opponent.current) {
        const time = Math.ceil(Number((GAME_TIME - currentRoom.turn! * 0.5).toFixed(1)))
        const targetPokemon = opponent.current!.team[opponent.current!.active]
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
              hp: targetPokemon.current!.hp / targetPokemon.hp,
              wait: -1
            }
          ],
          team: player.current.team.map(reduceTeamMemberForPlayer),
          turn: currentRoom.turn!,
          switch: player.current.switch
        };
        if (targetPokemon.current && targetPokemon.current.hp <= 0) {
          payload.update[1]!.remaining = opponent.current!.remaining;
          onFaint(room)
          return
        }

        if (currentRoom.charge.cmp) {
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
        } else {
          currentRoom.status = RoomStatus.STARTED
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
      }
  }
}

export default onChargeAnimationEnd;
