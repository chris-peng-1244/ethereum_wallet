require('dotenv').config();
require('colors');

const redisClient = require('../models/Redis');
const request = require('request-promise');

const atmToken = require('../models/ATMTokenWebSocket');
const web3 = require('../models/Web3');

const LATEST_BLOCKNUMBER_KEY = 'coinmall_watched_latest_blocknumber';
const WATCHED_TRANSACTION_KEY = 'coinmall_watched_transactions';

let transferEvent;
redisClient.getAsync(LATEST_BLOCKNUMBER_KEY)
.then(number => {
  if (isNaN(number) || (null === number)) {
    return web3.eth.getBlockNumber((err, blockNumber) => {
      return (blockNumber > 1000) ? (blockNumber - 1000) : 0;
    });
  }
  return number;
}).then(number => {
  console.log(`Start watch from block ${number}`);
  transferEvent = atmToken.events.Transfer({
    fromBlock: number,
  })
  .on('data', result => {
    console.log(`Catch transfer event ` + result.transactionHash.green);
    redisClient.sismemberAsync(WATCHED_TRANSACTION_KEY, result.transactionHash)
      .then(bool => {
        if (!bool) {
          return callRechargeCallback(result);
        }
        console.log('Ingoring watched transaction'.yellow);
      })
      .then(() => {
        console.log(`Done.`);
      })
      .catch(e => {
        console.error(e.message.red.bold);
      });
  })
  .on('error', console.error);
});

process.on('SIGINT', () => {
  console.log('Quitting...'.red);
  web3.eth.getBlockNumber((err, blockNumber) => {
    console.log(`The latest block number is ${blockNumber}`);
    return redisClient.setAsync(LATEST_BLOCKNUMBER_KEY, blockNumber);
  })
  .then(() => {
    redisClient.quit();
    // transferEvent.stopWatching();
    process.exit(0);
  })
  .catch(e => {
    console.log(`Exception during quitting: ${e.message}`.red.bold);
    process.exit(1);
  });
});

function callRechargeCallback(event)
{
  let args = event.args;
  let toAddress = args._to.toLowerCase();
  return redisClient.saddAsync(WATCHED_TRANSACTION_KEY, event.transactionHash)
  .then(() => {
    return isInterestedAddress(toAddress);
  })
  .then(bool => {
    if (bool) {
      return request(getRechargeCallbackUrl(toAddress, event.transactionHash));
    }
    console.log(`Ignore event, because ${toAddress} is not in the user wallet list`);
  })
  .catch(e => {
    console.log(e.message.red.bold);
  });
}

function isInterestedAddress(address)
{
  return redisClient.sismemberAsync('coinmall_user_wallet_addresses', address);
}

function getRechargeCallbackUrl(to, txId)
{
  let url = `${process.env.COINMALL_SERVER_HOST}/recharge/${txId}/3`;
  console.log(`Sending callback to ` + url.green);
  return url;
}
