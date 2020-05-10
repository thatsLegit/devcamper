const express = require('express');
const { getBootcamp, getBootcamps, createBootcamp, updateBootcamp,
    deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload }
    = require('../controllers/bootcamps');
//Include other resource routers
const courseRouter = require('./courses');
const router = express.Router();

//Bring advancedResults middleware and required models
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

//Bring protect routes middleware
const { protect } = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

//Functions executed in the routes can be coded here too, 
//with using router.get(), router.post()...
//but the choice is made to make a controller

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, createBootcamp); //advancedResults middleware here
router.route('/:id').get(getBootcamp).put(protect, updateBootcamp).delete(protect, deleteBootcamp);
router.route('/:id/photo').put(protect, bootcampPhotoUpload);

module.exports = router;