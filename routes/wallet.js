const express = require('express');
const router = express.Router();
const atmTokenContract = require('../models/ATMToken');
const ErrorCode = require('../models/ErrorCode');
const boom = require('boom');

router.post('/transfer', (req, res, next) => {
  let tx;
  try {
    tx = atmTokenContract.transfer(req.body.address, req.body.value);
  } catch (e) {
    return next(boom.badImplementation(e.message, req.body));
  }

  return res.json({
    code: 0,
    message: '',
    data: {
      transactionHash: tx,
    }
  });
});

module.exports = router;
