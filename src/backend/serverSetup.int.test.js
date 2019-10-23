/* eslint-disable func-names, no-console */
const { promisify } = require('util');

const asyncSetImmediate = promisify(setImmediate);

const chai = require('chai');
const io = require('socket.io-client');

chai.should();

const serverSetup = require('./serverSetup');

const PORT = 1234;

describe('server', function() {
    let server;
    let sockets = [];
    let consoleLog;

    async function createSocket(index = 0) {
        return new Promise((resolve, reject) => {
            const socket = io(`http://localhost:${PORT}`);

            socket
                .on('error', reject)
                .on('connect_error', reject)
                .on('connect', () => {
                    // console.log(`socket ${index} is connected`);
                    resolve(socket);
                });
        });
    }

    async function createSockets(num = 1) {
        const theseSockets = [];

        for (let i = 0; i < num; i += 1) {
            // console.log(`creating socket ${i}`);
            // eslint-disable-next-line no-await-in-loop
            await asyncSetImmediate();
            // eslint-disable-next-line no-await-in-loop
            theseSockets.push(await createSocket(i));
        }

        return theseSockets;
    }

    beforeEach(async function() {
        // suppress console.log messages elsewhere in the code
        consoleLog = console.log;
        console.log = () => {};

        server = serverSetup.listen(PORT);
    });

    afterEach(async function() {
        this.timeout(100e3);
        // restore console.log
        console.log = consoleLog;

        server.close();

        // eslint-disable-next-line no-restricted-syntax
        for (let i = 0; i < sockets.length; i += 1) {
            // eslint-disable-next-line
            await asyncSetImmediate();
            // eslint-disable-next-line
            await new Promise((resolve) => {
                sockets[i].on('disconnect', () => {
                    // console.log(`socket ${i} is disconnected`);
                    resolve();
                });
                sockets[i].close();
            });
        }
    });

    it('serverSetup should be an object', function() {
        serverSetup.should.be.a('object');
    });

    it('should respond with a control message if more than three status messages are sent for a single connection', async function() {
        const numberOfSockets = 1;

        sockets = await createSockets(numberOfSockets);

        const socketMessageCounts = Array(sockets.length).fill(0);

        const expectedMessages = [['player1', 'pauseVideo'], ['player2', 'pauseVideo']];

        await Promise.all(
            sockets.map(async (socket, i) => {
                return new Promise((resolve, reject) => {
                    socket
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
            }),
        );
    });

    it('should respond with a control message if more than three status messages are sent for a each connection', async function() {
        this.timeout(100e3);

        const numberOfSockets = 1e3;

        sockets = await createSockets(numberOfSockets);

        const socketMessageCounts = Array(sockets.length).fill(0);

        const expectedMessages = [['player1', 'pauseVideo'], ['player2', 'pauseVideo']];

        for (let i = 0; i < sockets.length; i += 1) {
            // eslint-disable-next-line no-await-in-loop, no-loop-func
            await new Promise((resolve, reject) => {
                sockets[i]
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
    });
});
