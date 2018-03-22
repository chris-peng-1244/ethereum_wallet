const Tx = require('ethereumjs-tx');

const TransactionSigner = (pk) => {
    const privateKey = pk;

    return Object.freeze({
        sign: (txObj) => {
            const pkBuffer = new Buffer(privateKey, 'hex');
            const tx = new Tx(txObj);
            tx.sign(pkBuffer);
            return '0x' + tx.serialize().toString('hex');
        }
    });
};

module.exports = TransactionSigner;