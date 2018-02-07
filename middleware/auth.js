const jwt = require('jsonwebtoken');
const boom = require('boom');

module.exports = (req, res, next) => {
  let token = req.token;
  if (req.query.debug == 1 && req.app.get('env') == 'development') {
    return next();
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(boom.unauthorized());
    }
    next();
  });
};
