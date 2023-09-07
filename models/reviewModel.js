const mongoose = require('mongoose');

const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createAt: {
      type: Date,
      default: Date.now(),
    },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.'],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.'],
      },
    ],
  },
  {
    toJSON: { virtuals: true }, // when data got output as json, we want virtuals to be true
    toObject: { virtuals: true }, // when data got output as an object, we want virtuals to be true
  },
);

//each combination of tour and user should be unique: One user could only write one review on each tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name',
  //   });
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

// reviewSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'user',
//     select: 'name photo',
//   });
//   next();
// });

//add static method to mode, which can be called directly on model, counterpart of instance method.
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }, //select tour that we want to update
    },
    {
      $group: {
        _id: '$tour', //group all reviews by tour
        nRating: { $sum: 1 }, //add 1 each time a tour has a rating
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  //console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    //after delete the last review,  no object is gonna match the query, cause this tour has no rating
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//after the current review saved to collection, calculate average rating.
reviewSchema.post('save', function () {
  //this points to current review
  //apply model method before model is instantiated by calling this.constructor
  this.constructor.calcAverageRatings(this.tour);
});

//findbyIdandUpdate: shorthand for findOneandUpdate by ID
//findbyIdandDelet: .....
//cannot use post query middleware here, cause in that case the query is already executed, we have no access to the query, without the query we cannot save the review document and run the post save middleware above as we want
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //this points to query, this line will execute query,
  //for example we want to find one review and update them, this line will return the review(and which is before we update)
  this.r = await this.findOne(); //save the deleted/updated review to variable r
  //console.log(this.r);
});

reviewSchema.post(/^findOneAnd/, async function () {
  //this.r = await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
/*
want to calculated average rating and rating# after a review of a tour is updated/deleted, 
but the model method calcAverageRatings only works before save.
so use pre query middleware first to get the tour we want to update/delete and save the tour to this.r and this variable will be delivered to post query middleware,
perform calcAverageRatings on this tour.
*/
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

//POST /tour/1234ad/reviews
//GET /tour/1234ad/reviews
//GET /tour/1234ad/reviews/23734dsw3
