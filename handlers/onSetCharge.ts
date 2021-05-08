import { OnChargeEndProps } from "../types/handlers";
import { rooms } from "../matchhandling_server";

export default function onSetCharge({
  id, room, data
  }: OnChargeEndProps) {
  const type = data[1];
  const value = Number(data.substring(2));
  const currentRoom = rooms.get(room);
  const chargerIndex = currentRoom?.charge?.subject !== undefined ? currentRoom.charge.subject : -1
  const chargerPlayer = currentRoom?.players[chargerIndex]
  const shielderPlayer = currentRoom?.players[[1, 0][chargerIndex]]

  if (currentRoom && currentRoom.charge) {
    switch (type) {
      case "s":
        if(id === shielderPlayer?.id){
          currentRoom.charge.shield = value;
        }
        break;
      case "c":
        if(id === chargerPlayer?.id){
          currentRoom.charge.multiplier = Math.max(Math.min(value, 1), 0.25);
        }
        break;
      default:
        console.error("Invalid code of " + data);
        break;
    }
  }
}