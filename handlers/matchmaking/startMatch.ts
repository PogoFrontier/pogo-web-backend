import { rooms } from "../../matchhandling_server";
import { pubClient, subClient } from "../../redis/clients";
import { Room, RoomStatus } from "../../types/room";
import { RuleDescription, parseToRule } from "../../types/rule";
import { User } from "../../types/user";
import {v4 as uuid } from "uuid";
import { setupRoom, useRoom } from "../../redis/rooms";
import endGame from "../endGame";
import { TeamMember } from "../../types/team";

function startMatch(format: RuleDescription, users: [User, User]) {
    const roomId = uuid();

    useRoom(roomId, (err, isNew) => {
        if (err) {
            console.error(err);
            return;
        }

        // Another battle with the new uuid exists? Impossible!
        if (!isNew) {
            console.error(`Battle with roomId ${roomId} already exists.`);
            return;
        }

        // Convert RuleDescription into Rule
        try{        
            format = parseToRule(format);
        } catch(e) {
            console.error(e);
            return;
        }

        // Create room
        let roomObj: Room = {
            id: roomId,
            players: [null, null],
            status: RoomStatus.SELECTING,
            subClient: subClient.duplicate(),
            reservedSeats: [users[0].socketId, users[1].socketId],
            format: format
        }
        rooms.set(roomId, roomObj);

        setupRoom(roomObj);

        // Notify players to join the room
        for (const user of users) {
            pubClient.publish("messagesToUser:" + user.socketId, "$PROMT_JOIN" + roomId);
        }

        // If one player doesn't make it in time, quit
        roomObj.joinTimeout = setTimeout(() => {
            // If both didn't make it, it's a tie
            if (roomObj.players[0] === null) {
                roomObj.players = [{
                    id: users[0].socketId,
                    team: Array<TeamMember>()
                },{
                    id: users[1].socketId,
                    team: Array<TeamMember>()
                }];

                endGame(roomId, false, "tie");

                //If one made it and the other not, we have a default winner
            } else if(roomObj.players[1] === null) {
                roomObj.players[1] = {
                    id: users.find(user => user.socketId !== roomObj.players[0]?.id)!.socketId,
                    team: Array<TeamMember>()
                }
                endGame(roomId, false, "p1");
            } else {
                // Nevermind, both players arrived. They can continue their battle
            }
        }, 15000);

        console.info(`Room ${roomId} has been created`);
    });

}

export default startMatch;