const user=     require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const generateOtp = require('../utils/generateOTP');
const sendEmail = require('../utils/email');
const {StreamChat} = require("stream-chat");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
        secure: process.env.NODE_ENV=== 'production', // Set to true in production
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' // Allow cross-site cookies in production
    };

    // if(!findUser.isVerified){
    //     return next(new AppError('Your account is not verified. Please verify your email first.', 403));
    // }
    res.cookie('jwt', token,cookieOptions);
    createSendToken(findUser,200,res,"You have logged in successfully.");
   
}   
);

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 1000), // Set cookie to expire immediately
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' , // Set to true in production
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' // Allow cross-site cookies in production
    });
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
};  



exports.changePassword = catchAsync(async (req, res, next) => {
  // Ensure user is authenticated (req.user is set by protect middleware)
  const userId = req.user.id; 
  const { oldPassword, newPassword, confirmPassword } = req.body;

  // 1️⃣ Validate inputs
  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide old password, new password, and confirm password',
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: 'fail',
      message: 'New password and confirm password do not match',
    });
  }

  // 2️⃣ Get current user with password
  const findUser = await user.findById(userId).select('+password');
  if (!findUser) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found',
    });
  }

  // 3️⃣ Check if old password is correct
  const isOldPasswordCorrect = await findUser.correctPassword(oldPassword, findUser.password);
  if (!isOldPasswordCorrect) {
    return res.status(401).json({
      status: 'fail',
      message: 'Old password is incorrect',
    });
  }

  // 4️⃣ Update password (pre-save middleware will hash automatically)
  findUser.password = newPassword;
  findUser.passwordConfirm = confirmPassword; // required for schema validation
  findUser.passwordChangedAt = Date.now() - 1000; // forces JWT to be invalidated
  await findUser.save();

  // 5️⃣ Success response (optionally re-login the user and set JWT cookie here)
  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});


exports.protect = async (req, res, next) => {
  // Get token from headers/cookies
  let token;
//   if (req.headers.authorization?.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];
//   }
token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You are not logged in! Please log in to get access.'
    });
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await user.findById(decoded.id);
  if (!currentUser) {
    return res.status(401).json({
      status: 'fail',
      message: 'The user belonging to this token no longer exists.'
    });
  }

  // Check if password changed after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return res.status(401).json({
      status: 'fail',
      message: 'User recently changed password. Please log in again.'
    });
  }

  // Grant access
  req.user = currentUser;
  next();
};


exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const findUser = await user.findOne({ email });

  if (!findUser) {
    return next(new AppError('There is no user with that email address.', 404));
  } 

  // create reset token (plain token sent via email)
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const resetTokenExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes
  findUser.passwordResetToken = hashedToken;
  findUser.passwordResetExpires = resetTokenExpires;
  await findUser.save({ validateBeforeSave: false });

  // build reset URL (client handles the route /reset-password/:token)
  const resetURL = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: findUser.email,
      subject: 'Your password reset link (valid for 10 minutes)',
      html: `<p>Click the link to reset your password:</p><p><a href="${resetURL}">${resetURL}</a></p>`
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email!'
    });
  } catch (err) {
    // rollback on email failure
    findUser.passwordResetToken = undefined;
    findUser.passwordResetExpires = undefined;
    await findUser.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});
 
// new controller to handle reset
exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  if (!token) return next(new AppError('Token is missing', 400));

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const findUser = await user.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!findUser) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
 console.log('body', req.body);
  const { password, confirmPassword } = req.body;
 
  if (!password || !confirmPassword) {
    return next(new AppError('Please provide password and confirmPassword', 400));
  }
  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  // set the new password and clear reset fields
  findUser.password = password;
  findUser.passwordConfirm = confirmPassword;
  findUser.passwordResetToken = undefined;
  findUser.passwordResetExpires = undefined;
  findUser.passwordChangedAt = Date.now() - 1000;
  await findUser.save(); // runs validators and password hashing middleware

  // optionally log the user in after reset
  createSendToken(findUser, 200, res, 'Password reset successful.');
});
// ...existing code...