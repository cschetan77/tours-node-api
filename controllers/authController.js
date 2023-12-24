const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const catchAsync = require('./utils/catchAsync');
const AppError = require("./utils/AppError");
const sendEmail = require('./utils/email');

const signToken = id => (
    jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
)

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
    // Should not show passowrd when sending back response

    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

const signup = catchAsync(async (req, res, next) => {
    const { name, email, password, passwordConfirm } = req.body;
    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm
    });

    createSendToken(newUser, 201, res);
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

    createSendToken(user, 200, res);
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

const restrictTo = (...roles) => (req, res, next) => {
    if(!roles.includes(req.user.role)) {
        return next(new AppError('You do not have permission to perform this action'), 403);
    }
    next();
}

const forgotPassword = catchAsync(async (req, res, next) => {
    // 1. Get user based on posted email
    const user = await User.findOne({ email: req.body.email });

    if(!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    // 2. Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false});
    
    // 3. Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassowrd/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and password confirm to: ${resetURL}
    \nIf you didn't forget the password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 mins)',
            message
        });
    
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    }
    catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await User.findOne({ email: req.body.email });
        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
    
});

const resetPassword = async (req, res, next) => {
    // 1. Get user based on the plain token.
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now}
    });

    // 2. If token has not expired and there is a user, set the new password.
    if(!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;

    // 3. update changedPasswordAt property for the user.
    await user.save();
    
    // 4. Log the user in, send the JWT to the client.
    createSendToken(user, 200, res);
}

const updatePassword = async (req, res, next) => {
    const { id }  = req.user;
    const { currentPassword, newPassword } = req.body;

    // 1. Get user from the collection
    const user = await User.findById(id).select('+password');

    // 2. check if posted password is correct
    if(!await user.correctPassword(currentPassword, user.password)) {
        return next(new AppError('your current passowrd did not match', 401));
    }
    // 3. If so, update password.
    user.password = newPassword;
    user.passwordConfirm = newPassword;
    // User.findByIdAndUpdate will not work here as intended.

    await user.save();

    // 4. Log user in, send JWT
    createSendToken(user, 200, res);
}

module.exports = {
    signup,
    login,
    protect,
    restrictTo,
    resetPassword,
    forgotPassword,
    updatePassword
}
