/** @format */

//definition of the express application
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const AppError = require("./starter/utils/appError");
const globalErrorHandler = require("./starter/controllers/errorController");

const tourRouter = require("./starter/routes/tourRoutes");
const userRouter = require("./starter/routes/userRoutes");
const reviewRouter = require("./starter/routes/reviewRoutes");
const bookingRouter = require("./starter/routes/bookingRoutes");
const viewRouter = require("./starter/routes/viewRoutes");
const cors = require("cors");

const app = express();
app.use(cors())
// app.use(cors({origin: ['http://localhost:3000',"http://127.0.0.1"],
//   credentials: true,
//   exposedHeaders: ["set-cookie"]}));

//serving static files
app.use(express.static(`${__dirname}/starter/public`));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "starter/views"));

//global middleware

app.use(helmet()); //set security http headers

//development logging
if (process.env.NODE_ENV === "development") {
  //读取环境变量在node里只用执行一次
  app.use(morgan("dev"));
}
//防止dos攻击denial of service及暴力破解
const limiter = rateLimit({
  max: 100, //最大req次数
  window: 60 * 60 * 1000, //窗口期
  message: "Too many request from this IP.Try later",
});

app.use("/api", limiter);

app.use(compression());

//body parser, reading data from body into rq.body
app.use(express.json({ limit: "10kb" }));
//同上 ，cookie解析，传递到req.cookies
app.use(cookieParser());
app.use((req, res, next) => {
  console.log("解析token");
  console.log(req.cookies);
  next();
});

//data sanitization against NoSQL query injection,remove $ etc.
app.use(mongoSanitize());

//data sanitization against XSS
app.use(xss());
//prevent parameters pollution
app.use(
  hpp({
    whitelist: ["duration"], //allow duplicate query string
  })
);

//routes,但也是middleware,按序走，先看tourRouter然后userRouter
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter); //mounting a new router on a route
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

//error handler: 第二步：create an error object
app.all("*", (req, res, next) => {
  //所有被传入next（）的都会被认为是err，直接到达err处理，忽略其他中间件次序
  next(new AppError(`cannot find ${req.originalUrl} on this server!`, 404));
});

//error handler: 第一步：写中间件
app.use(globalErrorHandler);

module.exports = app;
