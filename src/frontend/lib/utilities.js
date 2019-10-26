const getInfoId = (playerId) => `${playerId}_info`;

// eslint-disable-next-line no-return-assign
const idSetText = (id, text) => (document.getElementById(id).textContent = text);

function createPlayerDiv(playerId) {
    const playerInfoId = getInfoId(playerId);

    const playerDiv = document.createElement('div');
    playerDiv.setAttribute('id', 'player');

    const playerInfo = document.createElement('p');
    playerInfo.setAttribute('id', playerInfoId);

    const divToBeReplacedByIFrame = document.createElement('div');
    divToBeReplacedByIFrame.setAttribute('id', playerId);

    playerDiv.appendChild(playerInfo);
    playerDiv.appendChild(divToBeReplacedByIFrame);

    return playerDiv;
}

function createSocketMessageArea() {
    // add socket message area to page
    const messageP = document.createElement('p');
    messageP.setAttribute('id', 'socket-messages');

    return messageP;
}

function loadYouTubeIFrameApi() {
    const youTubeApiScriptTag = document.createElement('script');
    youTubeApiScriptTag.src = 'https://www.youtube.com/iframe_api';

    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(youTubeApiScriptTag, firstScriptTag);
}

const mapEventNumToName = (num) =>
    ({
        '-1': 'notStarted',
        '0': 'ended',
        '1': 'playing',
        '2': 'paused',
        '3': 'buffering',
        '5': 'cued',
    }[num]);

module.exports = {
    getInfoId,
    idSetText,
    createPlayerDiv,
    createSocketMessageArea,
    loadYouTubeIFrameApi,
    mapEventNumToName,
};
