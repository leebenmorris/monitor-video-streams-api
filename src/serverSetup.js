const http = require('http');

const express = require('express');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

const maxPlayersAllowed = 3;

const nowPlaying = new Set();

app.use(express.static(`${__dirname}/../public`));

io.on('connection', (socket) => {
    socket.on('playerStatus', ([player, status]) => {
        console.log({ player, status, nowPlayingBefore: [...nowPlaying] });

        if (status === 'playing') {
            nowPlaying.add(player);
        } else {
            nowPlaying.delete(player);
        }
        console.log({ nowPlayingAfter: [...nowPlaying] });

        const indexOfPlayerToPause = nowPlaying.size - 1 - maxPlayersAllowed;
        const playerToPause = [...nowPlaying][indexOfPlayerToPause];

        if (playerToPause) {
            console.log(playerToPause, 'now pausing');
            socket.emit('playerControl', [playerToPause, 'pauseVideo']);
        }
    });
});

server.on('listening', () => {
    const { port } = server.address();
    console.log('Server listening on port', port);
});

module.exports = server;
