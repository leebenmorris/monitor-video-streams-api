const server = require('http').createServer();

const io = require('socket.io')(server);

const maxPlaying = 3;

const nowPlaying = {};

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

io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`Socket connected to ${socket.id}`);

    nowPlaying[socket.id] = nowPlaying[socket.id] || new Set();

    socket.on('getVideoList', (cb) => {
        console.log('getVideoList called');
        cb(videoList);
    });

    socket.on('playerStatus', ([player, status]) => {
        // eslint-disable-next-line no-unused-expressions
        status === 'playing'
            ? nowPlaying[socket.id].add(player)
            : nowPlaying[socket.id].delete(player);

        if (nowPlaying[socket.id].size > maxPlaying) {
            const indexOfPlayerToPause = nowPlaying[socket.id].size - 1 - maxPlaying;
            const playerToPause = [...nowPlaying[socket.id]][indexOfPlayerToPause];
            socket.emit('playerControl', [playerToPause, 'pauseVideo']);
        }
    });

    socket.on('disconnect', () => {
        delete nowPlaying[socket.id];
    });
});

server.on('listening', () => {
    const { port } = server.address();
    // eslint-disable-next-line no-console
    console.log('Server listening on port', port);
});

module.exports = server;
