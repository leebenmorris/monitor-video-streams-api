const { idSetText, getInfoId, mapEventNumToName } = require('./utilities');

function onPlayerReadyHandler(ioSocket, event) {
    const playerId = event.target.a.id;

    ioSocket.emit('playerStatus', [playerId, 'ready']);

    idSetText(getInfoId(playerId), `${playerId}: ready`);
}

function onPlayerStateChangeHandler(ioSocket, event) {
    const playerId = event.target.a.id;
    const currentPlayerState = mapEventNumToName(event.data);

    ioSocket.disconnected && event.target.pauseVideo();

    ioSocket.emit('playerStatus', [playerId, currentPlayerState]);

    idSetText(
        getInfoId(playerId),
        `${playerId}: ${currentPlayerState === 'paused' ? 'PAUSED' : currentPlayerState}`,
    );
}

module.exports = {
    onPlayerReadyHandler,
    onPlayerStateChangeHandler,
};
