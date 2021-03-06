const infra = require('./index');
const chai = infra.chai;
const server = infra.server;

let token;
describe('Wallet', () => {
  before(done => {
    infra.login().then(aToken => {
      token = aToken;
      done();
    });
  });

  describe('/POST transfer-atm', () => {
    it('should return the transaction id', () => {
      return chai.request(server)
      .post('/wallet/transfer-atm')
      .send({
        address: process.env.TEST_TO_ADDRESS,
        value: 1000,
        access_token: token,
      })
      .then(res => {
        res.should.have.status(200);
        let body = res.body;
        body.code.should.equal(0);
        body.message.should.equal('');
        body.data.should.has.property('transactionHash');
      });
    });
  });

  describe('/POST create wallet', () => {
    it('should return the wallet address', () => {
      return chai.request(server)
      .post('/wallet')
      .send({
        access_token: token,
      })
      .then(res => {
        res.should.have.status(200);
        res.body.code.should.equal(0);
        res.body.data.should.has.property('address');
        res.body.data.address.length.should.equal(42);
      });
    });
  });
});
