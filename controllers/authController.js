const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const catchAsync = require('./utils/catchAsync');
const AppError = require("./utils/AppError");

const signToken = id => (
    jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
)

const signup = catchAsync(async (req, res, next) => {
    const { name, email, password, passwordConfirm } = req.body;
    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Check if email and password exists
    if(!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email}).select('+password');

    if(!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or passowrd'), 401)   ;
    }

    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
});

const protect = catchAsync(async (req, res, next) => {
    let token;
    // 1. Get the token and check if it's there.
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
    }

    if(!token) {
        return next(new AppError("You are not logged in! Please login to get access", 401))
    }
    // 2. Validate token.
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. check is user still exists.

    const freshUser = await User.findById(decoded.id);
    if(!freshUser) {
        return next(new AppError('The user belonging to this token does no longer exist', 401));
    }

    // 4. check if user changed password after the token was issued.
    if(freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please login again'), 401);
    }

    // 5. Grant access to the protected route
    req.user = freshUser;
    next();
});

module.exports = {
    signup,
    login,
    protect
}
