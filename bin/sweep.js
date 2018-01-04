const redisClient = require('../models/Redis');
const winston = require('winston');
const UserWallet = require('../models/UserWallet');
require('colors');

UserWallet
  .findAll()
  .catch(e => {
    winston.error(e.message);
  });
