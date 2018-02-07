const express = require('express');
const router = express.Router();
const atmTokenContract = require('../models/ATMToken');
const ErrorCode = require('../models/ErrorCode');
const boom = require('boom');
const redisClient = require('../models/Redis');
const auth = require('../middleware/auth');
const UserWallet = require('../models/UserWallet');
const web3 = require('../models/Web3');

router.use(auth);

router.post('/transfer-atm', (req, res, next) => {
  let txObj = {
    from: process.env.ETH_COINBASE,
    to: req.body.address,
    value: '0x0',
    gasPrice: process.env.ETH_GAS_PRICE,
    };
  let atmValue = req.body.value * 100000000;
  try {
    atmTokenContract.transfer.sendTransaction(req.body.address, atmValue, txObj, (err, hash) => {
      if (err) {
        return next(boom.badImplementation(err, req.body));
      }
      return res.json({
        code: 0,
        message: '',
        data: {
          transactionHash: hash,
        }
      });
    });
  } catch (e) {
    return next(boom.badImplementation(e.message, req.body));
  }

});

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
