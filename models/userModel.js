const crypto = require('crypto');
/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const validator = require('validator'); // npm validator

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    //unique: [true, 'This user name is taken!'],
    //trim: true,
    //maxlength: [40, 'A user name must have less or equal than 40 characters'],
    //minlength: [10, 'A user name must have more or equal than 10 characters'],
    //validate: [validator.isAlpha, 'Tour name must only contain charater'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide your email'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE/SAVE!!! i.e. only works when we create/save a new object
      // if only update a user's password with regular UPDATE, this validation here won't work.
      validator: function (el) {
        //need to use this, so no arrow function
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false, //prevent this field from showing up in query
  },
}); //1st arg is schema definition, 2nd is optional

//encryption should happen between we receive the data and persist it in the database.
userSchema.pre('save', async function (next) {
  //only run this function if password is created or changed
  if (!this.isModified('password')) return next();
  //hash: an async function, which will return a promise
  this.password = await bcrypt.hash(this.password, 12); //12: cost parameter, measuring how cpu intensiv this operation will, the intensiver, the better the password will be encrypted.
  this.passwordConfirm = undefined; //after sucessful validation during password creation, no long need this field in our database
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  //passwordChangedAt could be a little bit later than the token issued time, which will cause the token unvalid, so substract 1 to avoid this
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTtimestamp) {
  if (this.passwordChangedAt) {
    //getTime() returns the number of milliseconds for this date since the epoch, which is defined as the midnight at the beginning of January 1, 1970, UTC.
    // eslint-disable-next-line radix
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    return JWTtimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //generate a random plain text token
  const resetToken = crypto.randomBytes(32).toString('hex');
  //encrypt the random plain text token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes: 10 * 60 * 1000 millisecond
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
