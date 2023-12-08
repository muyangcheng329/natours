/* eslint-disable */
const {promisify} = require('util'); //destructure the object,只要util包里面的promisify
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    }); //payload, secret,[options]这里用的是自动登录失效时间
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + 15 * 24 * 6060 * 1000
        ), //毫秒计算时间
        httpOnly: true, // 浏览器cookie，禁止客户端修改cookie
        // sameSite: 'lax'
    };


    console.log("生成token")
     // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //https方式
    res.cookie('jwt', token, cookieOptions);

    user.password = undefined; //去除返回的password

    // res.setHeader('Access-Control-Allow-Credentials', true);
    // res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, authorization')
    // res.setHeader('Content-Type', 'application/json');
    // res.setHeader('Access-Control-Allow-Origin','http://localhost:3000');
    // res.setHeader('Access-Control-Allow-METHODS',"GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH");
    // res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');

    res.status(statusCode).json({
        status: 'success',
        token: token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    //   const newUser = await User.create({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password,
    //     passwordConfirm: req.body.passwordConfirm,
    //     //通过这种方式，仅body里的数据可以传进来，
    //     //如果需要注册admin，可以手动去数据库修改，或者写个新的路由
    //   });
    const url = `${req.protocol}://${req.get('host')}/me`;

    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    //1.check if email and password are provided
    if (!email || !password) {
        return next(new AppError('Please provide password and name', 404));
    }
    //2.check if user exists and password is correct
    const user = await User.findOne({email}).select('+password');
    //由于schema里password设置select为false,+来查询

    // const correct = await user.correctPassword(password,user.password);
    //由于user不存在的话，数据库实际上没有密码，所以这句话要写到if的判断语句里，而不是在if里用!correct作为条件

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401)); //401:unauthorized
    }

    //3.if authenticated, send token to client
    createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({status: 'success'});
});

exports.protect = catchAsync(async (req, res, next) => {
    //1.get the token and check if it exits in the req headers.
    //req headers中token的格式通常为：authorization: Bearer [token].
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;

    }


    if (!token) {
        return next(new AppError('Please log in to get access!', 401));
    }

    //2.verification token
    //jwt.verify的第三个参数是个回调，利用node的内置包util里的promisify函数保持async/await风格
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3.check if user exist 防止已删除用户的token进入 && 4.检查是否修改过密码，不能用老密码的token进入
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError('The user belonging to this token does not exist'),
            401
        );
    }
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        //issued at
        return next(new AppError('User recently changed password! Please log in again'), 401);
    }
    //grant access
    req.user = currentUser; //重要！
    res.locals.user = currentUser;
    next();
});

//only for render pages
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            ); //403:禁止
        }
        console.log("当前用户角色："+ req.user.role)
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1.get user based on posted email
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return next(new AppError('There is no user with this email', 404));
    }

    //2.generate a random token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false}); //取消save之前对关键字段的验证

    try {
        //send it to user's email
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(
            new AppError('An error sending the email. Try again later'),
            500
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //get user by its token,check the token with encrypted one and see its expiration
    const hashToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetExpires: {$gt: Date.now()}
    });

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    //assign new values,注意有关密码的修改都是save，而不是update
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); //不要关闭validator

    //update changePasswordAt property for the user ，写到model里去了

    //log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1.get user from collection
    const user = await User.findById(req.user.id).select('+password');

    //2.check if posted current password is correct

    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        next(new AppError('Invalid password.', 401));
    }

    //3.update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4.
    createSendToken(user, 200, res);
});
