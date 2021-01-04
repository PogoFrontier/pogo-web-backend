import to from "../actions/to";
import { rooms } from "../server";
import { CODE } from "../types/actions";
import { OnTeamSubmitPayload } from "../types/handlers"; 

function onTeamSubmit(id: string, payload: OnTeamSubmitPayload) {
  const { room, team } = payload;
  const currentRoom = rooms.get(room);
  if (currentRoom) {
    const i = currentRoom.players.findIndex(x => x && x.id === id);
    if (i > -1) {
      let currentTeam = [];
      for (const member of team) {
        member.current = {
          hp: member.hp,
          atk: member.atk,
          def: member.def,
          status: [0, 0]
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
        to(room, JSON.stringify({
            type: CODE.team_confirm,
        }));
        console.info(`Room ${room} will start.`);
      }
    }
  }
}

export default onTeamSubmit;