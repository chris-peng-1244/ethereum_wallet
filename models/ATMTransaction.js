const TRANSFER_METHOD = '0xa9059cbb';

const ATMTransaction = tx => {
    const transaction = tx;
    return Object.freeze({
        hash: () => {
            return transaction.hash;
        },
        isValid: () => {
            return transaction.input.startsWith(TRANSFER_METHOD);            
        },
        getValue: () => {
            return parseInt(transaction.input.substr(74), 16) / 100000000;
        },
        getToAddress: () => {
            return '0x' + transaction.input.substr(34, 40);
        }
    });
};

module.exports = ATMTransaction;