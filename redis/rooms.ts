import {storeClient, subClient} from './clients';
import {Room} from '../types/room';
import onAny from '../handlers/onAny';

export function useRoom(id: string, callback: (err: Error | null, isNew: boolean) => void) {
    // Set flag on redis that this room is used by this server
    // Setnx is multithread-proof. If two servers try this at the same time, only one will succeed
    storeClient.SETNX("room:" + id, "{}", (err, response) => {
        const itWorked = response === 1;
        callback(err, itWorked);
    })
}

type messageFormat = {
    sender: string,
    data: any
}

export function setupRoom(room: Room) {
    storeClient.SET("room:" + room.id, JSON.stringify({
        id: room.id,
        players: room.players,
        turn: room.turn,
        wait: room.wait,
        timer: room.timer,
        timerId: room.timerId,
        charge: room.charge
    }), (err) => {
        if (err) {
            console.error(err);
            return;
        }

        // Let redis destroy room after one hour. This is only neccessary if the server is restarted before the battle is finished.
        storeClient.expire("room:" + room.id, 60 * 60);
    });

    let subClient = room.subClient;

    // Messages from the clients are 
    subClient.on("message", (channel, message) => {
        const msgObj: messageFormat = JSON.parse(message);
        const id = msgObj.sender;
        let data = msgObj.data;
        if(!(typeof data === "string")) {
            data = JSON.stringify(data);
        }

        onAny(id, room.id, data);
    });

    subClient.subscribe("commands:" + room.id);
}