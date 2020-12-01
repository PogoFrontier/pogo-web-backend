
const e = require("express");
const { v4: uuidv4 } = require('uuid');
const
    http = require("http"),
    express = require("express"),
    WebSocket = require('ws'),
    cors = require("cors"),
    pokemon = require("./data/pokemon.json"),
    moves = require("./data/moves.json");

const SERVER_PORT = 3000;

let onlineClients = new Map();
let rooms = new Map();

const codes = {
    room: "ROOM",
    get_opponent: "GET_OPPONENT",
    room_leave: "ROOM_LEAVE",
    room_join: "ROOM_JOIN",
    team_submit: "TEAM_SUBMIT",
    team_confirm: "TEAM_CONFIRM",
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function to(room, data, id) {
    if (rooms.get(room)) {
        for (player of rooms.get(room).players) {
            if (player.id !== id) {
                onlineClients.get(player.id).send(data)
            }
        }
    }
}

function onNewRoom(ws, id, payload) {
    const {room, team} = payload;

    const player = {id, team}
    if (!rooms.get(room)) {
        rooms.set(room, {
            id: room,
            players: [player, {}]
        });
        console.info(`Socket ${id} has joined ${room}.`);
    } else if (isEmpty(rooms.get(room).players[1])) {
        rooms.get(room).players[1] = player
        to(room, JSON.stringify({
            type: codes.room_join,
            payload: { team }
        }, id))
        console.info(`Socket ${id} has joined ${room}.`);
    } else if (isEmpty(rooms.get(room).players[0])) {
        rooms.get(room).players[0] = player
        to(room, JSON.stringify({
            type: codes.room_join,
            payload: { team }
        }, id))
        console.info(`Socket ${id} has joined ${room}.`);
    } else {
        console.error(`Room ${room} is full.`);
    }

    ws.on("disconnect", () => {
        onlineClients.delete(id);
        if (rooms.get(room)) {
            if (rooms.get(room).players) {
                const index = rooms.get(room).players.findIndex(x => x.id === id)
                rooms.get(room).players[index] = {}
                to(room, JSON.stringify({
                    type: codes.room_leave,
                }), null);
            }

            if (isEmpty(rooms.get(room).players[1]) && isEmpty(rooms.get(room).players[0])) {
                rooms.delete(room);
            }
        }

        console.info(`Socket ${id} has disconnected.`);
    });
}

function onGetOpponent(id, payload) {
    const { room } = payload;
    if (rooms.get(room)) {
        const opp = rooms.get(room).players.find((x) => (x.id) && (x.id !== id))
        if (opp) {
            to(room, JSON.stringify({
                type: codes.room_join,
                payload: { team: opp.team }
            }, id))
        } else {
            console.error("No opponent found");
        }
    }
}

function onTeamSubmit(id, payload) {
    const {room, team} = payload;

    if (rooms.get(room)) {
        const i = rooms.get(room).players.findIndex(x => x.id === id);
        let currentTeam = [];
        for (let member of team) {
            currentTeam.push({
                ...member,
                current: {
                    hp: member.hp,
                    atk: member.atk,
                    def: member.def,
                    status: [0, 0]
                }
            });
        }

        rooms.get(room).players[i].current = {
            team: currentTeam
        }

        console.info(`Player ${id} is ready in room ${room}.`);
        const j = i === 0 ? 1 : 0;

        if (rooms.get(room).players[j].current) {
            to(room, JSON.stringify({
                type: codes.team_confirm,
            }), null);
            console.info(`Room ${room} will start.`);
        }
    }
}

function onNewWebsocketConnection(ws) {
    const id = uuidv4();
    onlineClients.set(id, ws);
    console.info(`Socket ${id} has connected.`);
    ws.send("MEOW")
    ws.on('message', function(data) {
        const { type, payload } = JSON.parse(data)
        console.log(type)
        switch (type) {
            case codes.room:
                onNewRoom(ws, id, payload);
                break;
            case codes.get_opponent:
                onGetOpponent(id, payload);
                break;
            case codes.team_submit:
                onTeamSubmit(id, payload)
                break;
            default:
                console.error("Message not recognized")
        }
    });
}

function startServer() {
    // create a new express app
    const app = express();

    // create http server and wrap the express app
    const server = http.createServer(app);

    // bind ws to that server
    const wss = new WebSocket.Server({ server });

    // serve static files from a given folder
    app.use(express.static("public"));

    // use cors
    app.use(cors())

    // will fire for every new websocket connection
    wss.on("connection", onNewWebsocketConnection);

    // create pokemon path
    app.get("/pokemon/:id", (req, res) => {
        let payload;
        const arr = req.params.id.split(",");
        if (arr.length > 1) {
            payload = [];
            for (r of arr) {
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
            for (r of arr) {
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
