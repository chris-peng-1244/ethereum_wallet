const Redis = require('../models/Redis');
const AVAILABLE_USER_WALLET_ADDRESSES = 'coinmall_available_addresses';
const USER_WALLET_ADDRESSES = 'coinmall_user_wallet_addresses';

const UserWalletAddressList = () => {
  return Object.freeze({
    addAddress: async address => {
      if (await Redis.sismemberAsync(USER_WALLET_ADDRESSES, address)) {
        return false;
      }
      await Redis.rpushAsync(AVAILABLE_USER_WALLET_ADDRESSES, address);
      return true;
    },
    getAddress: async () => {
      const len = await Redis.llenAsync(AVAILABLE_USER_WALLET_ADDRESSES);
      if (len > 0) {
        return await Redis.rpopAsync(AVAILABLE_USER_WALLET_ADDRESSES);
      }
      return null;
    }
  });
};

module.exports = UserWalletAddressList();