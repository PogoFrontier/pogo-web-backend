import { rooms } from "../matchhandling_server";
import { Actions } from "../types/actions";
import { OnActionProps } from "../types/handlers";
import { moves } from '../matchhandling_server';
import { Move, Player, RoomStatus, TurnAction } from "../types/room";
import { TeamMember } from "../types/team";

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
      let type = d[0];
      const index = parseInt(d[1])
      let move = type === Actions.CHARGE_ATTACK ? moves[pokemon.chargeMoves[index]] : moves[pokemon.fastMove]

      // Dismiss invalid inputs
      if (currentRoom.status === RoomStatus.FAINT && (pokemon.current?.hp !== 0 || type !== Actions.SWITCH)) {
        return;
      }
      if(type === Actions.SWITCH && isInvalidSwitch(d[1], currentRoom.status, player, pokemon)){
        return
      }

      let action: TurnAction = {
        id: type,
        active: type === Actions.SWITCH ? parseInt(d[1]) : player.current.active,
        string: data
      }
      if ((type === Actions.FAST_ATTACK || type === Actions.CHARGE_ATTACK) && move) {
        action.move = { ...move } as Move
      }

      if (player.current.action) {
        if (
          (!player.current.bufferedAction && type !== Actions.SWITCH)
          || (
            type === Actions.CHARGE_ATTACK
          )
          || (
            type === Actions.SWITCH
            && player.current.bufferedAction?.id !== Actions.SWITCH
            && player.current.action.id !== Actions.SWITCH
          )
        ) {
          player.current.bufferedAction = action
        }
      } else {
        player.current.action = action
      }
    }
  }
}

function isInvalidSwitch(index: string, status: RoomStatus, player: Player, pokemon: TeamMember): boolean {
  if (!["0", "1", "2"].includes(index)) {
    return true;
  }

  switch(status) {
    case RoomStatus.FAINT:
      return !!pokemon.current?.hp
    case RoomStatus.STARTED:
      return !!player.current?.switch
    default:
      return false
  }
}

export default onAction;