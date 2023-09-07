/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES

// middleware: stand between request and response, can be used to add property to request.
// use use() to actually use middleware, so add middleware to our middleware stack
// Set security HTTP headers
app.use(helmet());

// Development login
if (process.env.NODE_ENV === 'development') {
  /*only add morgan middleware when we are in development environment*/
  app.use(
    morgan('dev'),
  ); /*morgan('dev') is used as middleware to log HTTP request information to the console in a predefined format. */
}

// Limit requests from same API
const limiter = rateLimit({
  //allow 100 requests from the same ip within one hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in one hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '10kb', //limit body size to 10kn
  }),
);

// Data sanitization against NoSQL queryninjection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());

//Prevent parameter pollution, but still allow some duplicated in the string
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
// // '/' is the root url.
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });

/*The JSON.parse() function takes a JSON string as input and 
returns the corresponding JavaScript object if the JSON string is valid*/

// 2) ROUTE HANDLER

//in express, the staus and format of response can be chained after res.
//app.get('/api/v1/tours', getAlltours);

/*define a variable in route using colon:
'/api/v1/tours/:id/:x/:y?'
request can be 127.0.0.1:3000/api/v1/tours/5/7/9 and the '/9' is optional because of the '?'
*/
//app.get('/api/v1/tours/:id',getTour);

//app.post('/api/v1/tours', createTour);

/*two ways to update data, one by put is to send a whole data,
one by patch is only to send the properties which are updated.
*/

//not acutually patch and delete below...
//app.patch('/api/v1/tours/:id', updateTour);

//app.delete('/api/v1/tours/:id', deleteTour);

/*equivalent to:
app.get('/api/v1/tours', getAlltours);
app.post('/api/v1/tours', createTour);
*/

// 3) ROUTES

/*create a middleware*/

/*apply the middleware to this specfic route. */
/*also called mounting the router, mounting new router to a route*/
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//if a request doesnt get handled by those two above, it comes to this below
//.all() refers to all http methods, '*' represents any url
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  //whatever we passed in next(), will be assumed as error and skip all other middlewares and be passed to global error handling middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

/*tourRouter.route('/').get(getAlltours).post(createTour);
/*equivalent to:
app.get('/api/v1/tours/:id',getTour);
app.patch('/api/v1/tours/:id', updateTour);
app.delete('/api/v1/tours/:id', deleteTour);
*/
/*tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllusers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser); */

module.exports = app;
