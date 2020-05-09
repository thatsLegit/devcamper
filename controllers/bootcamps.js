const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');


//Here we have all methods that are associated with the bootcamps routes

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    //Contains filtering and sorting via the query string
    //ex : ?careers[in]=Data Science&select=name,careers&sort=-name
    let query;
    let reqQuery = { ...req.query }; //Makes a copy of query object 

    //Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    //Loop through excluded params and remove them from reqQery
    //Reminder : objectName.propertyName or objectName["propertyName"]
    removeFields.forEach(param => delete reqQuery[param]);

    //To enable advanced filtering key words such as lte, gte... we have to put a $ :
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(lte|lt|gt|gte|in)\b/g, match => `$${match}`); //in: within list

    //Finding resource
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses'); //populate with virtual courses

    /*The idea here is to first get the whole resource with all filters, and then...
    Select only the fields we need.
    This is done with query.select(name1 name2), but we want to replace " " by "," : */
    if (req.query.select) {
        const fields = req.query.select.replace(/,/g, ' ');
        query.select(fields);
    }

    //Then we allow a custom sorting :
    if (req.query.sort) {
        const sortBy = req.query.sort.replace(/,/g, ' ');
        query.sort(sortBy);
    } else { //Default sorting...
        query.sort('-createdAt');
    }

    //Simulate pagination by limiting the number of displayed results
    //and skipping certain results :
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit //end-start = limit
    const total = await Bootcamp.countDocuments();

    query.skip(startIndex).limit(limit);

    let pagination = {};

    if (total > endIndex) {
        pagination = {
            next: page + 1,
            page
        }
    }
    if (startIndex > 1) {
        pagination = {
            prev: page - 1,
            page
        }
    }


    const bootcamps = await query;
    res.status(200).json({ success: true, count: bootcamps.length, pagination, data: bootcamps });
});

// @desc        Get single bootcamp
// @route       GET /api/v1/bootcamps/id
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
// @route       POST /api/v1/bootcamps
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
// @route       PUT /api/v1/bootcamps/id
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
// @route       DELETE /api/v1/bootcamps/id
// @access      Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id); //findByIdAndDelete doesn't work with pre('remove') hook

    if (!bootcamp) {
        return next(new ErrorResponse(`Resource not found with id ${req.params.id}`, 404));
    }

    bootcamp.remove();

    res.status(200).json({ success: true, data: {} });
});


// @desc        Get bootcamps within a radius
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
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