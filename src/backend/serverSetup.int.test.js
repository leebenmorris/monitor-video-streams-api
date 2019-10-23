/* eslint-disable func-names, no-console */
const { promisify } = require('util');

const chai = require('chai');
const io = require('socket.io-client');

const serverSetup = require('./serverSetup');

chai.should();

const PORT = 1234;

const asyncSetImmediate = promisify(setImmediate);

async function createSocket() {
    return new Promise((resolve, reject) => {
        const socket = io(`http://localhost:${PORT}`);

        socket
            .on('error', reject)
            .on('connect_error', reject)
            .on('connect', resolve.bind(null, socket));
    });
}

async function createSockets(num = 1) {
    const theseSockets = [];

    for (let i = 0; i < num; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await asyncSetImmediate();
        // eslint-disable-next-line no-await-in-loop
        theseSockets.push(await createSocket());
    }

    return theseSockets;
}

async function closeAllSockets(sockets) {
    // eslint-disable-next-line no-restricted-syntax
    for (const socket of sockets) {
        // eslint-disable-next-line
        await asyncSetImmediate();
        // eslint-disable-next-line
        await new Promise((resolve) => {
            socket.on('disconnect', resolve);
            socket.close();
        });
    }
}

async function createAndTestSockets(numberOfSockets) {
    const theseSockets = await createSockets(numberOfSockets);

    const socketMessageCounts = Array(theseSockets.length).fill(0);

    const expectedMessages = [['player1', 'pauseVideo'], ['player2', 'pauseVideo']];

    for (let i = 0; i < theseSockets.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop, no-loop-func
        await new Promise((resolve, reject) => {
            theseSockets[i]
                .on('playerControl', (message) => {
                    const expectedMessage = expectedMessages[socketMessageCounts[i]];
                    socketMessageCounts[i] += 1;

                    try {
                        message.should.deep.equal(expectedMessage);
                        if (socketMessageCounts[i] === expectedMessages.length) {
                            resolve();
                        }
                    } catch (err) {
                        reject(err);
                    }
                })
                .emit('playerStatus', ['player1', 'playing'])
                .emit('playerStatus', ['player2', 'playing'])
                .emit('playerStatus', ['player3', 'playing'])
                .emit('playerStatus', ['player4', 'playing'])
                .emit('playerStatus', ['player5', 'playing']);
        });
    }

    return theseSockets;
}

describe('server', function() {
    let server = {};
    let sockets = [];
    let consoleLog;

    beforeEach(function() {
        // suppress console.log messages elsewhere in the code
        consoleLog = console.log;
        console.log = () => {};

        server = serverSetup.listen(PORT);
    });

    afterEach(async function() {
        this.timeout(Math.max(20 * sockets.length, 2000));

        // restore console.log
        console.log = consoleLog;

        server.close();

        await closeAllSockets(sockets);
    });

    it('serverSetup should be an object', function() {
        serverSetup.should.be.a('object');
    });

    it("should respond with a 'pauseVideo' message if more than three status messages are sent for 1 connection", async function() {
        sockets = await createAndTestSockets(1);
    });

    it("should respond with a 'pauseVideo' message if more than three status messages are sent for 1000 connections", async function() {
        this.timeout(20e3);

        sockets = await createAndTestSockets(1000);
    });
});
