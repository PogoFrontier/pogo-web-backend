# Project Grookey: Backend
Express + Websocket backend for Project Grookey. This README is targeted towards developers, check [here](https://github.com/DeveloperKhan/pogo-web) for the general README.

## Installation
### Frontend
1. ```npm install```
2. ```npm run dev```
<br /><b>Note:</b> If you are on Linux and encounter an unsupported runtime error regarding Node Sass, you may have to run `npm rebuild node-sass`.
### Backend
1. ```npm install```
2. ```docker run -it --rm --name redis-server -p 6379:6379 redis``` ([Meaning you should have Docker installed and running](https://docs.docker.com/engine/reference/commandline/cli/))
3. ```npm start```
<br /><b>Note:</b> The backend uses an experimental flag supported only by node v12+

## Project Hierarchy
### Frontend
The frontend is built in NextJS, so each individual route is located in the `pages` directory. A page is composed of several components you will find in the `src/components` directory. This project uses scss modules for scoped stylesheets for each component (labeled `filename.module.scss`). You can find images and fonts in the `src/assets` directory and common actions and css variables in the `src/common` directory.

### Backend
The backend is built with ExpressJS + WS so the gamemaster data + sprites can be found in `/public`. The root file is called `server.ts`. This file has a couple express routes (/pokemon and /moves) that return data from the `/data` directory. For each type of message (i.e. an input being registered, a turn ending, a player joining) there is a corresponding handler in the `/handlers` directory. Finally, all the game objects are type defined in the `/types` directory. The frontend needs to know these types as well, so this directory has its own `package.json` so that you can export it as a node module for the frontend (`npm install @adibkhan/pogo-web-backend`). Only Adib can publish any changes to this directory, but in testing you can use the `npm link` command.

## Server Communication
The express server uses [WS](https://www.npmjs.com/package/ws) to create a websocket server for the client. WS doesn't exist on the client side, so pure [websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) are used instead.
### Setup
So you can either communicate on the live server on Heroku, or a localhost:3000 server. For development I recommend the latter, it will be the default. To switch between the two, just comment and uncomment the corresponding lines of code in `{frontend}/src/config.ts`.
### Types of Messages
- Events <br />
Creating a room, joining a room, starting the game countdown, submitting a team, etc. are all considered general game events. They are JSON stringified objects of the form `{ type: string, payload: object }`. They payload varies depending on the type of message, you can find definitions in `{backend}/types/handlers.ts`. You can find the different message types in `{backend}/types/actions.ts`.
- Inputs <br />
Fast attacks, switches, and charge attacks are special messages that we want to send/recieve as fast as possible. Instead of JSON parsing/encoding these data packets, inputs use a simple naming scheme of `#{input_type}:{move id or switch index}`. If the first character of the ws message is #, then we assume the move is an input. Input type are defined in `{backend}/types/actions.ts`.
- Simple Events <br />
Currently, ending the game is represented by the string "$end". Its undecided whether simple events denoted by the $ character will be used more, or if the game end message will become a normal event.
### Authoritative Server
Almost all logic and game states are managed by the server and redis. Wehenever a player enters a room, the server tries to set a flag in redis with the key `room:${roomId}`. 

If it works, it means, this server is the first server with this room. Next it creates a room locally and stores it locally in a map called `rooms`. The room is also saved and updated to redis with the previous key `room:${roomId}`. This room listens on redis to the channel `commands:${roomId}` to get the commands of the players.

The server saves the current roomId for each player. All command messages from a user is published to the redis channel `commands:${roomId}` together with the userId.

If the creation of the flag `room:${roomId}` doesn't work, it means another server already hosts this room. Therefore a join-command is published to this room.

Updates to the players are published by the room in the channel `messagesToUser:${userId}`. For every websocket the server listens to this channel and passes on every message.

The frontend has no timer of its own, and instead reacts to updates from the server. Eventually the frontend will assist with rollback netcode behaviors as we develop functionallity for buffered inputs.

### Matchmaking
Players can open rooms and joint them directly by sending a message with the type `ROOM`. Alternatiely a client can use the type `MATCHMAKING_SEARCH_BATTLE`. With this the server will match this player with another player.

This message must contain the format, in which the game is played. The server saves the player on redis with a key that is unique to this format, so same format means same key. Another server that receives a request like this can then look into the array and see the battle request of the previous player. If the players match (with ELO and stuff we can work on later), the match starts. The players are notified that the game has started and that they should join a room with a given id. They need to join in 15 seconds with their team, or they are disqualified.

If a client wants to quit an ongoing battle request just send a message of type `MATCHMAKING_SEARCH_BATTLE` with the format.

### Contributing
The main branch for both projects is protected and autodeploys to Heroku and Vercel respectively. To get stuff onto main, you have to make a PR from a seperate branch. It's recommended making one branch for one feature such as `feature/team-builder` or `feature/dark-mode`. In the case where changes need to be made in both repositories for one feature, just make 2 PRs and include in the message that they are linked. We use pre-commit hooks via Husky, so your code will be checked before it gets committed. Enzyme/Jest are also set up, but no tests have been written.
