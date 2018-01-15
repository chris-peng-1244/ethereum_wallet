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

  tx.confirmationNumber = tx.blockNumber ? web3.eth.blockNumber - tx.blockNumber : 0;
  tx.gasUsed = 0;
  if (txReceipt) {
    tx.gasUsed = txReceipt.gasUsed || 0;
    tx.receipt = txReceipt;
  }
  // Override the value field
  if (tx.to == process.env.ATM_ADDRESS) {
    tx.value = getAtmValue(tx);
  } else {
    tx.value = web3.fromWei(tx.value, "ether");
  }

  return res.json({
    code: 0,
    message: '',
    data: tx,
  });
});

function getAtmValue(tx)
{
  if (tx.receipt && tx.receipt.logs && tx.receipt.logs[0]) {
    return parseInt(tx.receipt.logs[0].data, 16);
  }
  return 0;
}

module.exports = router;
