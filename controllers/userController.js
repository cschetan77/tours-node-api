const User = require("../models/userModel");
const AppError = require("./utils/AppError");
const catchAysnc = require("./utils/catchAsync");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach((key) => {
        if(allowedFields.includes(key)) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
}

const getAllUsers = catchAysnc(async (req, res) => {
    const users = await User.find();

    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users
        }
    })
});

const getUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined"
    });
};

const createUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined"
    });
};

const updateUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined"
    });
};

const deleteUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined"
    });
};

const updateMe = catchAysnc(async (req, res, next) => {
    // 1. If user posts password data, create error
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError('Passowrd cannot be updated using this route, please use /updateMyPassword.', 400));
    }
    // 2. Update user document.
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: 'message',
        data: {
            updatedUser
        }
    });
})

const deleteMe = catchAysnc(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null
    });
})

module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe
}