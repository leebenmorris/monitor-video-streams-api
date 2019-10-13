/* eslint-disable func-names */
const chai = require('chai');

chai.should();

const serverSetup = require('./serverSetup');

describe('server', function() {
    it('serverSetup should be an object', function() {
        serverSetup.should.be.a('object');
    });
});
