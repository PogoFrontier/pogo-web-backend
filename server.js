
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
    ready_game: 'READY_GAME',
    game_check: 'GAME_CHECK',
    game_start: 'GAME_START',
    turn: 'TURN'
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

function onNewRoom(id, room, team) {
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
            team: currentTeam,
            ready: false
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

function onReadyGame(id, payload) {
    const { room } = payload;

    if (rooms.get(room)) {
        const i = rooms.get(room).players.findIndex(x => x.id === id);
        rooms.get(room).players[i].current.ready = true;

        const j = i === 0 ? 1 : 0;
        if (rooms.get(room).players[j].current.ready) {
            console.info(`Room ${room} is starting countdown`)
            startCountdown(room);
        }
    }
}

function startCountdown(room) {
    let countdown = 0;
    const x = setInterval(() => {
        countdown++;
        if (countdown === 4) {
            to(room, JSON.stringify({
                type: codes.game_start
            }))
            clearInterval(x);
            startGame(room);
        } else {
            for (let i = 0; i < rooms.get(room).players.length; i++) {
                const player = rooms.get(room).players[i];
                const j = i === 0 ? 1 : 0;
                const opponent = rooms.get(room).players[j];
                onlineClients.get(player.id).send(JSON.stringify({
                    type: codes.game_check,
                    payload: {
                        countdown,
                        team: player.current.team,
                        opponent: opponent.current.team,
                    }
                }))
            }
        }
    }, 1000);
}

function startGame(room) {
    console.info(`Room ${room} started a game`)
    let time = 240;
    let shouldCountdown = false;
    const x = setInterval(() => {
        if (shouldCountdown) {
            time--;
            shouldCountdown = false;
        } else {
            shouldCountdown = true;
        }
        const payload = {
            time,
            update: {}
        };
        const data = {
            type: codes.turn,
            payload
        };
        to(room, JSON.stringify(data));
    }, 500);
}

function onNewWebsocketConnection(ws) {
    const id = uuidv4();
    onlineClients.set(id, ws);
    console.info(`Socket ${id} has connected.`);
    let room = "";
    ws.on('message', function(data) {
        const { type, payload } = JSON.parse(data)
        switch (type) {
            case codes.room:
                const {room, team} = payload;
                onNewRoom(id, room, team);
                break;
            case codes.get_opponent:
                onGetOpponent(id, payload);
                break;
            case codes.team_submit:
                onTeamSubmit(id, payload);
                break;
            case codes.ready_game:
                onReadyGame(id, payload);
                break;
            default:
                console.error("Message not recognized")
        }
    });

    ws.on("close", () => {
        onlineClients.delete(id);
        if (rooms.get(room)) {
            if (rooms.get(room).players) {
                const index = rooms.get(room).players.findIndex(x => x.id === id)
                rooms.get(room).players[index] = {}
                to(room, JSON.stringify({
                    type: codes.room_leave,
                }), null);
                console.info(`Socket ${id} has been removed from room ${room}.`);
            }

            if (isEmpty(rooms.get(room).players[1]) && isEmpty(rooms.get(room).players[0])) {
                rooms.delete(room);
                console.info(`Room ${room} has been deleted.`);
            }
        }

        console.info(`Socket ${id} has disconnected.`);
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
