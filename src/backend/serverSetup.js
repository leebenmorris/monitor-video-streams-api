const http = require('http');

const express = require('express');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

const maxPlaying = 3;

const nowPlaying = new Set();

const videoList = [
    {
        videoId: 'hY7m5jjJ9mM',
        height: 158,
        width: 280,
    },
    {
        videoId: 'F7uSppqT8bM',
        height: 158,
        width: 280,
    },
    {
        videoId: 'rNSnfXl1ZjU',
        height: 158,
        width: 280,
    },
    {
        videoId: '94PLgLKcGW8',
        height: 158,
        width: 280,
    },
];

// frontend served from /docs directory to suit github pages
// app.use(express.static(`${__dirname}/../../docs`));

io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`Socket connected to ${socket.id}`);

    socket.on('getVideoList', (cb) => {
        console.log('getVideoList called');
        cb(videoList);
    });

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
