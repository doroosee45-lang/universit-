const logger = require('../utils/logger');

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      user: req.user ? req.user._id : 'anonymous'
    };
    if (res.statusCode >= 400) logger.warn(JSON.stringify(logData));
    else logger.info(JSON.stringify(logData));
  });
  next();
};

module.exports = loggerMiddleware;