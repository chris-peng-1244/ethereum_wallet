const router = require('express').Router();

router.get('/:txId', (req, res, next) => {
  let tx;
  try {
    tx = web3.eth.getTransaction(req.params.txId);
  } catch (e) {
    return res.status(400).json({
      code: ErrorCode.TRANSACTION_GET_ERROR,
      message: e.message,
    });
  }
});
