const express = require('express');
const advancedResults = require('../middleware/advancedResults');
const { getUser, createUser, deleteUser, updateUser, getUsers } = require('../controllers/users');
const router = express.Router();

//Bring protect routes middleware
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;