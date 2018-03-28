require('dotenv').config();
require('colors');
const web3 = require('../models/Web3');
const Promise = require('bluebird');
const Crawler = require('crawler');
const userWalletAddressList = require('../models/UserWalletAddressList');

const startBlock = 4648633;
const endBlock = 4658258;

const c = new Crawler({
  maxConnections: 10,
  callback: async (err, res, done) => {
    if (err) {
      console.log(err);
    } else {
      const contractId = findCreateContractFromPage(res.$);
      if (contractId && contractId.length == 42) {
        await saveContract(contractId);
      }
    }
    done();
  }
});

scanBlocks(startBlock, endBlock)
.then(num => {
  console.log(num);
})
.catch(e => {
  console.error(e);
});

async function scanBlocks(start, end)
{
  for (let i = start; i <= end; i++) {
    try {
      const block = await getBlock(i);
      console.log(`Diggint into ${i}`);
      const contracts = await findCreatedContratcs(block.transactions);
      // await saveContracts(contracts);
    } catch (e) {
    }
  }
  return true;
}

async function getBlock(blockNumber)
{
  return await web3.eth.getBlock(blockNumber);
}

async function findCreatedContratcs(txIds)
{
  let txList = [];
  txIds.forEach(txId => {
    txList.push(findCreateContract(txId)); 
  });
  await Promise.all(txList);
  return [];
}

async function findCreateContract(txId)
{
  let tx;
  try {
    tx = await web3.eth.getTransaction(txId);
    if (tx) {
      console.log(`Tx: ${tx.hash}`);
    }
  } catch (e) {
    return null;
  }

  if (tx && tx.to 
    && tx.to.toLowerCase() == "0xe01c5efcc674a72eb690670ed3f63624542ffbc3") {
      c.queue(`https://etherscan.io/tx/${txId}#internal`);
    return tx;
  }
  return null;
}

function findCreateContractFromPage($)
{
  const addressTags = $('.address-tag');
  if (addressTags.length >= 4) {
    return addressTags.eq(3).html();
  }
  return '';
}

async function saveContract(contractId)
{
  await userWalletAddressList.addAddress(contractId);
}