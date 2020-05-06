// @log requests to console
// This middleware isn't actually used, it's similar to morgan dependency

const logger = (req, res, next) => {
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    next();
}

module.exports = logger;