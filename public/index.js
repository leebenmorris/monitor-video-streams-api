/* global document, YT, WebSocket */

const players = {};
let isSocketConnected = false;

const mapEventNumToName = {
    '-1': 'notStarted',
    '0': 'ended',
    '1': 'playing',
    '2': 'paused',
    '3': 'buffering',
    '5': 'cued',
};

const socket = new WebSocket('ws://localhost:8000');

function heartbeat() {
    clearTimeout(this.pingTimeout);

    // Use `WebSocket#terminate()`, which immediately destroys the connection,
    // instead of `WebSocket#close()`, which waits for the close timer.
    // Delay should be equal to the interval at which your server
    // sends out pings plus a conservative assumption of the latency.
    this.pingTimeout = setTimeout(() => this.terminate(), 1000 + 1000);
}

socket.onerror = function handleError(error) {
    console.log(`WebSocket Error: ${error}`);
};

socket.onopen = function handleOpen(event) {
    heartbeat();
    isSocketConnected = true;
    console.log('Connected to:', event.target.url);
};

socket.onmessage = function handleMessage(event) {
    const message = JSON.parse(event.data);

    Object.entries(message).forEach(([key, command]) => {
        players[key][command]();
    });
    // if (event.data) console.log('Message received:', event.data);
};

// Show a disconnected message when the WebSocket is closed.
socket.onclose = function handleClose(event) {
    clearTimeout(this.pingTimeout);
    isSocketConnected = false;
    console.log('Disconnected from WebSocket.');
};

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
    socket.send(JSON.stringify(message));
}

function onPlayerStateChange(event) {
    if (!isSocketConnected) {
        event.target.stopPlayer();
    }
    const message = {
        [event.target.a.id]: {
            [mapEventNumToName[event.data]]: Date.now(),
        },
    };

    console.log('onPlayerStateChange', message);
    socket.send(JSON.stringify(message));
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
