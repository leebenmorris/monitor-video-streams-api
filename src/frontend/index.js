/* eslint-disable no-console */
/* global YT, io */

const ioServerUrl = process.env.SOCKET_URL;

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

const playerId = (index) => `player_${index + 1}`;

const infoId = (playerIdentity) => `${playerIdentity}_info`;

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
    document.getElementById(infoId(event.target.a.id)).textContent = 'ready';

    const message = [event.target.a.id, 'ready'];

    console.log('onPlayerReady', message);
    ioSocket.emit('playerStatus', message);
}

function onPlayerStateChangeHandler(ioSocket, event) {
    const currentPlayerState = event.target.getPlayerState();
    const playerMessage = mapEventNumToName[currentPlayerState];

    document.getElementById(infoId(event.target.a.id)).textContent =
        playerMessage === 'paused' ? 'PAUSED' : playerMessage;

    if (ioSocket.disconnected) {
        event.target.pauseVideo();
    }

    const message = [event.target.a.id, mapEventNumToName[event.data]];

    console.log('onPlayerStateChange', message);
    ioSocket.emit('playerStatus', message);
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
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// this gets called by the YouTube iFrame API once it has loaded
window.onYouTubeIframeAPIReady = () => {
    console.log('onYouTubeIframeAPIReady called');

    const scriptTagZero = getFirstScriptTag();

    (function onlyIfSocketConnected() {
        if (socket.connected) {
            socket.emit('getVideoList', (videoList) => {
                videoList.forEach((video, i) => {
                    const playerIdentity = playerId(i);
                    const infoIdentity = infoId(playerIdentity);

                    const wrapperDiv = document.createElement('div');
                    wrapperDiv.setAttribute('style', 'display: inline-block;');

                    const p = document.createElement('p');
                    p.setAttribute('id', infoIdentity);
                    p.setAttribute('style', 'text-align: center;');
                    wrapperDiv.appendChild(p);

                    const div = document.createElement('div');
                    div.setAttribute('id', playerIdentity);
                    wrapperDiv.appendChild(div);

                    scriptTagZero.parentNode.insertBefore(wrapperDiv, scriptTagZero);

                    // save all players to a global players object for access outside of event handlers
                    players[playerIdentity] = new YT.Player(playerIdentity, {
                        events: {
                            onReady: onPlayerReadyHandler.bind(null, socket),
                            onStateChange: onPlayerStateChangeHandler.bind(null, socket),
                        },
                        ...video,
                    });
                });
            });
        } else {
            setTimeout(onlyIfSocketConnected, 200);
        }
    })();
};
