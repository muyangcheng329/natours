/* eslint-disable */
const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}:${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const message = 'Duplicate field value.'; //可以打印error然后通过正则表达式替换{}里的值
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message); //loop 所有的验证器错误
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = err =>
  new AppError('Invalid Token. Please log in again', 401);

const handleJWTExpiredError = err =>
  new AppError('Token expired. Please log in again', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    //不要把非operational的programming bug信息传递到客户端去
    console.error('ERROR', err); //log error
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message
    });
  } else {
    //不要把非operational的programming bug信息传递到客户端去
    console.error('ERROR', err); //log error
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: 'please try again later'
    });
  }
};

//global error handler
module.exports = (err, req, res, next) => {
  //err在第一个，所以express默认其为error-handling function
  err.statusCode = err.statusCode || 500; //internal server error
  err.status = err.status || 'error'; //defined: fail,否则候补值：error

  if (process.env.NODE_ENV == 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV == 'production') {
    let error = JSON.parse(JSON.stringify(err)); //hard copy，导致name字段丢失，手动补上一个字段
    //但是(1) you are creating a shallow copy and
    //(2) you will copy only enumerable attributes.
    //Error.prototype.name is not enumerable therefore it will not be copied into the new object.
    error.message = err.message;
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error); //解决id为非法值的问题 ，报错来源mongoose，利用error中的name字段
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error); //解决post重名问题
    }
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error);
    }

    sendErrorProd(error, req, res);
  }
};
