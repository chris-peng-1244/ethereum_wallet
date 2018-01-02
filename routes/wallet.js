const express = require('express');
const router = express.Router();
const atmTokenContract = require('../models/ATMToken');
const ErrorCode = require('../models/ErrorCode');
const boom = require('boom');

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
    console.log(e);
    return next(boom.badImplementation(e.message, req.body));
  }

});

module.exports = router;
