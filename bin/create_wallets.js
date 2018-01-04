require('dotenv').config();
const web3 = require('../models/Web3');
const contract = require("truffle-contract");
const redisClient = require('../models/Redis');
const Promise = require('bluebird');
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
  for (i = 0; i < 10; i++) {
    addresses.push(inst.makeWallet());
  }
  return Promise.map(addresses, tx => {
    console.log(`Create a new wallet ${tx.logs[0].args.receiver}`);
    return redisClient.rpushAsync('coinmall_available_addresses', tx.logs[0].args.receiver+':'+tx.tx);
  });
})
.then(() => {
  console.log('Done');
  redisClient.quit();
})
.catch(e => {
  console.log(e);
  redisClient.quit();
});
