const express = require('express');
const router = express.Router();
const { getBootcamp, getBootcamps, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius }
    = require('../controllers/bootcamps');

//Functions executed in the routes can be coded here too, 
//with using router.get(), router.post()...
//but the choice is made to make a controller

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/').get(getBootcamps).post(createBootcamp);
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

module.exports = router;