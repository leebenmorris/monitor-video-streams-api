/* global document, YT */

const players = {};

const eventsMap = {
    '-1': 'notStarted',
    '0': 'ended',
    '1': 'playing',
    '2': 'paused',
    '3': 'buffering',
    '5': 'cued',
};

// load the YouTube IFrame Player API code asynchronously
const tag = document.createElement('script');
const firstScriptTag = document.getElementsByTagName('script')[0];

tag.src = 'https://www.youtube.com/iframe_api';
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onPlayerReady(event) {
    console.log('onPlayerReady', {
        [event.target.a.id]: eventsMap[event.data],
        players,
    });
}

function onPlayerStateChange(event) {
    console.log('onPlayerStateChange', {
        [event.target.a.id]: eventsMap[event.data],
        eventTime: Date.now(),
    });
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
