require('dotenv').config();
const web3 = require('../models/Web3');
const contract = require("truffle-contract");
const redisClient = require('../models/Redis');
const Promise = require('bluebird');
const Async = require('async');
const Controller = contract(require('../build/contracts/Controller'));
Controller.setProvider(web3.currentProvider);
Controller.defaults({
  from: process.env.ETH_COINBASE,
  gasPrice: process.env.ETH_GAS_LIMIT,
  gas: 900000,
});

Controller.deployed()
.then(inst => {
  let addresses = [];
  for (i = 0; i < 40; i++) {
    addresses.push(inst.makeWallet());
  }

  return saveAddresses(addresses);
})
.then(() => {
  console.log('Done');
  redisClient.quit();
})
.catch(e => {
  console.log(e.message);
  redisClient.quit();
});

let saveAddresses = addresses => {
  return new Promise((resolve) => {
    Async.eachLimit(addresses, 2, (address, callback) => {
      address
        .then(tx => {
          console.log(`Create a new wallet ${tx.logs[0].args.receiver}`);
          return redisClient.rpushAsync('coinmall_available_addresses', tx.logs[0].args.receiver+':'+tx.tx);
        })
        .then(() => {
          callback();
        })
        .catch(e => {
          console.log(e.message);
          callback(e.message);
        });
    }, err => {
      if (err) {
        console.log(err);
      }
      resolve();
    });
  });
};
