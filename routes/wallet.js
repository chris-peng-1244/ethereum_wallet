const express = require('express');
const router = express.Router();
const atmTokenContract = require('../models/ATMToken');
const ErrorCode = require('../models/ErrorCode');
const boom = require('boom');
const redisClient = require('../models/Redis');
const auth = require('../middleware/auth');
const UserWallet = require('../models/UserWallet');
const web3 = require('../models/Web3');
const signer = require('../models/TransactionSigner')(process.env.PRIVATE_KEY);

router.use(auth);

router.post('/transfer-atm', (req, res, next) => {
  let atmValue = req.body.value * 100000000;
  getTransferTokenRawTransaction(req.body.address, atmValue)
  .then(rawTx => {
    return web3.eth.sendSignedTransaction(rawTx)
      .on('transactionHash', hash => {
        return res.json({
          code: 0,
          message: '',
          data: {
            transactionHash: hash,
          }
        });
      })
      .on('error', err => {
        return next(boom.badImplementation(err, req.body));
      });
  });
});

function getTransferTokenRawTransaction(to, atmValue)
{
  const gasLimit = 60000;
  const gasPrice = parseInt(process.env.ETH_GAS_PRICE);
  return web3.eth.getTransactionCount(process.env.ETH_COINBASE)
  .then(nonce => {
    let txObj = {
      nonce: '0x' + nonce.toString(16),
      from: process.env.ETH_COINBASE,
      to: process.env.ATM_ADDRESS,
      value: '0x0',
      gasPrice: '0x' + gasPrice.toString(16),
      gasLimit: '0x' + gasLimit.toString(16),
    };
    let data = '0xa9059cbb';
    data += to.substr(2).padStart(64, '0');
    atmValue = atmValue.toString(16);
    data += atmValue.padStart(64, '0');
    txObj['data'] = data;
    return signer.sign(txObj);
  });
}

router.post('/transfer', (req, res, next) => {
  let txObj = {
    from: process.env.ETH_COINBASE,
    to: req.body.address,
    value: web3.toWei(req.body.value, "ether"),
    gasPrice: process.env.ETH_GAS_PRICE,
    };
  try {
    var tx = web3.eth.sendTransaction(txObj);
    return res.json({
        code: 0,
        message: '',
        data: {
          transactionHash: tx,
        }
      });
  } catch (e) {
    return next(boom.badImplementation(e.message, req.body));
  }
});

router.post('/', (req, res, next) => {
  UserWallet.create()
  .then(result => {
    return res.json({
      code: 0,
      message: '',
      data: {
        address: result[0],
        transaction: result[1],
      }
    });
  })
  .catch(e => {
    return next(boom.badImplementation(e.message));
  });
});

module.exports = router;
