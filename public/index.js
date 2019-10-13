/* eslint-disable no-console */
/* global YT, io */

const socket = io('http://localhost:7080');

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

socket.on('error', (error) => {
    console.log(`socket.io Error: ${JSON.stringify(error, null, 4)}`);
});

socket.on('connect_error', (error) => {
    console.log(`socket.io Connection Error: ${JSON.stringify(error, null, 4)}`);
});

socket.on('connect', () => {
    Object.entries(disconnectedPlayerStates).forEach(([id, state]) => {
        if (state === 'playing') {
            players[id].playVideo();
        }
    });
    console.log('Connected to:', socket.id);
});

socket.on('message', (message) => {
    Object.entries(message).forEach(([key, command]) => {
        players[key][command]();
    });
    console.log('message received:', message);
});

socket.on('disconnect', () => {
    Object.entries(players).forEach(([id, player]) => {
        disconnectedPlayerStates[id] = mapEventNumToName[player.getPlayerState()];
        player.pauseVideo();
    });
    console.log(`Disconnected from: ${socket.id}`);
});

// load the YouTube IFrame Player API code asynchronously
const tag = document.createElement('script');
const firstScriptTag = document.getElementsByTagName('script')[0];

tag.src = 'https://www.youtube.com/iframe_api';
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onPlayerReady(event) {
    const message = {
        [event.target.a.id]: {
            ready: Date.now(),
        },
    };

    console.log('onPlayerReady', message);
    socket.emit('message', message);
}

function onPlayerStateChange(event) {
    if (socket.disconnected) {
        event.target.pauseVideo();
    }

    const message = {
        [event.target.a.id]: {
            [mapEventNumToName[event.data]]: Date.now(),
        },
    };

    console.log('onPlayerStateChange', message);
    socket.emit('message', message);
}

// eslint-disable-next-line no-unused-vars
function onYouTubeIframeAPIReady() {
    document.querySelectorAll('iframe').forEach((element, i) => {
        // modify iFrame elements to make them compatible with the YouTube IFrame Player API.
        // this allows new iFrame elements taken directly from the YouTube website to be dumped
        // into the html file with no further work required.
        const id = `player_${i}`;
        const src = element.getAttribute('src');

        element.setAttribute('id', id);
        element.setAttribute('src', `${src}?enablejsapi=1`);

        // save all players to a global players object for access outside of event handlers
        players[id] = new YT.Player(id, {
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
            },
        });
    });
}
