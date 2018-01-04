require('dotenv').config();
const redisClient = require('../models/Redis');
const winston = require('winston');
const UserWallet = require('../models/UserWallet');
const Promise = require('bluebird');
const Async = require('async');
require('colors');

UserWallet
.findAll()
.then(addresses => {
  return sweepAddresses(addresses);
})
.then(() => {
  exit();
})
.catch(e => {
  exit(e.message);
});

var sweepAddresses = Promise.promisify(addresses => {
  Async.eachLimit(addresses, 5, sweep, exit);
});

function exit(error)
{
  redisClient.quit();
  if (error) {
    winston.error(error);
    console.error(error.red);
    return process.exit(1);
  }
  console.log(`Sweeping done`);
  process.exit(0);
}

function sweep(address, callback)
{
  console.log(`Sweeping ${address.green}`);
  UserWallet.sweep(address)
  .then(result => {
    let bool = result[0];
    let txHash = result[1];
    if (bool == false) {
      console.log('Skip sweeping since there isn\'t enough ATM');
    } else {
      console.log(`Sweep transaction ${txHash.green}`);
    }
  })
  .catch(e => {
    console.error(`Error occured while sweeping ${address.green}: ` + e.message.red);
  })
  .finally(callback);
}
