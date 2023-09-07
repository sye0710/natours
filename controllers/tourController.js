/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-console */
const Tour = require('../models/tourModel');
// eslint-disable-next-line no-unused-vars
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// exports.checkID = (req, res, next, val) => {
//   // eslint-disable-next-line no-console
//   console.log(`Tour id is: ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     /*req.params is an object that holds the route parameters extracted from the URL*/
//     //use return here, cause we want to exit the function right at this point
//     return res.status(404).json({
//       /* this return here is important, otw it will call next() and continue running other handler */
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     /*req.body is a property of the request object (req) that holds the data submitted in the request body of an HTTP POST or PUT request.*/
//     return res.status(400).json({
//       /* this return here is important, otw it will call next() and continue running other handler */
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };
//prefilling the query string for the user
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//hander functions
exports.getAlltours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
//exports.getAlltours = catchAsync(async (req, res, next) => {
// BUILD QUERY
// 1A) Filtering
//hard copy, use {...} to create a new object out of req.query,
//so if queryObj changes, req.query won't change along.
// eslint-disable-next-line node/no-unsupported-features/es-syntax
//const queryObj = { ...req.query };
//const excludedFields = ['page', 'sort', 'limit', 'fields'];
//loop through queryObj to delete the fields we want to exclude
//excludedFields.forEach((el) => delete queryObj[el]);
/*one way to write filters */
// const tours = await Tour.find({
//   duration: 5,
//   difficulty: 'easy',
// });
//*another way to write filters */
// const tours =  Tour.find()
//   .where('duration')
//   .equals(5)
//   .where('difficulty')
//   .equals('easy');
// 2B) Advanced filtering
/*above equals below */
//use let to allow to mutate data
//let queryStr = JSON.stringify(queryObj);
/*for url:api/v1/tours?duration[gte]=5&difficulty=easy, query will be parsed to be: { gte: '5' }, so need to transform it into {$gte : 5}, then mongoose can understand.
 */
//use RegEx to find all the exact gte|gt|lte|lt in queryOjb,
//replace also takes a callback function, which takes the returned match as argument, and return the replacement of these match.
//queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//{ difficulty: 'easy', duration: {$gte : 5}}

//let query = Tour.find(JSON.parse(queryStr));

//2) SORTING
// if (req.query.sort) {
//   //sort=price.ratingsAverage in url, means sort by two variables
//   //mongoose takes sort criteria like: sort(price ratingsAverage)
//   const sortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(sortBy);
// } else {
//   query = query.sort('createAt');
// }

// 3) Field limiting
// url: /tours?fileds=name,duration,difficulty,price
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   // default field scenario: only send meaningful fileds to client
//   query = query.select('-__v'); //exclude field "__v" by -
// }
// 4) Pagination
//convert string to number. '|| 1' means by default the page is 1
// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;
// console.log(skip);
// //page=2&limit=10: user wants the 2nd page and with 10 results in one page
// query = query.skip(skip).limit(limit);
// if (req.query.page) {
//   const numTours = await Tour.countDocuments();
//   if (skip >= numTours) throw new Error('This page does not exist');
// }

//EXECUTE QUERY
//APIFeatures will return Tour.find(processedReqQuery)
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;
//   //SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });

//exports.getTour = catchAsync(async (req, res, next) => {
//req.params stores all the variables we stored in the route
//for example if we request /api/v1/tours/5, req.params is { id: '5' }
// console.log(req.params);
//nice trick in Javascript: req.params.id is a string, by being muptiplied by 1, it becomes a number.
// const id = req.params.id * 1;
/*find() has nothing to do with node or express, 
      just a regular js function, which you can use on arrays
      find calls a callback function, which returns an array of boolean,
      find only returns a array of elements where the condition is true.
      */
// const tour = tours.find((el) => el.id === id);

// res.status(200).json({
//   status: 'success',
//   data: {
//     tour,
//   },
// });
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   // Tour.findOne({id:req.params.id}) works like above
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

//   console.log(req.body);

// const newID = tours[tours.length - 1].id + 1;
// //Object.assign creates a copy of the value of req.body, append {id:newID} to this copy.
// //add id to request body, to make it compatible to the existing data
// // eslint-disable-next-line prefer-object-spread
// const newTour = Object.assign({ id: newID }, req.body);

// /*push() is a method that belongs to arrays.
//     It is used to add one or more elements to the end of an array and modify the original array. */
// // add compatible request body to the existing data
// tours.push(newTour);

// /* JSON.stringify() performs the opposite of JSON.parse():
//     it converts a JavaScript object into a JSON string. */
// //replace with the new data. response "success" only this final step successes.
// fs.writeFile(
//   `${__dirname}/dev-data/data/tours-simple.json`,
//   JSON.stringify(tours),
//   // eslint-disable-next-line no-unused-vars
//   (err) => {

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  //. aggregate is gonna return an aggregate object, only when we await it ,it comes back with a result
  const stats = await Tour.aggregate([
    {
      //first stage
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      //group state
      $group: {
        _id: { $toUpper: '$difficulty' }, //_id is by what we want to group.
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      //sort stage
      $sort: { avgPrice: 1 }, //1 is for ascending
    },
    // {
    //   //repeat stage is allowed
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      //break one tour into several tours by startDates, like explode method in python
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }, //generate a array of name of all tours in each group
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0, //id won't show
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    // {
    //   $limit: 6,
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/47.22309,8.32183/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  //convert to radius which MongoDB expects, if in miles:... else in kilometer: ...
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longtitude in the format lat,lng.',
      ),
      400,
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const mutilpier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longtitude in the format lat,lng.',
      ),
      400,
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: mutilpier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
