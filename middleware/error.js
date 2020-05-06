/*Middleware for error handling, basically we need it to return a json error
Indeed, the default error handling tool in express render html*/

const errorHandler = (err, req, res, next) => {
    console.log(err.stack.red);

    res.status(err.statusCode || 500).json(
        {
            success: false,
            error: err.message || 'Server error'
        });
};

module.exports = errorHandler;