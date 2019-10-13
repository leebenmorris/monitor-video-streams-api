/* eslint-disable func-names */

const chai = require('chai');
const io = require('socket.io-client');

chai.should();

const serverSetup = require('./serverSetup');

const PORT = 1234;

describe('server', function() {
    let server;
    let socket;
    // let consoleLog;

    beforeEach(function(done) {
        // suppress console.log messages elsewhere in the code
        consoleLog = console.log;
        console.log = () => {};

        server = serverSetup.listen(PORT);
        socket = io(`http://localhost:${PORT}`)
            .on('connect_error', done)
            .on('connect', done);
    });

    afterEach(function(done) {
        // restore console.log
        console.log = consoleLog;

        socket.close();
        server.close();
        done();
    });

    it('serverSetup should be an object', function() {
        serverSetup.should.be.a('object');
    });

    it('should respond with a control message if more than three status messages are sent', function(done) {
        let messageCount = 0;
        const expectedMessages = [['player1', 'pauseVideo'], ['player2', 'pauseVideo']];

        socket
            .on('playerControl', (message) => {
                const expectedMessage = expectedMessages[messageCount];
                messageCount += 1;

                console.log({ messageInTest: message });

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
});
