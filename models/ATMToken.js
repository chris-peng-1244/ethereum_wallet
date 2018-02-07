const ATMAbi = require('../build/contracts/ATMToken').abi;
const web3 = require('./Web3');
const ATMTokenContract = web3.eth.contract(ATMAbi);
const atmTokenContract = ATMTokenContract.at(process.env.ATM_ADDRESS);

module.exports = atmTokenContract;
