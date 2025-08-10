const errorHandlers= require('./globalErrorHandler');

const {
    handleCastErrorDB,
    handleValidationErrorDB,
    handleDuplicateFieldsDB,
    handleJWTError,
    handleJWTExpiredError

} =errorHandlers;

module.exports=(err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
       ...(process.env.NODE_ENV === 'production' && { error: err, stack: err.stack }),
    });
}