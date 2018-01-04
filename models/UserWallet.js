const AVAILABLE_USER_WALLET_ADDRESSES = 'availableUserWalletAddressList';
const USER_WALLET_ADDRESSES = 'coinmall_user_wallet_addresses';
const redisClient = require('./Redis');
const Promise = require('bluebird');
const walletContract = require('./WalletContract');

var UserWallet = {};

/**
 * Push an address from the pre-created address set,
 * then add the address to a watch list, thus when new transfer
 * occurs at this address, we can react to it.
 *
 * Throws Error when the pre-created address set is empty.
 *
 * @return Promise
 */
UserWallet.create = () => {
  let address;
  return redisClient.rpopAsync(AVAILABLE_USER_WALLET_ADDRESSES)
    .then(addr => {
      if (null == addr || '' == addr) {
        return new Error('User wallet address list is empty');
      }
      address = addr.split(':')[0];
      return redisClient.sadd(USER_WALLET_ADDRESSES, address);
    })
    .then(() => {
      return address;
    });
};

/**
 * Return all the addresses in the watch list.
 *
 * @return Promise
 */
UserWallet.findAll = () => {
  return redisClient.smembersAsync(USER_WALLET_ADDRESSES);
};

/**
 * Collect user's atm from their wallet
 */
UserWallet.sweep = address => {
  try {
    return walletContract.sweep(address);
  } catch (e) {
    console.log(e);
    return new Error(e);
  }
};

module.exports = UserWallet;
module.exports.AVAILABLE_USER_WALLET_ADDRESSES = AVAILABLE_USER_WALLET_ADDRESSES;
module.exports.USER_WALLET_ADDRESSES = USER_WALLET_ADDRESSES;
