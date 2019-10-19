/* eslint-disable no-console */
/* global YT, io */

const ioServerUrl = 'https://monitor-video-streams-api.herokuapp.com';

const videos = [
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

// load the IFrame Player API code asynchronously
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';

const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// setup the socket.io connection and attach event listeners
const socket = io(ioServerUrl)
    .on('error', (error) => {
        console.log(`socket.io Error: ${JSON.stringify(error, null, 4)}`);
    })
    .on('connect_error', (error) => {
        console.log(`socket.io Connection Error: ${JSON.stringify(error, null, 4)}`);
    })
    .on('connect', () => {
        Object.entries(disconnectedPlayerStates).forEach(([id, state]) => {
            if (state === 'playing') {
                players[id].playVideo();
            }
        });
        console.log('Connected to:', socket.id);
    })
    .on('playerControl', ([id, command]) => {
        players[id][command]();
        console.log('playerControl received:', [id, command]);
    })
    .on('disconnect', () => {
        Object.entries(players).forEach(([id, player]) => {
            const currentPlayerState = mapEventNumToName[player.getPlayerState()];
            disconnectedPlayerStates[id] = currentPlayerState;
            player.pauseVideo();
        });
        console.log(`Disconnected from socket.io server, so all videos paused`);
    });

function onPlayerReady(event) {
    const message = [event.target.a.id, 'ready'];

    console.log('onPlayerReady', message);
    socket.emit('playerStatus', message);
}

function onPlayerStateChange(event) {
    if (socket.disconnected) {
        event.target.pauseVideo();
    }

    const message = [event.target.a.id, mapEventNumToName[event.data]];

    console.log('onPlayerStateChange', message);
    socket.emit('playerStatus', message);
}

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
    console.log('onYouTubeIframeAPIReady called');

    const scriptTagZero = document.getElementsByTagName('script')[0];

    videos.forEach((video, i) => {
        const id = `player_${i + 1}`;

        const div = document.createElement('div');
        div.setAttribute('id', id);

        scriptTagZero.parentNode.insertBefore(div, scriptTagZero);

        // save all players to a global players object for access outside of event handlers
        players[id] = new YT.Player(id, {
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
            },
            ...video,
        });
    });
};
