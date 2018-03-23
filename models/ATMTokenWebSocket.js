const ATMAbi = require('../build/contracts/ATMToken').abi;
const Web3 = require('web3');
const web3 = new Web3(process.env.ETH_WEB_SOCKET_PROVIDER);
const ATMTokenContract = new web3.eth.Contract(ATMAbi, process.env.ATM_ADDRESS);
// const atmTokenContract = ATMTokenContract.at(process.env.ATM_ADDRESS);

module.exports = ATMTokenContract;
