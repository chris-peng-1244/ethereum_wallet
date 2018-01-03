const express = require('express');
const router = express.Router();
const atmTokenContract = require('../models/ATMToken');
const ErrorCode = require('../models/ErrorCode');
const boom = require('boom');
const redisClient = require('../models/Redis');
const winston = require('winston');

router.post('/transfer-atm', (req, res, next) => {
  let txObj = {
    from: process.env.ETH_COINBASE,
    to: req.body.address,
    value: '0x0',
    gasPrice: process.env.ETH_GAS_PRICE,
    };
  try {
    atmTokenContract.transfer.sendTransaction(req.body.address, req.body.value, txObj, (err, hash) => {
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

router.post('/', (req, res, next) => {
  redisClient.rpopAsync('availableUserWalletAddressList')
  .then(address => {
    if (null == address || '' == address) {
      return next(boom.badImplementation('User wallet address list is empty'));
    }
    return res.json({
      code: 0,
      message: '',
      data: {
        address: address
      }
    });
  })
  .catch(e => {
    return next(boom.badImplementation(e.message));
  });
});

module.exports = router;
