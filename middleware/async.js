/*Instead of using try/catch is the controllers for error handling,
we can optimize it using this middleware.
The catch is ofc still calling the error middleware in case of wrong formatting (CastError)*/

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = asyncHandler;