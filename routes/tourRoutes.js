const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
//instantiate a router
const router = express.Router();

/* create a middleware for id parameter, 
this middleware has access to request, response, next function and value of the parameter in question
if the request doesn't have id this middleware will be ignored.*/
/*router.param('id', (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  next();
}); */

// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);

//when url is /top-5-cheap, the middleware aliasTopTours will prefill the query strings
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAlltours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

// one way: /tours-within?distance=233&center=-40,45&unit=mi
// another way: /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

/*In Express.js, the .route() method is used to create a chainable route handler for a specific route path.  */
router.route('/').get(tourController.getAlltours).post(
  // tourController.checkBody,
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  tourController.createTour,
); /*chain two different middleware in a request like this, will run middleware first then tourController.createTour*/
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

//POST /tour/1234ad/reviews
//GET /tour/1234ad/reviews
//GET /tour/1234ad/reviews/23734dsw3

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview,
//   );

module.exports = router;
