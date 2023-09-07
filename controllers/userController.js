const User = require('../models/userModel');
//const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

//extract the key and value of allowedFields from obj and insert into a new object, and return this new object
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    //if the current filed is one of the allowed fields
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400,
      ),
    );
  // 2) Filtered out unwanted fields name that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email'); //only allow to update these fields so far

  // 3) Update user document
  //const user = await User.findById(req.user.id);
  //user.name = 'Jonas',
  //await user.save();
  // user.save() is not working above, because every time we save() it will trigger Validator which will validate if passwordConfirm is present.
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'sucess',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead!',
  });
};

// exports.getAllusers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'sucess',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.getAllusers = factory.getAll(User);
exports.getUser = factory.getOne(User);
//Do not update password with this, cause presave middlewahre won't run for findandupdate
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
