const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');


//Here we have all methods that are associated with the bootcamps routes

// @desc        Get all bootcamps
// @route       /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    //Contains filtering via the query string
    //To enable advanced filtering key words such as lte, gte...
    let query;
    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(/\b(lte|lt|gt|gte|in)\b/g, match => `$${match}`); //in: within list

    console.log(queryStr);

    query = Bootcamp.find(JSON.parse(queryStr));
    const bootcamps = await query;

    res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc        Get single bootcamp
// @route       /api/v1/bootcamps/id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    //or Bootcamp.find({ name: req.params.id })...

    //if the formatting is correct but no id matching
    if (!bootcamp) {
        return next(new ErrorResponse(`Resource not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: bootcamp });
});

// @desc        Create bootcamp
// @route       /api/v1/bootcamps
// @access      Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    /*Create a document in the collection bootcamps basically
    Mongoose always returns a Promise, so await it */
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data: bootcamp
    });
});

// @desc        Update bootcamp
// @route       /api/v1/bootcamps/id
// @access      Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!bootcamp) {
        return next(new ErrorResponse(`Resource not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: bootcamp });
});

// @desc        Delete bootcamp
// @route       /api/v1/bootcamps/id
// @access      Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Resource not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: {} });
});


// @desc        Get bootcamps within a radius
// @route       /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    //destructuring makes getting data from url quite easy
    const { zipcode, distance } = req.params;

    //Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //calc radians using radius
    //divide distance by the radius of the Earth
    //The radius of the Eatch is 6378km
    const radians = distance / 6378
    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radians]
            }
        }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});