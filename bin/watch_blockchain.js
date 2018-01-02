require('dotenv').config();

const redis = require('redis');
const Promise = require('bluebird');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
const redisClient = redis.createClient();
const request = require('request-promise');

const atmToken = require('../models/ATMToken');
const transferEvent = atmToken.Transfer();

transferEvent.watch((err, result) => {
  if (err) {
    console.err(err);
  } else {
    console.log(`Catch transfer event ${result.transactionHash}`);
    callRechargeCallback(result);
  }
});

function callRechargeCallback(event)
{
  let args = event.args;
  return isInterestedAddress(args._to)
  .then(bool => {
    if (bool) {
      return request(getRechargeCallbackUrl(args._to, args._value.toNumber()));
    }
    console.log(`Ignore event, because ${args._to} is not in the user wallet list`);
  })
  .catch(e => {
    console.log(e.message);
  });
}

function isInterestedAddress(address)
{
  return redisClient.sismemberAsync('coinmall_user_wallet_addresses', address);
}

function getRechargeCallbackUrl(to, value)
{
  let url = `${process.env.COINMALL_SERVER_HOST}/recharge/${value}/3`;
  console.log(`Sending callback to ${url}`);
}
