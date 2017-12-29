process.env.NODE_ENV = 'test';
process.env.PORT = 3001;

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();

chai.use(chaiHttp);

describe('Wallet', () => {
  describe('/POST transfer', () => {
    it('should return the transaction id', (done) => {
      chai.request(server)
      .post('/wallet/transfer')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        let body = res.body;
        console.log(body);
        done();
      })
      .catch(e => {
        console.log(e);
      });
    });
  });
});
