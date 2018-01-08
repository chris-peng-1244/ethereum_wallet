const infra = require('./index');
const chai = infra.chai;
const server = infra.server;

describe('Users', () => {
  describe('POST /login', () => {
    it('should return the jwt when passing the correct user/pwd', () => {
      return chai.request(server)
      .post('/user/login')
      .send({
        username: 'coinmall',
        password: '123456',
      })
      .then(res => {
        res.should.have.status(200);
        res.body.code.should.equal(0);
        res.body.message.should.equal('');
        res.body.data.should.have.property('token');
      });
    });
  });
});
