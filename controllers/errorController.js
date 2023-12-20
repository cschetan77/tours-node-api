const AppError = require("./utils/AppError");

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldDB = err => {
    const value = err.errmsg.match(/"((?:\\.|[^"\\])*)"/)[0];
    return new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
}

const handleJWTError = () => new AppError('Invalid Token. Please login again', 401);
const handleJWTExpiredError = () => AppError('Your token has expired! Please login again.', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
    });
}

const sendErrorProd = (err, res) => {
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    else {
        console.error('Error 🚨', err);

        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
    
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }
    else if (process.env.NODE_ENV === 'production') {
        
        let error = {...err};
        if(error.kind === 'ObjectId') {
            error = handleCastErrorDB(error);
        }
        if(error.code === 11000) error = handleDuplicateFieldDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        sendErrorProd(error, res);
    }
}