const http = require('http');

const express = require('express');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

const maxPlaying = 3;

const events = {};

const nowPlaying = new Set();

app.use(express.static(`${__dirname}/../public`));

io.on('connection', (socket) => {
    socket.on('message', (message) => {
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
            socket.emit('message', sendMessage);
        }
    });
});

server.on('listening', () => {
    const { port } = server.address();
    console.log('Server listening on port', port);
});

module.exports = server;
