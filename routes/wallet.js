const express = require('express');
const router = express.Router();
const ATMAbi = require('../contracts/ATMToken').abi;
const ATMTokenContract = web3.eth.contract(ATMAbi);
const atmTokenContract = ATMTokenContract.at('0xxxxxx');

router.post('/transfer', (req, res, next) => {
  try {
    let tx = atmTokenContract.transfer(req.body.address, req.body.value);
  } catch (e) {
    return res.status(500).json({
      code: ErrorCode.ATM_TRANSFER_FAILED,
      message: e.message,
    });
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
