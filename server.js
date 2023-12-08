/** @format */

const dotenv = require("dotenv");
const mongoose = require("mongoose");

//同步代码捕捉应该放在代码块起始位置，特别是app启动之前
process.on("uncaughtException", (err) => {
    console.log(err);
    process.exit(1); //同步代码问题应该立刻终止并重启app
});

dotenv.config({path: "./config.env"}); //config环境变量文件
const app = require("./app");

// const DB = process.env.DATABASE.replace("<password>", 106518);
const DB = 'mongodb://localhost:27017/admin';

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true,
        //mongodb 6.0以后不再需要useNewUrlParser, useUnifiedTopology, useFindAndModify等配置
    })
    .then(() => {
        console.log("DB connection successful!");
    });

//start a server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`app running on port ${port}`);
});

//所有的问题都应该原地解决，而不是依赖这里的uncaught处理，只是提供一个保底的safety net
process.on("unhandledRejection", (err) => {
    console.log(err);
    // process.exit(1); //0:success 1:uncaught exception
    server.close(() => {
        process.exit(1);
    });
});

//几个改进：1、上传图片时，可以手动选择，拖动范围，剪裁；
//2异步方式signup
//3支付成功后，确认在数据库中创建账单（并确认收款到账以后）以后，再跳转支付成功页面提示支付成功，或者有alert弹出，并在五秒内跳转首页
//4验证码
//5没有booking的话，显示无booking，有的话，用列表形式展示
//6.用populate的方法，获得用户的mybookings，在viewContoller里
//7.确认是否当天的tour已经订满(is booked out)
//8.注册用户先验证邮件，然后才可以使用
