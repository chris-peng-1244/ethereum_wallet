const infra = require('./index');
const chai = infra.chai;
const server = infra.server;

let token;
describe('Transaction', () => {
  before(done => {
    infra.login().then(aToken => {
      token = aToken;
      done();
    });
  });

  describe('/GET :txId', () => {
    it('should return the transaction details', () => {
      let to = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
        chai.request(server)
        .post('/wallet/transfer-atm')
        .send({
          address: to,
          value: 1000,
          access_token: token,
        })
        .then(res => {
          return chai.request(server)
            .get(`/transaction/${res.body.data.transactionHash}/?access_token=${token}`);
        })
        .then(res => {
          let body = res.body;
          body.code.should.equal(0);
          body.message.should.equal('');
          body.data.from.should.equal(process.env.ETH_COINBASE);
          body.data.to.should.equal(to);
        })
        .catch(e => {
          throw new Error(e.message);
        });
    })
  });
});
