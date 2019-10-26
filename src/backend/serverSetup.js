const http = require('http');

const io = require('socket.io');

const getVideoList = require('./getVideoList');

const server = http.createServer();

const maxToPlay = 3;

const usersPlayingLists = {};

io(server).on('connection', (socket) => {
    // Set used to store player IDs as it will automatically remove the identical older id's,
    // and a particular player cannot be playing twice at the same time!
    usersPlayingLists[socket.id] = usersPlayingLists[socket.id] || new Set();

    const nowPlayingList = usersPlayingLists[socket.id];

    socket
        .on('getVideoList', (cb) => getVideoList(cb))
        .on('playerStatus', ([playerId, status]) => {
            nowPlayingList[status === 'playing' ? 'add' : 'delete'](playerId);

            if (nowPlayingList.size > maxToPlay) {
                const indexOfPlayerToPause = nowPlayingList.size - 1 - maxToPlay;
                const playerToPause = [...nowPlayingList][indexOfPlayerToPause];

                socket.emit('playerControl', [playerToPause, 'pauseVideo']);
            }
        })
        .on('disconnect', () => {
            delete usersPlayingLists[socket.id];
        });
});

server.on('listening', () => {
    const { port } = server.address();
    // eslint-disable-next-line no-console
    console.log('Server listening on port', port);
});

module.exports = server;
