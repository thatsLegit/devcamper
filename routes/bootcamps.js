const express = require('express');
const { getBootcamp, getBootcamps, createBootcamp, updateBootcamp,
    deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload }
    = require('../controllers/bootcamps');
//Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

//Main router
const router = express.Router();

//Bring advancedResults middleware and required models
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

//Bring protect routes middleware
const { protect, authorize } = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

//Functions executed in the routes can be coded here too, 
//with using router.get(), router.post()...
//but the choice is made to make a controller

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, authorize('publisher', 'admin'), createBootcamp); //advancedResults middleware here
router.route('/:id').get(getBootcamp).put(protect, authorize('publisher', 'admin'), updateBootcamp).delete(protect, authorize('publisher', 'admin'), deleteBootcamp);
router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

module.exports = router;