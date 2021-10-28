import { rooms } from "../../matchhandling_server";
import { pubClient, subClient } from "../../redis/clients";
import { Room, RoomStatus } from "../../types/room";
import { RuleDescription } from "../../types/rule";
import {v4 as uuid } from "uuid";
import { setupRoom, useRoom } from "../../redis/rooms";
import endGame from "../endGame";
import { TeamMember } from "../../types/team";
import { User } from "../../types/user";
import { parseToRule } from "../../actions/parseToRule";
import { firestore } from "../../firestore/firestore";

function startMatch(format: RuleDescription, users: [User, User], rated: boolean) {
    const roomId = uuid();

    useRoom(roomId, async (err, isNew) => {
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
        const formatName = typeof format === "string" ? format : undefined
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
            reservedSeats: users.map(user => user.googleId) as [string, string],
            format: format,
            formatName: formatName,
            rated: rated
        }
        rooms.set(roomId, roomObj);

        setupRoom(roomObj);

        // Notify players to join the room
        for (const user of users) {
            pubClient.publish("messagesToUser:" + user.googleId, "$PROMT_JOIN" + roomId);
        }

        // Save each opponent to battle history
        try {
            await firestore.runTransaction(async t => {
                const battleHistories: [any, any] = [null, null]
                for(const i in users) {
                    const u = users[i]
                    if (u.isGuest) {
                        continue
                    }

                    // Get user from database
                    const docRef = firestore.collection('users').doc(u.googleId);
                    const user = await t.get(docRef)
                    const userData = user.data()
                    if (!userData) {
                        return
                    }

                    // Save opponent to battle history
                    let battleHistory: Array<User> = userData.battleHistory
                    if (!battleHistory) {
                        battleHistory = []
                    }
                    if (battleHistory.length > 19) {
                        battleHistory.pop()
                    }
                    const opponent = users[[1, 0][i]]
                    battleHistory.push({
                        googleId: opponent.googleId,
                        isGuest: !!opponent.isGuest,
                        username: opponent.username,
                    })
                    battleHistories[i] = battleHistory
                }
                
                for (const i in users) {
                    const u = users[i]
                    if (u.isGuest) {
                        continue
                    }
                    const docRef = firestore.collection('users').doc(u.googleId);
                    t.update(docRef, { battleHistory: battleHistories[i] })
                }
            })
        } catch (e) {
            console.error(e)
        }

        // If one player doesn't make it in time, quit
        roomObj.timeout = setTimeout(() => {
            // If both didn't make it, it's a tie
            if (roomObj.players[0] === null) {
                roomObj.players = [{
                    id: users[0].googleId,
                    isGuest: !!users[0].isGuest,
                    username: (users[0].isGuest || !users[0].username) ? "Guest" : users[0].username,
                    team: Array<TeamMember>()
                }, {
                    id: users[1].googleId,
                    isGuest: !!users[0].isGuest,
                    username: (users[1].isGuest || !users[1].username) ? "Guest" : users[1].username,
                    team: Array<TeamMember>()
                }];

                endGame(roomId, false, "tie");

                //If one made it and the other not, we have a default winner
            } else if(roomObj.players[1] === null) {
                const missingPlayer = users.find(user => user.googleId !== roomObj.players[0]?.id)!
                roomObj.players[1] = {
                    id: missingPlayer.googleId,
                    isGuest: !!users[0].isGuest,
                    username: (missingPlayer.isGuest || !missingPlayer.username) ? "Guest" : missingPlayer.username,
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