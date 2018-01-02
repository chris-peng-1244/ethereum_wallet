const infra = require('./index');
const chai = infra.chai;
const server = infra.server;

describe('Wallet', () => {
  describe('/POST transfer-atm', () => {
    it('should return the transaction id', () => {
      chai.request(server)
      .post('/wallet/transfer-atm')
      .send({
        address: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
        value: 1000
      })
      .then(res => {
        res.should.have.status(200);
        let body = res.body;
        body.code.should.equal(0);
        body.message.should.equal('');
        body.data.should.has.property('transactionHash');
      })
      .catch(e => {
        console.log(e);
      });
    });
  });
});
