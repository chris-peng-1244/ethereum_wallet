const infra = require('./index');
const chai = infra.chai;
const server = infra.server;

describe('Transaction', () => {
  describe('/GET :txId', () => {
    it('should return the transaction details', () => {
      let to = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
      chai.request(server)
      .post('/wallet/transfer-atm')
      .send({
        address: to,
        value: 1000
      })
      .then(res => {
        return chai.requeust(server)
        .get(`/transaction/${res.body.data.transactionHash}`);
      })
      .then(res => {
        body.code.should.equal(0);
        body.message.should.equal('');
        body.data.from.should.be(process.env.ETH_COINBASE);
        body.data.to.should.be(to);
      })
      .catch(e => {
        console.log(e);
      });
    });
  });
});
