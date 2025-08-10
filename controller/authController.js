const user=     require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const generateOtp = require('../utils/generateOTP');
const sendEmail = require('../utils/email');
const {StreamChat} = require("stream-chat");


const streamClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
  });
};

const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);
const streamToken = streamClient.createToken(user._id.toString());
    // Configure cookie options
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV=== 'production', // Set to true in production
        sameSite:process.env.NODE_ENV === 'production' ? 'None' : 'Lax' // Allow cross-site cookies in production

    };
    res.cookie('jwt', token, cookieOptions);
    user.password = undefined; // Remove password from the response
    user.passwordConfirm = undefined; // Remove passwordConfirm from the response
    user.otp = undefined; // Remove OTP from the response
     res.status(statusCode).json({
    status: 'success',
    token,
    streamToken,
    data: { user },
    message
  });

};

exports.resendOtp = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError('Please provide your email address', 400));
    }

    const findUser = await user.findOne({ email });
    if (!findUser) {
        return next(new AppError('No user found with this email', 404));
    }
    if (findUser.isVerified) {
        return next(new AppError('Your account is already verified.', 400));
    }
    const otp = generateOtp();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    findUser.otp = otp;
    findUser.otpExpires = otpExpires;
    await findUser.save({ validateBeforeSave: false });
    try {
        await sendEmail({
            email: findUser.email,
            subject: 'Your OTP for registration',
            html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
        }); 
        res.status(200).json({
            status: 'success',
            message: 'OTP has been resent to your email address.'
        });
    } catch (error) {
        console.error('Error sending email:', error);
        findUser.otp = undefined; // Clear the OTP if email sending fails
        findUser.otpExpires = undefined; // Clear the OTP expiration time
        await findUser.save({ validateBeforeSave: false }); // Save the changes
        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
});

exports.signup = catchAsync(async (req, res, next) => {
   const {username,email,password,confirmPassword,phone} = req.body;
  const existingUser = await user.findOne({ email });
    if (existingUser) {
        return next(new AppError('User already exists with this email', 400));
    }
    const otp = generateOtp();
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    const newUser = await user.create({
        username,
        email,
        password,
        passwordConfirm: confirmPassword,
        phone,
        otp,
        otpExpires
    });

    //configure email sending logic here
    try{
    await sendEmail({
        email: newUser.email,
        subject: 'Your OTP for registration',
        html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
    });
    createSendToken(newUser, 201, res,"Your account has been created successfully. Please verify your email using the OTP sent to your email address.");
    }
    catch (error) {
    console.error('Error sending email:', error);
    await user.findByIdAndDelete(newUser._id); // Clean up if email sending fails
        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }

}   );


exports.verifyOtp = catchAsync(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new AppError('Please provide email and OTP', 400));
    }

    const findUser = await user.findOne({ email });

    if (!findUser) {
        return next(new AppError('No user found with this email', 404));
    }

    if (findUser.otp !== otp || Date.now().toLocaleString() > findUser.otpExpires) {
           return next(new AppError('Invalid or expired OTP', 400));
    }

    findUser.isVerified = true; // Mark the user as verified
    findUser.otp = undefined; // Clear the OTP after verification
    findUser.otpExpires = undefined; // Clear the OTP expiration time
    // findUser.confirmPassword = passwordConfirm; // Set the password confirmation if provided
    await findUser.save({ validateBeforeSave: false });

    createSendToken(findUser, 200, res, "Your email has been verified successfully.");
});

exports.verifyAccount = catchAsync(async (req, res, next) => {
    const userId = req.user._id; // Get the user ID from the authenticated request
    const findUser = await user.findById(userId);

    if (!findUser) {
        return next(new AppError('No user found with this ID', 404));
    }

    if (findUser.isVerified) {
        return next(new AppError('Your account is already verified.', 400));
    }

    findUser.isVerified = true; // Mark the user as verified
    await findUser.save({ validateBeforeSave: false });

    createSendToken(findUser, 200, res, "Your account has been verified successfully.");
}   
);

exports.login= catchAsync(async(req,res,next)=>{
    const {email,password} = req.body;

    if(!email || !password){
        // return next(new AppError('Please provide email and password',400));
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide email and password'
        });
    }
    // Check if user exists and password is correct
    const findUser = await user.findOne({email}).select('+password');

    if(!findUser || !(await findUser.correctPassword(password,findUser.password))){
        // return next(new AppError('Incorrect email or password',401));
        return res.status(401).json({
            status: 'fail',
            message: 'Incorrect email or password'
        });
    }
    const token = signToken(findUser._id.toString());
// Generate Stream token
  await streamClient.upsertUser({
    id: findUser._id.toString(),
    name: findUser.userName,
  });
  const streamToken = streamClient.createToken(findUser._id.toString());

    //configure cookie options
    const cookieOptions = {

        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production', // Set to true in production 
        // sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' // Allow cross-site cookies in production
        secure: false, // Set to true in production
        sameSite: 'Lax' // Allow cross-site cookies in production
    };

    // if(!findUser.isVerified){
    //     return next(new AppError('Your account is not verified. Please verify your email first.', 403));
    // }
    res.cookie('jwt', token, streamToken,cookieOptions);
    createSendToken(findUser,200,res,"You have logged in successfully.");
   
}   
);

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 1000), // Set cookie to expire immediately
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: 'Lax' // Allow cross-site cookies in production
    });
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
};  