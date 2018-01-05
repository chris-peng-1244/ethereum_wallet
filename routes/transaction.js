const router = require('express').Router();
const boom = require('boom');
const web3 = require('../models/Web3');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/:txId', (req, res, next) => {
  let tx, txReceipt;
  try {
    tx = web3.eth.getTransaction(req.params.txId);
    txReceipt = web3.eth.getTransactionReceipt(req.params.txId);
  } catch (e) {
    return next(boom.badRequest(e.message, {
      txId: req.params.txId,
    }));
  }

  if (null === tx) {
    return next(boom.badRequest(`Can't find transaction ${req.params.txId}`));
  }

  tx.confirmationNumber = web3.eth.blockNumber - tx.blockNumber;
  tx.gasUsed = 0;
  if (txReceipt) {
    tx.gasUsed = txReceipt.gasUsed || 0;
    tx.receipt = txReceipt;
  }
  tx.valueInEth = web3.fromWei(tx.value, "ether");

  return res.json({
    code: 0,
    message: '',
    data: tx,
  });
});

module.exports = router;
