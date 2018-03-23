const router = require('express').Router();
const boom = require('boom');
const web3 = require('../models/Web3');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/:txId', async (req, res, next) => {
  let tx, txReceipt;
  try {
    tx = await web3.eth.getTransaction(req.params.txId)
    txReceipt = await web3.eth.getTransactionReceipt(req.params.txId);
  } catch (e) {
    return next(boom.badRequest(e.message, {
      txId: req.params.txId,
    }));
  }

  if (null === tx) {
    return next(boom.badRequest(`Can't find transaction ${req.params.txId}`));
  }

  const blockNumber = await web3.eth.getBlockNumber();
  tx.confirmationNumber = tx.blockNumber ? (blockNumber - tx.blockNumber) : 0;
  tx.gasUsed = 0;
  tx.gasPrice = web3.utils.fromWei(tx.gasPrice, "gwei");
  if (txReceipt) {
    tx.gasUsed = txReceipt.gasUsed || 0;
    tx.receipt = txReceipt;
  }
  // Override the value field
  if (tx.to.toLowerCase() == process.env.ATM_ADDRESS) {
    console.log("ATM tx input: " + tx.input);
    tx.value = getAtmValue(tx);
    // ATM transaction's to address is ATM contract address.
    // Replace it with the actually to address to which the transaction send.
    tx.to = getAtmToAddress(tx);
  } else {
    tx.value = web3.utils.fromWei(tx.value, "ether");
  }

  return res.json({
    code: 0,
    message: '',
    data: tx,
  });
});

function getAtmValue(tx)
{
  return parseInt(tx.input.substr(74), 16)/100000000;
}

function getAtmToAddress(tx)
{
  return '0x' + tx.input.substr(34, 40);
}

module.exports = router;
