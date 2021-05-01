import { reduceActionForOpponent } from "../actions/reduceInformation";
import { rooms } from "../matchhandling_server";
import { Actions } from "../types/actions";
import { OnActionProps } from "../types/handlers";
import { moves } from '../matchhandling_server';
import { Move, RoomStatus } from "../types/room";
import { pubClient } from "../redis/clients";

type Action = typeof Actions[keyof typeof Actions]

function onAction({
  id, room, data
}: OnActionProps) {
  const currentRoom = rooms.get(room);
  if (currentRoom) {
    const i = currentRoom.players.findIndex(x => x && x.id === id);
    const player = currentRoom.players[i];
    if (player && player.current) {
      const pokemon = player!.current!.team[player!.current!.active]
      const d: [Action, string] = data.substring(1).split(":") as [Action, string];
      const type = d[0];
      if (currentRoom.status === RoomStatus.FAINT && type !== Actions.SWITCH) {
        return;
      }
      const index = parseInt(d[1])
      const move = type === Actions.CHARGE_ATTACK ? moves[pokemon.chargeMoves[index]] : moves[pokemon.fastMove]
      const energy = player.current.team[player.current.active].current?.energy || 0
      if (type === Actions.CHARGE_ATTACK && move.energy > energy) {
        return;
      }
      if (player.current.action) {
        if (player.current.action.string?.startsWith(`#${Actions.CHARGE_ATTACK}`) || type === Actions.FAST_ATTACK) {
          return;
        }
        if (
          !player.current.bufferedAction
          || (player.current.bufferedAction
            && (
              (
                type === Actions.CHARGE_ATTACK
                && player.current.bufferedAction.string?.startsWith(Actions.FAST_ATTACK)
              )
              || (
                type === Actions.SWITCH
                && !player.current.bufferedAction.string?.startsWith(Actions.SWITCH)
              )
            )
          )
        ) {
          player.current.bufferedAction = {
            id: type,
            active: type === Actions.SWITCH ? parseInt(d[1]) : player.current.active,
            string: data
          }
          if ((type === Actions.CHARGE_ATTACK) && move) {
            player.current.bufferedAction.move = { ...move } as Move
          }
        }
      } else {
        player.current.action = {
          id: type,
          active: type === Actions.SWITCH ? parseInt(d[1]) : player.current.active,
          string: data
        }
        if ((type === Actions.FAST_ATTACK || type === Actions.CHARGE_ATTACK) && move) {
          player.current.action.move = { ...move } as Move
        }
        const j = i === 0 ? 1 : 0;
        const opponent = currentRoom.players[j];
        if (opponent) {
          pubClient.publish("messagesToUser:" + opponent.id, reduceActionForOpponent(data, player.current.team, move, currentRoom.turn ? currentRoom.turn : 0))
        }
      }
    }
  }
}

export default onAction;