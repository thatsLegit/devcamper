const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');

//Here we have all methods that are associated with the bootcamps routes

// @desc        Get all bootcamps
// @route       /api/v1/bootcamps
// @access      Public
exports.getBootcamps = async (req, res, next) => {
    try {
        const bootcamps = await Bootcamp.find();
        res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
    } catch (err) {
        next(err);
    }
}

// @desc        Get single bootcamp
// @route       /api/v1/bootcamps/id
// @access      Public
exports.getBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);
        //or Bootcamp.find({ name: req.params.id })...

        //if the formatting is correct but no id matching
        if (!bootcamp) {
            return next(new ErrorResponse(`Resource not found with id ${req.params.id}`, 404));
        }

        res.status(200).json({ success: true, data: bootcamp });

        //if the formatting is incorrect (CastError)
    } catch (err) {
        next(err);
    }
}

// @desc        Create bootcamp
// @route       /api/v1/bootcamps
// @access      Private
exports.createBootcamp = async (req, res, next) => {
    /*Create a document in the collection bootcamps basically
    Mongoose always returns a Promise, so await it */
    try {
        const bootcamp = await Bootcamp.create(req.body);

        res.status(201).json({
            success: true,
            data: bootcamp
        });
    } catch (err) {
        next(err);
    }
}

// @desc        Update bootcamp
// @route       /api/v1/bootcamps/id
// @access      Private
exports.updateBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!bootcamp) {
            return next(new ErrorResponse(`Resource not found with id ${req.params.id}`, 404));
        }

        res.status(200).json({ success: true, data: bootcamp });

    } catch (err) {
        next(err);
    }
}

// @desc        Delete bootcamp
// @route       /api/v1/bootcamps/id
// @access      Private
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if (!bootcamp) {
            return next(new ErrorResponse(`Resource not found with id ${req.params.id}`, 404));
        }

        res.status(200).json({ success: true, data: {} });

    } catch (err) {
        next(err);
    }
}