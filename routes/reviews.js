const express = require('express');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const Review = require('../models/Review');
const advancedResults = require('../middleware/advancedResults');
const { getReviews, getReview, createReview, updateReview, deleteReview } = require('../controllers/reviews');

//Bring protect routes middleware
const { protect, authorize } = require('../middleware/auth');

//mergeParams allows crossRouting
const router = express.Router({ mergeParams: true });

//routes
router.route('/').get(advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
}), getReviews).post(protect, authorize('user'), createReview);
router.route('/:id').get(getReview).put(protect, authorize('user'), updateReview).delete(protect, authorize('user'), deleteReview);

module.exports = router;