/* eslint-disable func-names, no-console */

const chai = require('chai');
const io = require('socket.io-client');

chai.should();

const serverSetup = require('./serverSetup');

const PORT = 1234;

describe('server', function() {
    let server;
    let socketOne;
    let socketTwo;
    let consoleLog;

    const successesToGather = (num, done) => {
        let numberOfSuccesses = 0;

        return () => {
            numberOfSuccesses += 1;
            if (numberOfSuccesses === num) {
                done();
            }
        };
    };

    beforeEach(function(done) {
        const gatherSuccesses = successesToGather(2, done);

        // suppress console.log messages elsewhere in the code
        consoleLog = console.log;
        console.log = () => {};

        server = serverSetup.listen(PORT);

        socketOne = io(`http://localhost:${PORT}`)
            .on('connect_error', done)
            .on('connect', gatherSuccesses);

        socketTwo = io(`http://localhost:${PORT}`)
            .on('connect_error', done)
            .on('connect', gatherSuccesses);
    });

    afterEach(function(done) {
        // restore console.log
        console.log = consoleLog;

        socketOne.close();
        socketTwo.close();
        server.close();
        done();
    });

    it('serverSetup should be an object', function() {
        serverSetup.should.be.a('object');
    });

    it('should respond with a control message if more than three status messages are sent for a single connection', function(done) {
        let messageCount = 0;
        const expectedMessages = [['player1', 'pauseVideo'], ['player2', 'pauseVideo']];

        socketOne
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
        let socketOneMessageCount = 0;
        let socketTwoMessageCount = 0;
        const expectedMessages = [['player1', 'pauseVideo'], ['player2', 'pauseVideo']];

        const gatherSuccesses = successesToGather(2, done);

        socketOne
            .on('playerControl', (message) => {
                const expectedMessage = expectedMessages[socketOneMessageCount];
                socketOneMessageCount += 1;

                try {
                    message.should.deep.equal(expectedMessage);
                    if (socketOneMessageCount === expectedMessages.length) {
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

        socketTwo
            .on('playerControl', (message) => {
                const expectedMessage = expectedMessages[socketTwoMessageCount];
                socketTwoMessageCount += 1;

                try {
                    message.should.deep.equal(expectedMessage);
                    if (socketTwoMessageCount === expectedMessages.length) {
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
