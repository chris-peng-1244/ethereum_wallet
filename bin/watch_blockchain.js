require('dotenv').config();
require('colors');

const redisClient = require('../models/Redis');
const request = require('request-promise');

const atmToken = require('../models/ATMToken');
const web3 = require('../models/Web3');

const LATEST_BLOCKNUMBER_KEY = 'coinmall_watched_latest_blocknumber';
const WATCHED_TRANSACTION_KEY = 'coinmall_watched_transactions';

let transferEvent;
redisClient.getAsync(LATEST_BLOCKNUMBER_KEY)
.then(number => {
  if (isNaN(number)) {
    number = web3.eth.blockNumber > 1000 ? web3.eth.blockNumber - 1000 : 0;
  }

  console.log(`Start watch from block ${number}`);
  transferEvent = atmToken.Transfer({}, {
    fromBlock: number,
    toBlocK: 'latest',
  });

  transferEvent.watch((err, result) => {
    if (err) {
      console.err(err.red);
    } else {
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
    }
  });
});

process.on('SIGINT', () => {
  console.log('Quitting...'.red);
  let blockNumber = web3.eth.blockNumber;
  console.log(`The latest block number is ${blockNumber}`);
  redisClient.setAsync(LATEST_BLOCKNUMBER_KEY, blockNumber)
  .then(() => {
    redisClient.quit();
    transferEvent.stopWatching();
    process.exit(0);
  })
  .catch(e => {
    console.log(`Exception during quitting: e.message`.red.bold);
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
      return request(getRechargeCallbackUrl(toAddress, args._value.toNumber()));
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

function getRechargeCallbackUrl(to, value)
{
  let url = `${process.env.COINMALL_SERVER_HOST}/recharge/${value}/3`;
  console.log(`Sending callback to ` + url.green);
}
