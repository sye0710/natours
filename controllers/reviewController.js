const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId; //get req.params.tourId from the URL if tour is not specified in request body
  if (!req.body.user) req.body.user = req.user.id; //get req.user from protect middleware
  next();
};

exports.getAllreviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);
exports.deleteReveiw = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review);
