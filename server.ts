
import e from "express";
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import websocket from 'ws';
import cors from 'cors';
import to from './actions/to'
import onClose from "./handlers/onClose";
import onNewRoom from "./handlers/onNewRoom";
import { CODE } from "./types/actions";
import { Room } from "./types/room";
import onGetOpponent from "./handlers/onGetOpponent";
import onTeamSubmit from "./handlers/onTeamSubmit";
import onReadyGame from "./handlers/onReadyGame";

import p from "./data/pokemon.json";
import m  from "./data/moves.json";

export const pokemon: any = p;
export const moves: any = m;

export const SERVER_PORT = 3000;

export let onlineClients = new Map<string, WebSocket>();
export let rooms = new Map<string, Room>();

function onNewWebsocketConnection(ws: WebSocket) {
    const id = uuidv4();
    onlineClients.set(id, ws);
    console.info(`Socket ${id} has connected.`);
    let room = "";
    ws.onmessage = function(this, ev) {
        const data: string = ev.data;
        if (data.startsWith("#") && room !== "") {
            to(room, data, id);
            // onAction(room, data, id);
        } else {
            const { type, payload } = JSON.parse(data)
            switch (type) {
                case CODE.room:
                    room = onNewRoom(id, payload);
                    break;
                case CODE.get_opponent:
                    onGetOpponent(id, payload);
                    break;
                case CODE.team_submit:
                    onTeamSubmit(id, payload);
                    break;
                case CODE.ready_game:
                    onReadyGame(id, payload);
                    break;
                default:
                    console.error("Message not recognized");
            }
        }
    };

    ws.onclose = () => {
        onClose(id, room)
    };
}

function startServer() {
    // create a new express app
    const app: e.Application = e();

    // create http server and wrap the express app
    const server = http.createServer(app);

    // bind ws to that server
    const wss = new websocket.Server({ server });

    // serve static files from a given folder
    app.use(e.static("public"));

    // use cors
    app.use(cors)

    // will fire for every new websocket connection
    wss.on("connection", onNewWebsocketConnection);

    // create pokemon path
    app.get("/pokemon/:id", (req, res) => {
        let payload;
        const arr = req.params.id.split(",");
        if (arr.length > 1) {
            payload = [];
            for (let r of arr) {
                if (pokemon[r] === undefined) {
                    throw new Error(`Could not find Pokemon of id: ${r}`);
                }
                payload.push(pokemon[r])
            }
        } else {
            if (pokemon[req.params.id] === undefined) {
                throw new Error(`Could not find Pokemon of id: ${req.params.id}`);
            }
            payload = pokemon[req.params.id];
        }
        res.send(payload);
    });

    // create moves path
    app.get("/moves/:id", (req, res) => {
        let payload;
        const arr = req.params.id.split(",");
        if (arr.length > 1) {
            payload = [];
            for (let r of arr) {
                if (moves[r] === undefined) {
                    throw new Error(`Could not find move of id: ${r}`);
                }
                payload.push(moves[r])
            }
        } else {
            if (moves[req.params.id] === undefined) {
                throw new Error(`Could not find move of id: ${req.params.id}`);
            }
            payload = moves[req.params.id];
        }
        res.send(payload);
    });

    // important! must listen from `server`, not `app`, otherwise socket.io won't function correctly
    server.listen(SERVER_PORT, () => console.info(`Listening on port ${SERVER_PORT}.`));
}

startServer();
