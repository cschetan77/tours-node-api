const { Schema, model } = require('mongoose');
const slugify = require('slugify');

const tourSchema = new Schema({
    name: {
        type: String,
        required: [true, 'tour must have a name'],
        unique: true,
        trim: true
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'tour must have a price']
    },
    priceDiscount: {
        type: Number,
        valdiate: {
            message: 'Discount price ({VALUE}) should be below regular price',
            // this only points to current doc on new document creation
            validator: function(val) {
                return val < this.price
            }
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date]
}, {
    toJSON: {virtuals: true}
});

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration/7;
});

// Document Middleware runs before .save() and .create()
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true});
    next();
});

// Query Middlewares
tourSchema.pre('find', function(next) {
    console.log(this);
    next();
});

const Tour = model('Tour', tourSchema);

module.exports = Tour;
