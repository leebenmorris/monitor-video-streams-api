/* eslint-disable func-names, no-console */

const chai = require('chai');
const io = require('socket.io-client');

chai.should();

const serverSetup = require('./serverSetup');

const PORT = 1234;

describe('server', function() {
    let server;
    let sockets = [];
    let consoleLog;

    function successesToGather(num, done) {
        let numberOfSuccesses = 0;

        return () => {
            numberOfSuccesses += 1;
            if (numberOfSuccesses === num) {
                done();
            }
        };
    }

    function createSockets(num, done) {
        const gatherSuccesses = successesToGather(num, done);

        return Array(num)
            .fill(null)
            .map(() =>
                io(`http://localhost:${PORT}`)
                    .on('error', done)
                    .on('connect_error', done)
                    .on('connect', gatherSuccesses),
            );
    }

    beforeEach(function(done) {
        // suppress console.log messages elsewhere in the code
        // consoleLog = console.log;
        // console.log = () => {};

        server = serverSetup.listen(PORT);

        done();
    });

    afterEach(function(done) {
        // restore console.log
        // console.log = consoleLog;

        const gatherSuccesses = successesToGather(sockets.length + 1, done);

        server.on('close', gatherSuccesses);
        server.close();

        sockets.forEach((socket) => {
            socket.on('disconnect', gatherSuccesses);
            socket.close();
        });

        // gatherSuccesses();
    });

    it('serverSetup should be an object', function() {
        serverSetup.should.be.a('object');
    });

    it('should respond with a control message if more than three status messages are sent for a single connection', function(done) {
        sockets = createSockets(1, done);

        let messageCount = 0;
        const expectedMessages = [['player1', 'pauseVideo'], ['player2', 'pauseVideo']];

        sockets[0]
            .on('playerControl', (message) => {
                const expectedMessage = expectedMessages[messageCount];
                messageCount += 1;

                try {
                    message.should.deep.equal(expectedMessage);
                    if (messageCount === expectedMessages.length) {
                        done();
                    }
                } catch (err) {
                    done(err);
                }
            })
            .emit('playerStatus', ['player1', 'playing'])
            .emit('playerStatus', ['player2', 'playing'])
            .emit('playerStatus', ['player3', 'playing'])
            .emit('playerStatus', ['player4', 'playing'])
            .emit('playerStatus', ['player5', 'playing']);
    });

    it('should respond with a control message if more than three status messages are sent for a each connection', function(done) {
        sockets = createSockets(10, done);

        const socketMessageCounts = Array(sockets.length).fill(0);

        const expectedMessages = [['player1', 'pauseVideo'], ['player2', 'pauseVideo']];

        const gatherSuccesses = successesToGather(sockets.length, done);

        sockets.forEach((socket, i) => {
            socket
                .on('playerControl', (message) => {
                    const expectedMessage = expectedMessages[socketMessageCounts[i]];
                    socketMessageCounts[i] += 1;

                    try {
                        message.should.deep.equal(expectedMessage);
                        if (socketMessageCounts[i] === expectedMessages.length) {
                            gatherSuccesses();
                        }
                    } catch (err) {
                        done(err);
                    }
                })
                .emit('playerStatus', ['player1', 'playing'])
                .emit('playerStatus', ['player2', 'playing'])
                .emit('playerStatus', ['player3', 'playing'])
                .emit('playerStatus', ['player4', 'playing'])
                .emit('playerStatus', ['player5', 'playing']);
        });
    });
});
