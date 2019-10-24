/* eslint-disable no-loop-func, func-names, no-console, no-restricted-syntax */

const chai = require('chai');
const io = require('socket.io-client');

const serverSetup = require('./serverSetup');

chai.should();

const PORT = 1234;

async function createSockets(num = 0, sockets = []) {
    if (sockets.length === num) return sockets;

    const newSocket = await new Promise((resolve, reject) => {
        io(`http://localhost:${PORT}`)
            .on('error', reject)
            .on('connect_error', reject)
            .on('connect', function() {
                resolve(this);
            });
    });

    return createSockets(num, sockets.concat(newSocket));
}

async function closeAllSockets(sockets = [], index = 0) {
    if (index === sockets.length) return;

    await new Promise((resolve) => {
        sockets[index].on('disconnect', resolve).close();
    });

    await closeAllSockets(sockets, index + 1);
}

async function runSocketTests(sockets = [], index = 0) {
    if (index === sockets.length) return;

    let messageCount = 0;
    const expectedMessages = [['player1', 'pauseVideo'], ['player2', 'pauseVideo']];

    await new Promise((resolve, reject) => {
        sockets[index]
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

    await runSocketTests(sockets, index + 1);
}

/**
 * ******** TEST SUITE ********
 */

describe('serverSetup', function() {
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
        this.timeout(Math.max(10 * sockets.length, this.timeout()));

        console.log(this.timeout());

        // restore console.log
        console.log = consoleLogBackup;

        await closeAllSockets(sockets);

        server.close();
    });

    it('should be an object', function() {
        serverSetup.should.be.a('object');
    });

    for (const numberOfSockets of [1, 1000]) {
        const messageVariation =
            numberOfSockets === 1 ? '1 connection' : `each of ${numberOfSockets} connections`;

        it(`should respond with a 'pauseVideo' message for the correct video player if more than three status messages are sent for ${messageVariation}`, async function() {
            // allow enough time to create and test all of the sockets
            this.timeout(Math.max(10 * numberOfSockets, 2000));

            sockets = await createSockets(numberOfSockets);

            await runSocketTests(sockets);
        });
    }
});
