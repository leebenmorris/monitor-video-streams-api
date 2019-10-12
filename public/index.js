/* global document, YT */

document.querySelectorAll('iframe').forEach((element, i) => {
    element.setAttribute('id', `player_${i}`);
    const src = element.getAttribute('src');
    element.setAttribute('src', `${src}?enablejsapi=1`);
});

const tag = document.createElement('script');
const firstScriptTag = document.getElementsByTagName('script')[0];

tag.src = 'https://www.youtube.com/iframe_api';
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onPlayerReady(event) {
    // console.log('onPlayerReady', { eventTarget: event.target, eventData: event.data });
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    console.log('onPlayerStateChange', { eventTarget: event.target, eventData: event.data });
}

// Creates an <iframe> (and YouTube player) after the API code downloads.
// eslint-disable-next-line no-unused-vars
function onYouTubeIframeAPIReady() {
    document.querySelectorAll('iframe').forEach((element, i) => {
        const id = `player_${i}`;

        element.setAttribute('id', id);

        // eslint-disable-next-line no-new
        new YT.Player(id, {
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
            },
        });
    });
}
