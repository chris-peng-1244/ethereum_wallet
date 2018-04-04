require('dotenv').config();
require('colors');

const redisClient = require('../models/Redis');
const request = require('request-promise');
const web3 = require('../models/Web3');
const ATMTransaction = require('../models/ATMTransaction');
const Promise = require('bluebird');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const LATEST_BLOCKNUMBER_KEY = 'coinmall_watched_latest_blocknumber';
const WATCHED_TRANSACTION_KEY = 'coinmall_watched_transactions';
const FAILED_TRANSACTION_KEY = 'coinmall_scan_failed_transaction_keys';

redisClient.getAsync(LATEST_BLOCKNUMBER_KEY)
    .then(async (number) => {
        let latestNumber = await web3.eth.getBlockNumber();
        if (isNaN(number) || (null === number)) {
            number = (latestNumber > 100) ? (latestNumber - 100) : 0;
        }
        while (true) {
            if (number < latestNumber) {
                for (let i = number; i <= latestNumber; i++) {
                    await scanTransactionsInBlock(i);
                    await redisClient.setAsync(LATEST_BLOCKNUMBER_KEY, i);
                }
                number = latestNumber + 1;
            } else {
                await setTimeoutPromise(100);
                latestNumber = await web3.eth.getBlockNumber();
            }
        }
    });


async function scanTransactionsInBlock(blockNumber) {
    const block = await web3.eth.getBlock(blockNumber);
    console.log("Digging into " + blockNumber + " " + block.hash.green.bold);
    await scanTransactions(block.transactions);
}

async function scanTransactions(transactions)
{
    const pageSize = 20;
    const page = Math.ceil(transactions.length / pageSize);
    for (let i = 0; i < page; i++) {
        let promises = [];
        let transactionSlice = transactions.slice(i*pageSize, (i+1)*pageSize);
        transactionSlice.forEach(tx => {
            promises.push(scanTransaction(tx));
        });
        try {
            await Promise.all(promises)
        } catch (e) {
            console.error(e);
        }
    }
}

async function scanTransaction(txHash)
{
    console.log(`Scanning transaction ${txHash}...`);
    try {
        var tx = await web3.eth.getTransaction(txHash);
    } catch (e) {
        await redisClient.rpushAsync(FAILED_TRANSACTION_KEY, txHash);
        return;
    }

    if (null === tx || null === tx.to 
        || tx.to.toLowerCase() !== process.env.ATM_ADDRESS) {
        return;
    }
    console.log("This transaction's to adress is ATM address");
    const tokenTx = ATMTransaction(tx);
    if (!tokenTx.isValid()) {
        return;
    }
    console.log(`Find Atm transaction ${tx.hash.red}`);
    const foundBefore = await redisClient.sismemberAsync(WATCHED_TRANSACTION_KEY, tokenTx.hash());
    if (!foundBefore) {
        await callRechargeCallback(tokenTx);
    }
}

process.on('SIGINT', () => {
    console.log('Quitting...'.red);
    redisClient.quit();
    process.exit(0);
});

async function callRechargeCallback(tx) {
    const toAddress = tx.getToAddress();
    await redisClient.saddAsync(WATCHED_TRANSACTION_KEY, tx.hash());
    const isInterested = await isInterestedAddress(toAddress);
    if (isInterested) {
        await request(getRechargeCallbackUrl(toAddress, tx.hash()));
    } else {
        console.log(`Ignore event, because ${toAddress} is not in the user wallet list`);
    }
}

async function isInterestedAddress(address) {
    return redisClient.sismemberAsync('coinmall_user_wallet_addresses', address);
}

function getRechargeCallbackUrl(to, txId) {
    let url = `${process.env.COINMALL_SERVER_HOST}/recharge/${txId}/3`;
    console.log(`Sending callback to ` + url.green);
    return url;
}
