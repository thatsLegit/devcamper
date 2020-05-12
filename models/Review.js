const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for the review'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

//Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ user: 1, bootcamp: 1 }, { unique: true });

//We create for CourseSchema, a static function
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId } //on récupère tous les cours qui ont ce bootcampId
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating' } //on aggrege en appliquant une moyenne des notes
            }
        }
    ]);

    try {
        //Here we use this.model() but could have just required the Bootcamp model...
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating
        });
    } catch (err) {
        console.log(err);
    }
};

//Call getAverageRating after save
ReviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.bootcamp);
});

//Call getAverageRating before remove
ReviewSchema.pre('remove', function () {
    this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);