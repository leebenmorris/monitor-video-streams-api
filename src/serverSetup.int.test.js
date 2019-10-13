/* eslint-disable func-names */

const chai = require('chai');
const io = require('socket.io-client');

chai.should();

const serverSetup = require('./serverSetup');

const PORT = 1234;

describe('server', function() {
    let server;
    let socket;

    beforeEach(function(done) {
        server = serverSetup.listen(PORT);
        socket = io(`http://localhost:${PORT}`)
            .on('connect_error', done)
            .on('connect', done);
    });

    afterEach(function(done) {
        socket.close();
        server.close();
        done();
    });

    it('serverSetup should be an object', function() {
        serverSetup.should.be.a('object');
    });

    it('should respond with a control message if more than three status messages are sent', function(done) {
        const expectedControlMessage = {
            player1: 'pauseVideo',
        };

        socket
            .once('playerControl', (message) => {
                try {
                    message.should.deep.equal(expectedControlMessage);
                    done();
                } catch (err) {
                    done(err);
                }
            })
            .emit('playerStatus', { player1: 'playing' })
            .emit('playerStatus', { player2: 'playing' })
            .emit('playerStatus', { player3: 'playing' })
            .emit('playerStatus', { player4: 'playing' });
    });
});
