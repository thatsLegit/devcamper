const ErrorResponse = require('../utils/errorResponse');

/*Middleware for error handling, basically we need it to return a json error
Indeed, the default error handling tool in express render html*/

const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    //Typically here, if the error is not CastError, we gonna have the default err message
    error.message = err.message;

    //log to console for dev
    console.log(err.stack.red);
    console.log(err.name);

    //Mongoose bad ObjectId
    if (err.name == 'CastError') {
        error = new ErrorResponse(`Resource not found with id ${err.value}`, 404);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server error'
    });
};

module.exports = errorHandler;