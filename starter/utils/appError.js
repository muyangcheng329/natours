class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //一个调用了本构造方法的flag

    Error.captureStackTrace(this, this.constructor); //构造方法不会出现在stacktrace里
  }
}

module.exports = AppError;
