import e from "express";
import http from 'http';
import websocket from 'ws';
import c from 'cors';
import deepEqual from "deep-equal";
import quitAll from "./handlers/matchmaking/quitAll";
import quitAllChallenges from "./handlers/challenges/quitAll"
import onNewRoom from "./handlers/onNewRoom";
import { CODE } from "./types/actions";
import { Room } from "./types/room";
import { Rule } from "./types/rule";
import { User } from "./types/user";
import m  from "./data/moves.json";
import r from "./data/rules.json";
import onMatchmakingQuit from "./handlers/matchmaking/quit";
import onMatchmakingSearchBattle from "./handlers/matchmaking/searchBattle";
import { pubClient, subClient, storeClient } from "./redis/clients";
import { checkToken } from "./actions/api_utils";
import openChallenge from "./handlers/challenges/open";
import quitChallenge from "./handlers/challenges/quit";
import decline from "./handlers/challenges/decline";
import accept from "./handlers/challenges/accept";
import getAll from "./handlers/challenges/getAll";
import startMatchChecking from "./handlers/matchmaking/matchChecker"
import { v4 as uuid } from "uuid"
import { getUserStatusKey } from "./redis/getKey";
import { firestore } from "./firestore/firestore";
startMatchChecking()

export const moves: any = m;
export const rules: any = r;

export const SERVER_PORT = 8088;

export let rooms = new Map<string, Room>();

//initialize node server app
const app: e.Application = e();

const ping = '{"kind":"ping"}';
const pong = '{"kind":"pong"}';

//use json
app.use(e.json());

// use cors
const cors: any = c();
app.use(cors);

function onNewWebsocketConnection(ws: WebSocket, req: Request) {
    let room = "";
    let formatsUsedForMatchmaking = Array<Rule>();
    let user: User | null = null

    const subClientForWS = subClient.duplicate();

    subClientForWS.on("message", (chan, msg) => {
        if(user && !user.isGuest && isEnd(msg)) {
            storeClient.set(getUserStatusKey(user.googleId), "idle")
        } 
        ws.send(msg);
    });

    ws.onmessage = function(this, ev) {
        const data: string = ev.data;

        if (data === ping) {
            ws.send(pong);
        } else if (isAuthentication(data)) {
            if (user) {
                return;
            }
            const { asGuestUser, token } = JSON.parse(data)

            if(asGuestUser || !token) {
                user = {
                    googleId: uuid(),
                    isGuest: true,
                    ranking: 1000
                }
                subClientForWS.subscribe("messagesToUser:" + user.googleId);
                ws.send(`$Authentication Success. Id: ${user.googleId}`)
                return;
            }
            
            checkToken(token, (userParam) => {
                user = userParam;

                // Now that we have the userId we can listen to messages
                subClientForWS.subscribe("messagesToUser:" + user.googleId);
                ws.send("$Authentication Success")

                storeClient.set(getUserStatusKey(user.googleId), "idle")

                // Check for challenges
                getAll(user.googleId)
            }, () => {
                ws.send("$Authentication Failed")
            })
        } else if (!user) {
            return;

        } else if (isNewRoom(data)) {
            const { payload } = JSON.parse(data)

            onNewRoom(user.googleId, payload, roomId => {
                room = roomId;
            });
        } else if (isAboutDirectChallenges(data)) {

            //Guest users can't challenge directly
            if(user.isGuest) {
                return;
            }

            const { type, payload } = JSON.parse(data)

            switch (type) {
                case CODE.challenge_open:
                    openChallenge(user.googleId, payload)
                    break;
                case CODE.challenge_quit:
                    quitChallenge(user.googleId, payload)
                    break;
                case CODE.challenge_decline:
                    decline(user.googleId, payload)
                    break;
                case CODE.challenge_accept:
                    accept(user.googleId, payload)
                    break;
                default:
                    console.error(`Message not recognized: ${data}`);
            }

        } else if (isMatchmaking(data)) {
            const { type, payload } = JSON.parse(data)

            room = "";
            switch (type) {
                case CODE.matchmaking_search_battle:
                    if (!formatsUsedForMatchmaking.find(item => deepEqual(payload.format, item))) {
                        formatsUsedForMatchmaking.push(payload.format);
                    }
                    if(!user.isGuest) {
                        storeClient.set(getUserStatusKey(user.googleId), "in matchmaking")
                    }
                    onMatchmakingSearchBattle(user, payload);
                    break;
                case CODE.matchmaking_quit:
                    if (!user.isGuest) {
                        storeClient.set(getUserStatusKey(user.googleId), "idle")
                    }
                    onMatchmakingQuit(user, payload);
                    break;
                default:
                    console.error(`Message not recognized: ${data}`);
            }

        } else{
            if (!user.isGuest && isJoin(data)) {
                storeClient.set(getUserStatusKey(user.googleId), "battling")
            }

            // Publish on redis so the host of this room receives this
            const publication = {
                sender: user.googleId,
                data: data
            };
            pubClient.publish("commands:" + room, JSON.stringify(publication), (err, reply) => {
                if (err) {
                    console.error(err);
                }

                if (reply !== 1) {
                    console.error(`Unexpected number of subscribers received this command to room ${room}. Should be 1, but actually: ${reply}`);
                }
            })
        }
    };

    ws.onclose = () => {
        subClientForWS.unsubscribe();
        subClientForWS.quit();

        if (user) {
            pubClient.publish("commands:" + room, JSON.stringify({
                sender: user.googleId,
                data: {
                    type: CODE.close,
                    payload: {
                        room: room
                    }
                }
            }));

            quitAll(user, formatsUsedForMatchmaking);
            quitAllChallenges(user.googleId)

            if(!user.isGuest) {
                storeClient.del(getUserStatusKey(user.googleId))

                const docRef = firestore.collection('users').doc(user.googleId);
                docRef.update({ lastActivity: new Date() }).catch(err => {
                    console.error(err);
                });
            }
        }
    };
}

function startServer() {
    // create http server and wrap the express app
    const server = http.createServer(app);

    // bind ws to that server
    const wss = new websocket.Server({ server });

    // will fire for every new websocket connection
    wss.on("connection", onNewWebsocketConnection);

    // important! must listen from `server`, not `app`, otherwise socket.io won't function correctly
    server.listen(SERVER_PORT, () => console.info(`Listening on port ${SERVER_PORT}.`));

    // Disable both timeouts
    server.keepAliveTimeout = 0;
    server.headersTimeout = 0;
}

function isNewRoom(data: string): boolean {
    try {
        const { type } = JSON.parse(data);
        return type === CODE.room;
    } catch (e) {
        return false;
    }
}

function isAuthentication(data: string): boolean {
    try {
        const { type } = JSON.parse(data);
        return type === CODE.authentication;
    } catch (e) {
        return false;
    }
}

function isAboutDirectChallenges(data: string): boolean {
    try {
        const { type } = JSON.parse(data);
        return typeof type === "string" && type.startsWith("CHALLENGE_");
    } catch (e) {
        return false;
    }
}

function isMatchmaking(data: string): boolean {
    try {
        const { type } = JSON.parse(data);
        return typeof type === "string" && type.startsWith("MATCHMAKING_");
    } catch (e) {
        return false;
    }
}

function isJoin(data: string): boolean {
    try {
        const { type } = JSON.parse(data);
        return type === CODE.room_join;
    } catch (e) {
        return false;
    }
}

function isEnd(data: string): boolean {
    return data.endsWith("$end")
}

startServer();
