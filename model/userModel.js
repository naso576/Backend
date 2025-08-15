const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: [true, 'User name is required'],
    index: true, trim: true, maxlength: [20, 'User name must be less than or equal to 20 characters'],
    minlength: [3, 'User name must be more than or equal to 3 characters'],
    validate: [validator.isAlphanumeric, 'User name must contain only letters and numbers']     
    },
    email: {
    type: String, required: [true, 'Email is required'],
    unique: true, lowercase: true, trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
    type: String, required: [true, 'Password is required'],
    minlength: [8, 'Password must be more than or equal to 8 characters'],
    select: false
        
    },
    passwordConfirm: {
    type: String, required: [true, 'Password confirmation is required'],    
        
    validate: {
      validator: function (el) {
        return el === this.password;
      }
        , message: 'Passwords do not match'
    }
    },
     isVerified: {type: Boolean, default: false,}, otp: String,
    otpExpires: Date,
    resetPasswordOTP: String,
      resetPasswordOTPExpires: Date,
    createdAt: {type: Date, default: Date.now,},
    passwordChangedAt: Date,
    role: {
    type: String, enum: ['user', 'admin'], default: 'user'
    },

    passwordResetToken: String,
    passwordResetExpires: Date,

    emailVerificationToken: String,
    emailVerificationExpires: Date, 
    emailVerified: {
      type: Boolean, default: false
    }   ,
    phone: Number
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // Remove passwordConfirm after hashing
  next();
});

userSchema.methods.correctPassword = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp; // true if password changed after JWT was issued
  }
  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
module.exports.userSchema = userSchema;