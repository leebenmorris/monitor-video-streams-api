const http = require('http');

const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.Server(app);
const socket = new WebSocket.Server({ server, clientTracking: true });

app.use(cors());
app.use(express.static(`${__dirname}/../public`));

const maxPlaying = 3;

const events = {};

const nowPlaying = new Set();

function noop() {}

function heartbeat() {
    this.isAlive = true;
}

socket.on('connection', (client) => {
    // eslint-disable-next-line no-param-reassign
    client.isAlive = true;
    client.on('pong', heartbeat);

    client.on('message', (rawMessage) => {
        const message = JSON.parse(rawMessage);

        Object.entries(message).forEach(([key, value]) => {
            // eslint-disable-next-line no-unused-expressions
            events[key] ? Object.assign(events[key], value) : (events[key] = value);

            const playerState = Object.keys(value)[0];

            if (playerState === 'playing') {
                nowPlaying.add(key);
            } else {
                nowPlaying.delete(key);
            }
        });

        console.log({
            events,
            nowPlaying: [...nowPlaying],
            nowPlayingFirst: [...nowPlaying][0],
        });

        if (nowPlaying.size > maxPlaying) {
            const sendMessage = {
                [[...nowPlaying][0]]: 'pauseVideo',
            };
            client.send(JSON.stringify(sendMessage));
        }

        // const player_0Playing =
        //     events.player_0 && (events.player_0.playing || 0) > (events.player_0.paused || 0);
        // const player_1Playing =
        //     events.player_1 && (events.player_1.playing || 0) > (events.player_1.paused || 0);
        // if (player_0Playing && player_1Playing) {
        // const sendMessage = {
        //     player_0: 'pauseVideo',
        // };
        // client.send(JSON.stringify(sendMessage));
        // }
    });
});

setInterval(function ping() {
    socket.clients.forEach(function each(client) {
        if (client.isAlive === false) {
            return client.terminate();
        }

        // eslint-disable-next-line no-param-reassign
        client.isAlive = false;
        client.ping(noop);
    });
}, 1000);

server.listen(8000);
