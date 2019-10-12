const http = require('http');

const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.Server(app);
const socket = new WebSocket.Server({ server, clientTracking: true });

app.use(cors());
app.use(express.static(`${__dirname}/../public`));

const events = {};

socket.on('connection', (client) => {
    client.on('message', (message) => {
        Object.entries(JSON.parse(message)).forEach(([key, value]) => {
            // eslint-disable-next-line no-unused-expressions
            events[key] ? Object.assign(events[key], value) : (events[key] = value);
        });
        // console.log(events);
        const player_0Playing =
            events.player_0 && (events.player_0.playing || 0) > (events.player_0.paused || 0);
        const player_1Playing =
            events.player_1 && (events.player_1.playing || 0) > (events.player_1.paused || 0);
        if (player_0Playing && player_1Playing) {
            const sendMessage = {
                player_0: 'pauseVideo',
            };
            client.send(JSON.stringify(sendMessage));
        }
    });
});

server.listen(8000);
