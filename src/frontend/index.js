/* global YT */

const io = require('socket.io-client');
require('./index.css');

const {
    ioErrorHandler,
    ioConnectErrorHandler,
    ioConnectHandler,
    ioReconnectHandler,
    ioDisconnectHandler,
    ioPlayerControlHandler,
} = require('./lib/ioHandlers');

const { onPlayerReadyHandler, onPlayerStateChangeHandler } = require('./lib/youTubeHandlers');

const {
    createPlayerDiv,
    createSocketMessageArea,
    loadYouTubeIFrameApi,
} = require('./lib/utilities');

const ioServerUrl = process.env.SOCKET_URL;

const players = {};

const app = document.getElementById('app');

loadYouTubeIFrameApi();

app.appendChild(createSocketMessageArea());

// setup the socket.io connection and attach event listeners
const socket = io(ioServerUrl)
    .on('error', ioErrorHandler)
    .on('connect_error', ioConnectErrorHandler)
    .on('connect', ioConnectHandler)
    .on('reconnect', function reconnectHandler() {
        ioReconnectHandler.call(this, players);
    })
    .on('disconnect', ioDisconnectHandler.bind(null, players))
    .on('playerControl', ioPlayerControlHandler.bind(null, players));

// this gets called by the YouTube iframe API once it has loaded
window.onYouTubeIframeAPIReady = () => {
    socket.emit('getVideoList', (videoList) => {
        videoList.forEach((video, i) => {
            const playerId = `player_${i + 1}`;

            const playerDiv = createPlayerDiv(playerId);

            app.appendChild(playerDiv);

            // save all players to a global players object for access outside of event handlers
            players[playerId] = new YT.Player(playerId, {
                events: {
                    onReady: onPlayerReadyHandler.bind(null, socket),
                    onStateChange: onPlayerStateChangeHandler.bind(null, socket),
                },
                ...video,
            });
        });
    });
};
