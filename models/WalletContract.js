const abi = require('../build/contracts/UserWallet').abi;
const web3 = require('./Web3');
const UserWalletContract = web3.eth.contract(abi);
const atmToken = require('./ATMToken');
const Promise = require('bluebird');

let WalletContract = {};
let contracts = {};

WalletContract.sweep = address => {
  let contract;
  try {
    contract = getContract(address);
  } catch (e) {
    winston.error(e.message, { address: address });
    return Promise.reject(e.message);
  }

  let balance = atmToken.balanceOf(address).toNumber();
  if (balance < process.env.MIN_ATM_SWEEP_AMOUNT) {
    return Promise.resolve([false, null]);
  }

  return sweep(contract, balance)
  .then(hash => {
    return [true, {
      balance: balance,
      hash: hash,
    }];
  });
};

const sweep = (contract, balance) => {
  let txObj = {
    from: process.env.ETH_COINBASE,
    to: contract.address,
    value: '0x0',
    gasPrice: process.env.ETH_GAS_PRICE,
  };
  return new Promise((resolve, reject) => {
    contract.sweep.sendTransaction(process.env.ATM_ADDRESS, balance, txObj, (err, hash) => {
      if (err) {
        return reject(err);
      }
      resolve(hash);
    });
  });
};

const getContract = address => {
  if (!contracts[address]) {
    contracts[address] = UserWalletContract.at(address);
  }
  return contracts[address];
};

module.exports = WalletContract;
