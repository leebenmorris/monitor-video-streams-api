/* eslint-disable no-console */
/* global YT, io */

// const ioServerUrl = 'https://monitor-video-streams-api.herokuapp.com';
const ioServerUrl = 'http://localhost:7080';

console.log({ ioServerUrl });

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

function getFirstScriptTag() {
    return document.getElementsByTagName('script')[0];
}

function ioErrorHandler(error) {
    console.log(`socket.io Error: ${JSON.stringify(error, null, 4)}`);
}

function ioConnectErrorHandler(error) {
    console.log(`socket.io Error: ${JSON.stringify(error, null, 4)}`);
}

function ioConnectHandler() {
    Object.entries(disconnectedPlayerStates).forEach(([id, state]) => {
        if (state === 'playing') {
            players[id].playVideo();
        }
    });
    console.log('Connected to:', socket.id);
}

function ioPlayerControlHandler([id, command]) {
    players[id][command]();
    console.log('playerControl received:', [id, command]);
}

function ioDisconnectHandler() {
    Object.entries(players).forEach(([id, player]) => {
        const currentPlayerState = mapEventNumToName[player.getPlayerState()];
        disconnectedPlayerStates[id] = currentPlayerState;
        player.pauseVideo();
    });
    console.log(`Disconnected from socket.io server, so all videos paused`);
}

function onPlayerReadyHandler(ioSocket, event) {
    const message = [event.target.a.id, 'ready'];

    console.log('onPlayerReady', message);
    ioSocket.emit('playerStatus', message);
}

function onPlayerStateChangeHandler(ioSocket, event) {
    if (ioSocket.disconnected) {
        event.target.pauseVideo();
    }

    const message = [event.target.a.id, mapEventNumToName[event.data]];

    console.log('onPlayerStateChange', message);
    ioSocket.emit('playerStatus', message);
}

// setup the socket.io connection and attach event listeners
setTimeout(() => {
    socket = io(ioServerUrl)
        .on('error', ioErrorHandler)
        .on('connect_error', ioConnectErrorHandler)
        .on('connect', ioConnectHandler)
        .on('playerControl', ioPlayerControlHandler)
        .on('disconnect', ioDisconnectHandler);
}, 10000);

// load the iFrame Player API code asynchronously
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';

const firstScriptTag = getFirstScriptTag();
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// this gets called by the YouTube iFrame API once it has loaded
window.onYouTubeIframeAPIReady = () => {
    console.log('onYouTubeIframeAPIReady called');

    const scriptTagZero = getFirstScriptTag();

    (function onlyIfSocketConnected() {
        if (socket.connected) {
            socket.emit('getVideoList', (videoList) => {
                console.log({ videoList });
                videoList.forEach((video, i) => {
                    const id = `player_${i + 1}`;

                    const div = document.createElement('div');
                    div.setAttribute('id', id);

                    scriptTagZero.parentNode.insertBefore(div, scriptTagZero);

                    // save all players to a global players object for access outside of event handlers
                    players[id] = new YT.Player(id, {
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
                console.log('onlyIfSocketConnected setTimeout called');
                onlyIfSocketConnected();
            }, 200);
        }
    })();
};
