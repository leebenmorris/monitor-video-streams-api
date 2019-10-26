const { idSetText, mapEventNumToName } = require('./utilities');

const disconnectedPlayerStates = {};

function ioErrorHandler(error) {
    idSetText('socket-messages', `socket.io Error: ${JSON.stringify(error, null, 4)}`);
}

function ioConnectErrorHandler() {
    idSetText(
        'socket-messages',
        'Disconnected from socket.io server, player states saved and all videos paused',
    );
}

function ioConnectHandler() {
    const socket = this;

    idSetText('socket-messages', `Connected to socket ID: ${socket.id}`);
}

function ioReconnectHandler(players) {
    const socket = this;

    Object.entries(disconnectedPlayerStates).forEach(([id, state]) => {
        if (state === 'playing') {
            players[id].playVideo();
        }
    });

    idSetText(
        'socket-messages',
        `Reconnected to socket ID: ${socket.id}, previous player states restored`,
    );
}

function ioDisconnectHandler(players) {
    Object.entries(players).forEach(([id, player]) => {
        const currentPlayerState = mapEventNumToName(player.getPlayerState());
        disconnectedPlayerStates[id] = currentPlayerState;
        player.pauseVideo();
    });

    idSetText(
        'socket-messages',
        'Disconnected from socket.io server, player stated saved, all videos paused',
    );
}

function ioPlayerControlHandler(players, [id, command]) {
    players[id][command]();

    idSetText('socket-messages', `playerControl received: ${id}: ${command}`);
}

module.exports = {
    ioErrorHandler,
    ioConnectErrorHandler,
    ioConnectHandler,
    ioReconnectHandler,
    ioDisconnectHandler,
    ioPlayerControlHandler,
};
