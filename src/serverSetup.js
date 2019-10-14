const http = require('http');

const express = require('express');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

const maxPlaying = 3;

const nowPlaying = new Set();

app.use(express.static(`${__dirname}/../public`));

io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`Socket connected to ${socket.id}`);
    socket.on('playerStatus', ([player, status]) => {
        if (status === 'playing') {
            nowPlaying.add(player);
        } else {
            nowPlaying.delete(player);
        }

        if (nowPlaying.size > maxPlaying) {
            const indexOfPlayerToPause = nowPlaying.size - 1 - maxPlaying;
            const playerToPause = [...nowPlaying][indexOfPlayerToPause];
            socket.emit('playerControl', [playerToPause, 'pauseVideo']);
        }
    });
});

server.on('listening', () => {
    const { port } = server.address();
    // eslint-disable-next-line no-console
    console.log('Server listening on port', port);
});

module.exports = server;
