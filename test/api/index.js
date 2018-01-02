process.env.NODE_ENV = 'test';
process.env.PORT = 3001;

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();

chai.use(chaiHttp);

exports.chai = chai;
exports.server = server;
