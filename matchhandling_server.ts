import e from "express";
import http from 'http';
import websocket from 'ws';
import c from 'cors';
import deepEqual from "deep-equal";
import quitAll from "./handlers/matchmaking/quitAll";
import onNewRoom from "./handlers/onNewRoom";
import { CODE } from "./types/actions";
import { Room } from "./types/room";
import { Rule } from "./types/rule";
import { User } from "./types/user";
import m  from "./data/moves.json";
import r from "./data/rules.json";
import onMatchmakingQuit from "./handlers/matchmaking/quit";
import onMatchmakingSearchBattle from "./handlers/matchmaking/searchBattle";
import { pubClient, subClient } from "./redis/clients";

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
    const id = req.url.substring(1);
    console.info(`Socket ${id} has connected.`);
    let room = "";
    let formatsUsedForMatchmaking = Array<Rule>();
    let user: User = {
        socketId: id
    }

    const subClientForWS = subClient.duplicate();

    subClientForWS.on("message", (chan, msg) => {
        ws.send(msg);
    });
    subClientForWS.subscribe("messagesToUser:" + id);

    ws.onmessage = function(this, ev) {
        const data: string = ev.data;

        if (data === ping) {
            ws.send(pong);
        } else if (isNewRoom(data)) {
            const { type, payload } = JSON.parse(data)

            onNewRoom(id, payload, roomId => {
                room = roomId;
            });
        } else if (isMatchmaking(data)) {
            const { type, payload } = JSON.parse(data)

            room = "";
            switch (type) {
                case CODE.matchmaking_search_battle:
                    if (!formatsUsedForMatchmaking.find(item => deepEqual(payload.format, item))) {
                        formatsUsedForMatchmaking.push(payload.format);
                    }
                    onMatchmakingSearchBattle(user, payload);
                    break;
                case CODE.matchmaking_quit:
                    onMatchmakingQuit(user, payload);
                    break;
                default:
                    console.error(`Message not recognized: ${data}`);
            }

        } else{
            // Publish on redis so the host of this room receives this
            const publication = {
                sender: id,
                data: data
            };
            pubClient.publish("commands:" + room, JSON.stringify(publication), (err, reply) => {
                if (err) {
                    console.error();
                }

                if (reply !== 1) {
                    console.error("Unexpected number of subscribers received this command. Should be 1, but actually: " + reply);
                }
            })
        }
    };

    ws.onclose = () => {
        subClientForWS.unsubscribe();
        pubClient.publish("commands:" + room, JSON.stringify({
            sender: id,
            data: {
                type: CODE.close,
                payload: {
                    room: room
                }
            }
        }));
        quitAll(user, formatsUsedForMatchmaking);
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
}

function isNewRoom(data: string): boolean {
    try{
        const { type } = JSON.parse(data);
        return type === CODE.room;
    } catch(e) {
        return false;
    }
}

function isMatchmaking(data: string): boolean {
    try{
        const { type } = JSON.parse(data);
        return typeof type === "string" && type.startsWith("MATCHMAKING_");
    } catch(e) {
        return false;
    }
}

startServer();
