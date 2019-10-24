/* eslint-disable no-await-in-loop, func-names, no-console, no-restricted-syntax */

const chai = require('chai');
const io = require('socket.io-client');

const serverSetup = require('./serverSetup');

chai.should();

const PORT = 1234;

async function createSocket() {
    return new Promise((resolve, reject) => {
        io(`http://localhost:${PORT}`)
            .on('error', reject)
            .on('connect_error', reject)
            .on('connect', function() {
                resolve(this);
            });
    });
}

async function createSockets(num = 1) {
    const localSockets = [];

    for (let i = 0; i < num; i += 1) {
        localSockets.push(await createSocket());
    }

    return localSockets;
}

async function closeSocket(socket = {}) {
    return new Promise((resolve) => {
        socket.on('disconnect', resolve);
        socket.close();
    });
}

async function closeSockets(sockets = []) {
    for (const socket of sockets) {
        await closeSocket(socket);
    }
}

async function testSockets(sockets = []) {
    for (const socket of sockets) {
        let messageCount = 0;
        const expectedMessages = [['player1', 'pauseVideo'], ['player2', 'pauseVideo']];

        await new Promise((resolve, reject) => {
            socket
                .on('playerControl', (message) => {
                    const expectedMessage = expectedMessages[messageCount];

                    messageCount += 1;

                    try {
                        message.should.deep.equal(expectedMessage);
                        if (messageCount === expectedMessages.length) {
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
}

describe('server', function() {
    let server = {};
    let sockets = [];
    let consoleLogBackup;

    beforeEach(function() {
        // suppress console.log messages elsewhere in the code
        consoleLogBackup = console.log;
        console.log = () => {};

        server = serverSetup.listen(PORT);
    });

    afterEach(async function() {
        // allow enough time to close all of the sockets
        this.timeout(Math.max(10 * sockets.length, 2000));

        // restore console.log
        console.log = consoleLogBackup;

        await closeSockets(sockets);

        server.close();
    });

    it('serverSetup should be an object', function() {
        serverSetup.should.be.a('object');
    });

    it("should respond with a 'pauseVideo' message if more than three status messages are sent for 1 connection", async function() {
        const numberOfSockets = 1;

        sockets = await createSockets(numberOfSockets);

        await testSockets(sockets);
    });

    it("should respond with a 'pauseVideo' message if more than three status messages are sent for each of 1000 connections", async function() {
        const numberOfSockets = 1000;

        this.timeout(Math.max(10 * numberOfSockets, 2000));

        sockets = await createSockets(numberOfSockets);

        await testSockets(sockets);
    });
});
