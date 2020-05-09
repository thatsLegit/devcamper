const express = require('express');
const { getCourses } = require('../controllers/courses');
const router = express.Router({ mergeParams: true }); //mergeParams allows crossRouting

router.route('/').get(getCourses);

module.exports = router;