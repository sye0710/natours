/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');
//const slugify = require('slugify');
// eslint-disable-next-line import/no-extraneous-dependencies
//const User = require('./userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must only contain charater'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium. difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, //round can only round to integer, use * 10 / 10 trick to allow round on decimal.
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      //custom validator has access to the value of this field, and can return false and trigger validation error
      validate: {
        validator: function (val) {
          //this only refers to the current document when we create new document
          return val < this.price; //false if priceDiscouunt is higher than the price, and trigger error
        },
        message: 'Discount price ({VALUE}) should be below regular price', //({VALUE}) a mongoose trick, get acess to the input value.
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a description'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true }, // when data got output as json, we want virtuals to be true
    toObject: { virtuals: true }, // when data got output as an object, we want virtuals to be true
  },
); //1st arg is schema definition, 2nd is optional

//index ordered by price, will improve performance on query by price value
tourSchema.index({ price: 1, ratingsAverage: -1 }); //1: ascending order;
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//virtual property: fields we define in schema but not saved in database
tourSchema.virtual('durationWeeks').get(function () {
  //use normal function not arrow function, because arrow function have no excess to this
  return this.duration / 7;
});

//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review', //name of the model that we want to reference
  foreignField: 'tour',
  localField: '_id', //what is called '_id' in local model(tourModel) is called 'tour' in foreign model(reviewModel)
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create(), not on insertMany,findOne....and so on
//save is a hook, this middleware is also called pre hook middleware
// tourSchema.pre('save', function (next) {
//   console.log(this); //this here is the document we want to save, it will be printed in console before saved into database
//   this.slug = slugify(this.name, { lower: true }); //create a slug out of name
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });
// tourSchema.pre('save', async function (next) {
//   //from array of ID to array of promises
//   const guidesPromises = this.guides.map(async (id) => User.findById(id));
//   //from array of promises to array of user documents: Promise.all resolves an array of promises
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
// QUERY MIDDLEWARE
//tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  //will not only apply to 'find' but to all command that starts with find
  //pre-filter the query that fulfill some criteria before the query is executed
  this.find({ secretTour: { $ne: true } }); //this here is the query
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt', //in the guides array, dont show '__v' and 'passwordChangeAt'
  });
  next();
});

//POST MIDDLEWARE
//run after the query's been executed, so has the access to the query result: docs
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  //console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   // eslint-disable-next-line no-console
//   console.log(this); //this points to current aggregation object
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //this.pipeline() is an array, unshift to add in the beginning of an array
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
