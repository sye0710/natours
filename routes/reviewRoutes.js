const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//let this router have access to parameters of other routes, cause we use this router on tourRoutes: //GET /tour/1234ad/reviews/23734dsw3
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllreviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReveiw,
  );

module.exports = router;
