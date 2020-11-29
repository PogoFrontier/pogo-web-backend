
const e = require("express");
const
    http = require("http"),
    express = require("express"),
    socketio = require("socket.io"),
    cors = require("cors"),
    pokemon = require("./data/pokemon.json"),
    moves = require("./data/moves.json");

const SERVER_PORT = 3000;

let onlineClients = new Set();
let rooms = {};

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function onNewWebsocketConnection(socket) {
    console.info(`Socket ${socket.id} has connected.`);
    onlineClients.add(socket.id);

    socket.on('room', function({room, team}) {
        socket.join(room);
        const player = {
            id: socket.id,
            team
        }
        if (rooms[room] === undefined) {
            rooms[room] = {
                id: room,
                players: [player, {}]
            }
            console.info(`Socket ${socket.id} has joined ${room}.`);
        } else if (isEmpty(rooms[room].players[1])) {
            rooms[room].players[1] = player
            socket.to(room).emit("room_join", player);
            console.info(`Socket ${socket.id} has joined ${room}.`);
        } else if (isEmpty(rooms[room].players[0])) {
            rooms[room].players[0] = player
            socket.to(room).emit("room_join", player);
            console.info(`Socket ${socket.id} has joined ${room}.`);
        } else {
            console.info(rooms[room].players[1]);
            console.error(`Room ${room} is full.`);
        }

        socket.on("disconnect", () => {
            onlineClients.delete(socket.id);
            if (rooms[room]) {
                if (rooms[room].players) {
                    const index = rooms[room].players.findIndex(x => x.id == socket.id)
                    rooms[room].players[index] = {}
                    socket.to(room).emit("room_leave");
                }
                if (isEmpty(rooms[room].players[1]) && isEmpty(rooms[room].players[0])) {
                    delete rooms[room];
                }
            }
            console.info(`Socket ${socket.id} has disconnected.`);
        });
    });
}

function startServer() {
    // create a new express app
    const app = express();

    // create http server and wrap the express app
    const server = http.createServer(app);
    // bind socket.io to that server
    const io = socketio(server);

    // serve static files from a given folder
    app.use(express.static("public"));

    app.use(cors())

    // will fire for every new websocket connection
    io.on("connection", onNewWebsocketConnection);

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

    // create opponent path
    app.get("/opponent/:room/:id", (req, res) => {
        let payload;
        const { room, id } = req.params
        if (rooms[room]) {
            const index = rooms[room].players.findIndex(x => !isEmpty(x) && x.id != id)
            if (index >= 0) {
                payload = rooms[room].players[index].team
            }
        } else {
            throw new Error(`Room ${room} does not exist`);
        }
        res.send(payload);
    });

    // important! must listen from `server`, not `app`, otherwise socket.io won't function correctly
    server.listen(SERVER_PORT, () => console.info(`Listening on port ${SERVER_PORT}.`));
}

startServer();
