import to from "../actions/to";
import { rooms } from "../matchhandling_server";
import { CODE } from "../types/actions";
import { OnTeamSubmitPayload } from "../types/handlers"; 
import { RoomStatus } from "../types/room";
import { startCountdown } from "./onReadyGame";

function onTeamSubmit(id: string, payload: OnTeamSubmitPayload) {
  const { room, indexes } = payload;
  if(!areIndexesValid) {
    console.error("Invalid team submit indexes: " + indexes.join(", "));
    return;
  }

  const currentRoom = rooms.get(room);
  if (currentRoom && currentRoom.status === RoomStatus.SELECTING) {
    const i = currentRoom.players.findIndex(x => x && x.id === id);
    let player = currentRoom.players[i];

    if (i > -1) {
      let currentTeam = [];
      for (const index of indexes) {

        let member = player?.team[index];
        if(!member) {
          console.error(`Team member at index ${index} not found`);
          return;
        }

        member.current = {
          hp: member.hp,
          atk: member.atk,
          def: member.def,
          status: [0, 0],
          energy: 0,
          damageDealt: 0,
          chargeMovesUsed: 0,
          timeSpendAlive: 0
        }
        currentTeam.push(member);
      }
      currentRoom.players[i]!.current = {
        team: currentTeam,
        ready: false,
        active: 0,
        switch: 0,
        shields: 2,
        remaining: 3,
      }

      console.info(`Player ${id} is ready in room ${room}.`);

      const j = i === 0 ? 1 : 0;
      if (currentRoom.players[j] && currentRoom.players[j]!.current) {
        currentRoom.status = RoomStatus.READY
        to(room, JSON.stringify({
            type: CODE.team_confirm,
        }));

        setTimeout(() => {
          if(currentRoom.status === RoomStatus.READY) {
              console.info(`Room ${room} is starting countdown`)
              currentRoom.status = RoomStatus.STARTING;
              startCountdown(room);
          }
        }, 10000)
        console.info(`Room ${room} will start.`);
      }
    }
  }
}

function areIndexesValid (indexes: number[]): boolean {
  // Are there duplicates? 
  if (new Set(indexes).size !== indexes.length){
    return false;
  }

  // Out of bounds?
  if(indexes.some(index => index < 0 && index > 5)) {
    return false;
  }

  // Right team length?
  if(indexes.length != 3) {
    return false;
  }

  return true;
}

export default onTeamSubmit;