const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

//Here it's all about registering/logging...


// @desc        Register user
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    //Create the user: 
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res);
});


// @desc        Login user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    //Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse(`Please provide an email and password`, 400));
    }

    //Find the user by email and also grab the password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse(`Invalid credentials`, 401));
    }

    //Check the entered password of the user
    const isMatch = await user.matchPasswords(password);
    if (!isMatch) {
        return next(new ErrorResponse(`Invalid credentials`, 401));
    }

    sendTokenResponse(user, 200, res);
});

// @desc        User log out / clear cookie
// @route       GET /api/v1/auth/logout
// @access      Private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() * 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        data: {}
    });
});


// @desc        Get current logged in user
// @route       POST /api/v1/auth/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        data: req.user
    });
});


// @desc        Forgot password
// @route       POST /api/v1/auth/forgotpassword
// @access      Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    //Get the user from the db
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token, hash it there...
    const resetToken = user.getResetPasswordToken();

    //...And save that. save() is the non-static version of Model.create()
    await user.save({ validateBeforeSave: false });
    //At this point we have updated the user with a restPasswordToken

    //Create the reset url.That's the link to follow to reset the password :
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            message,
            subject: 'Password reset token'
        });
        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.save({ validateBeforeSave: false });
        return next(new ErrorResponse('Email could not be sent, please try in a few minutes', 500));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc        Get current logged in user
// @route       PUT /api/v1/auth/resetpassword/:resettoken
// @access      Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    //The token is hashed in the db
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    //If expiration is greater than right now, find the user by its freshly pushed resetToken
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    //Set the new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc        Update user's details
// @route       PUT /api/v1/auth/updatedetails
// @access      Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc        Update user's password
// @route       PUT /api/v1/auth/updatepassword
// @access      Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    //Check current password
    if (await (!user.matchPasswords(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect'), 401);
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});


/*Cookies are a more secure way to store the received token
than localstorage (cache of the browser)*/
//Get token from model, create cookie and send response :
const sendTokenResponse = (user, statusCode, res) => {
    //Each time you register or connect successfully, you get a signed token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    return res.status(statusCode).cookie('token', token, options).json({ success: true, token });
};


