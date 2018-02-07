var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var boom = require('boom');

router.post('/login', (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password+'';

  if (username !== 'coinmall') {
    return next(boom.badRequest('Username or password is wrong'));
  }
  bcrypt.compare(password, process.env.COINMALL_PASSWORD, (err, result) => {
    if (err) {
      return next(boom.badImplementation(err));
    }
    if (!result) {
      return next(boom.badRequest('Username or password is wrong'));
    }
    return res.json({
      code: 0,
      message: '',
      data: {
        token: jwt.sign({
          username: username,
          exp: Math.floor(Date.now() / 1000) + 3600,
        }, process.env.JWT_SECRET)
      }
    });
  });
});

module.exports = router;
