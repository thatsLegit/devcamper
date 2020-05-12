const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');


//Here we have all methods that are associated with the bootcamps routes

// @desc        Get bootcamps (filters included)
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc        Get single bootcamp
// @route       GET /api/v1/bootcamps/id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    //or Bootcamp.find({ name: req.params.id })...

    //if the formatting is correct but no id matching
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: bootcamp });
});

// @desc        Create bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    /*Create a document in the collection bootcamps basically
    Mongoose always returns a Promise, so await it */
    req.body.user = req.user.id;

    //Check for published bootcamps
    const isPublished = await Bootcamp.find({ user: req.body.user });
    //If the user is not an admin he can only publish one bootcamp
    if (isPublished && req.user.role !== 'admin') {
        return next(new ErrorResponse(`You already have one published bootcamp`, 403));
    }

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
    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    //Only the owner of the bootcamp can delete it (and the admin)!
    if (bootcamp.user != req.user.id && req.user.role != 'admin') {
        return next(new ErrorResponse(`Action forbidden to user with id ${req.params.id}`, 403));
    }

    bootcamp = Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: bootcamp });
});

// @desc        Delete bootcamp
// @route       DELETE /api/v1/bootcamps/id
// @access      Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id); //findByIdAndDelete doesn't work with pre('remove') hook

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    //Only the owner of the bootcamp can delete it (and the admin)!
    if (bootcamp.user != req.user.id && req.user.role != 'admin') {
        return next(new ErrorResponse(`Action forbidden to user with id ${req.params.id}`, 403));
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

// @desc        Upload photo for a bootcamp
// @route       PUT /api/v1/bootcamps/:id/photo
// @access      Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    //Only the owner of the bootcamp can delete it (and the admin)!
    if (bootcamp.user != req.user.id && req.user.role != 'admin') {
        return next(new ErrorResponse(`Action forbidden to user with id ${req.params.id}`, 403));
    }

    //Check if there's a file uploaded
    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;

    //Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload a photo`, 400));
    }

    //Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD} MB`, 400));
    }

    //Create custom file name (quite what I did in Oporctunite)
    file.name = bootcamp._id + path.parse(file.name).ext;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.err(error);
            return next(new ErrorResponse(`Problem with the uploads`, 500));
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
        res.status(200).json({
            success: true,
            data: file.name
        });
    });
});