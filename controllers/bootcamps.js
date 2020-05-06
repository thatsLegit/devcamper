const errorResponse = require('../utils/errorResponse');
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
        res.status(400).json({ success: false });
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
            return next(new errorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({ success: true, data: bootcamp });

        //if the formatting is incorrect
    } catch (err) {
        next(new errorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
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
        res.status(400).json({ success: false });
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
            return res.status(404).json({ success: false });
        }

        res.status(200).json({ success: true, data: bootcamp });

    } catch (err) {
        return res.status(400).json({ success: false });
    }
}

// @desc        Delete bootcamp
// @route       /api/v1/bootcamps/id
// @access      Private
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if (!bootcamp) {
            return res.status(404).json({ success: false });
        }

        res.status(200).json({ success: true, data: {} });

    } catch (err) {
        return res.status(400).json({ success: false });
    }
}