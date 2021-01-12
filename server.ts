import e from "express";
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import websocket from 'ws';
import c from 'cors';
import firebase from 'firebase-admin';
import SERVICE_ACCOUNT from './project-grookey-6a7326cb8d5a';
import onClose from "./handlers/onClose";
import onNewRoom from "./handlers/onNewRoom";
import { CODE } from "./types/actions";
import { Room, RoomStatus } from "./types/room";
import onGetOpponent from "./handlers/onGetOpponent";
import onTeamSubmit from "./handlers/onTeamSubmit";
import onReadyGame from "./handlers/onReadyGame";
import pokemonRoutes from "./api/pokemonRoutes";
import moveRoutes from "./api/moveRoutes";
import userRoutes from "./api/userRoutes";

import p from "./data/pokemon.json";
import m  from "./data/moves.json";
import r from "./data/rules.json";
import onAction from "./handlers/onAction";

export const pokemon: any = p;
export const moves: any = m;
export const rules: any = r;

export const SERVER_PORT = 3000;

export let onlineClients = new Map<string, WebSocket>();
export let rooms = new Map<string, Room>();

//initialize node server app
const app: e.Application = e();

//initialize firebase and firestore
const serviceAccount: any = SERVICE_ACCOUNT;
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount)
});
export const firestore = firebase.firestore();

//use json
app.use(e.json());

// use cors
const cors: any = c();
app.use(cors);

//add api routes as middleware
app.use('/api/pokemon', pokemonRoutes);
app.use('/api/moves', moveRoutes);
app.use('/api/users', userRoutes);

// serve static files from a given folder
app.use(e.static('public'));

function onNewWebsocketConnection(ws: WebSocket) {
    const id = uuidv4();
    onlineClients.set(id, ws);
    console.info(`Socket ${id} has connected.`);
    let room = "";
    ws.onmessage = function(this, ev) {
        const data: string = ev.data;
        if (data.startsWith("#")) {
            if (rooms.get(room) && rooms.get(room)?.status !== RoomStatus.SELECTING && rooms.get(room)?.status !== RoomStatus.STARTING) {
                onAction({ id, room, data });
            }
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
    // create http server and wrap the express app
    const server = http.createServer(app);

    // bind ws to that server
    const wss = new websocket.Server({ server });

    // will fire for every new websocket connection
    wss.on("connection", onNewWebsocketConnection);

    // important! must listen from `server`, not `app`, otherwise socket.io won't function correctly
    server.listen(process.env.PORT || SERVER_PORT, () => console.info(`Listening on port ${process.env.PORT || SERVER_PORT}.`));
}

startServer();
