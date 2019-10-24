/* global YT */

const io = require('socket.io-client');
require('./index.css');

const ioServerUrl = process.env.SOCKET_URL;

let socket = {};

const players = {};

const disconnectedPlayerStates = {};

const mapEventNumToName = {
    '-1': 'notStarted',
    '0': 'ended',
    '1': 'playing',
    '2': 'paused',
    '3': 'buffering',
    '5': 'cued',
};

const getPlayerId = (index) => `player_${index + 1}`;

const getInfoId = (playerIdent) => `${playerIdent}_info`;

const getFirstScriptTag = () => document.getElementsByTagName('script')[0];

// eslint-disable-next-line no-return-assign
const idSetText = (id, text) => (document.getElementById(id).textContent = text);

const insertElementBefore = (toInsertBefore, element) =>
    element.parentNode.insertBefore(toInsertBefore, element);

function ioErrorHandler(error) {
    idSetText('socket-messages', `socket.io Error: ${JSON.stringify(error, null, 4)}`);
}

function ioConnectErrorHandler(error) {
    idSetText('socket-messages', `socket.io Error: ${JSON.stringify(error, null, 4)}`);
}

function ioConnectHandler() {
    Object.entries(disconnectedPlayerStates).forEach(([id, state]) => {
        if (state === 'playing') {
            players[id].playVideo();
        }
    });
    idSetText('socket-messages', `Connected to: ${socket.id}`);
}

function ioPlayerControlHandler([id, command]) {
    players[id][command]();

    idSetText('socket-messages', `playerControl received: ${id} ${command}`);
}

function ioDisconnectHandler() {
    Object.entries(players).forEach(([id, player]) => {
        const currentPlayerState = mapEventNumToName[player.getPlayerState()];
        disconnectedPlayerStates[id] = currentPlayerState;
        player.pauseVideo();
    });

    idSetText('socket-messages', 'Disconnected from socket.io server, so all videos paused');
}

function onPlayerReadyHandler(ioSocket, event) {
    const playerId = event.target.a.id;

    idSetText(getInfoId(playerId), `${playerId}: ready`);

    ioSocket.emit('playerStatus', [playerId, 'ready']);
}

function onPlayerStateChangeHandler(ioSocket, event) {
    const playerId = event.target.a.id;
    const currentPlayerState = mapEventNumToName[event.data];

    idSetText(
        getInfoId(playerId),
        `${playerId}: ${currentPlayerState === 'paused' ? 'PAUSED' : currentPlayerState}`,
    );

    if (ioSocket.disconnected) {
        event.target.pauseVideo();
    }

    ioSocket.emit('playerStatus', [playerId, currentPlayerState]);
}

// setup the socket.io connection and attach event listeners
socket = io(ioServerUrl)
    .on('error', ioErrorHandler)
    .on('connect_error', ioConnectErrorHandler)
    .on('connect', ioConnectHandler)
    .on('playerControl', ioPlayerControlHandler)
    .on('disconnect', ioDisconnectHandler);

// load the iFrame Player API code asynchronously
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';

const firstScriptTag = getFirstScriptTag();
insertElementBefore(tag, firstScriptTag);

// this gets called by the YouTube iFrame API once it has loaded
window.onYouTubeIframeAPIReady = () => {
    idSetText('player-messages', 'YouTube iFrame API Ready');

    const scriptTagZero = getFirstScriptTag();

    (function onlyIfSocketConnected(retryCount = 1) {
        if (socket.connected) {
            idSetText('socket-messages', `Connected to: ${socket.id}`);
            // eslint-disable-next-line no-param-reassign
            retryCount = 1;

            socket.emit('getVideoList', (videoList) => {
                videoList.forEach((video, i) => {
                    const playerIdent = getPlayerId(i);
                    const infoIdent = getInfoId(playerIdent);

                    const playerDiv = document.createElement('div');
                    playerDiv.setAttribute('id', 'player');

                    const p = document.createElement('p');
                    p.setAttribute('id', infoIdent);
                    playerDiv.appendChild(p);

                    const div = document.createElement('div');
                    div.setAttribute('id', playerIdent);
                    playerDiv.appendChild(div);

                    insertElementBefore(playerDiv, scriptTagZero);

                    // save all players to a global players object for access outside of event handlers
                    players[playerIdent] = new YT.Player(playerIdent, {
                        events: {
                            onReady: onPlayerReadyHandler.bind(null, socket),
                            onStateChange: onPlayerStateChangeHandler.bind(null, socket),
                        },
                        ...video,
                    });
                });
            });
        } else {
            setTimeout(() => {
                idSetText('socket-messages', `Socket disconnected: retry attempt ${retryCount}`);
                onlyIfSocketConnected(retryCount + 1);
            }, 200);
        }
    })();
};
