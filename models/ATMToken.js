const ATMAbi = require('../build/contracts/ATMToken').abi;
const web3 = require('./Web3');
const ATMTokenContract = new web3.eth.Contract(ATMAbi, process.env.ATM_ADDRESS);

module.exports = ATMTokenContract;
