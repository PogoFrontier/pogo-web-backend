import e from "express";
import c from 'cors';
import http from 'http';
import firebase from 'firebase-admin';
import SERVICE_ACCOUNT from '../project-grookey-6a7326cb8d5a';
import pokemonRoutes from "./pokemonRoutes";
import moveRoutes from "./moveRoutes";
import userRoutes from "./userRoutes";
import roomRoutes from "./roomRoutes";

export const SERVER_PORT = 2999;

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
app.use('/api/room', roomRoutes);

// serve static files from a given folder
app.use(e.static('../public'));

function startServer() {
    // create http server and wrap the express app
    const server = http.createServer(app);

    // important! must listen from `server`, not `app`, otherwise socket.io won't function correctly
    server.listen(process.env.PORT || SERVER_PORT, () => console.info(`Listening on port ${process.env.PORT || SERVER_PORT}.`));
}

startServer();