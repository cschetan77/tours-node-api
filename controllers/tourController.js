const Tour = require('../models/tourModel');
const APIFeatures = require('./utils/APIFeatures');
const AppError = require('./utils/AppError');
const catchAysnc = require('./utils/catchAsync');

const aliasTopTours = (req, res, next) => {
    req.query = {
        ...req.query,
        limit: '5',
        sort: '-ratingsAverage,price',
        fields: 'name,price,ratingsAverage,summary,difficulty'
    };
    next();
};

const getAllTours = catchAysnc(async (req, res, next) => {
        const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

        // Execute Query
        const tours = await features.mongooseQuery;

        // Send Response
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        });
});

const getTour = catchAysnc(async (req, res, next) => {
    const tourId = req.params.id;
    const tour = await Tour.findById(tourId);
    if(!tour) {
        return next(new AppError('No tour found with given ID', 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            tour: tour
        }
    });
});

const createTour = catchAysnc(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
});

const updateTour = catchAysnc(async (req, res, next) => {
        const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({
            status: "success",
            data: {
                tour: updatedTour
            }
        })
});

const deleteTour = catchAysnc(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if(!tour) {
        return next(new AppError('No tour found with given ID', 404));
    }
    res.status(204).json({
        status: "success",
        data: null
    })
});

const getTourStats = catchAysnc(async (req, res, next) => {
        const stats = await Tour.aggregate([
            {
                $match: {ratingsAverage: {$gte: 4.5}}
            },
            {
                $group: {
                    _id: {$toUpper: '$difficulty'},
                    numTours: {$sum: 1},
                    numRatings: {$sum: '$ratingsQuantity'},
                    averageRating: {$avg: '$ratingsAverage'},
                    averagePrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'}
                }
            },
            {
                $sort: {averagePrice: 1}
            }
        ]);

        res.status(200).json({
            status: "success",
            data: {
                stats: stats 
            }
        })
});

const getMonthlyPlan = catchAysnc(async (req, res, next) => {
        const year = req.params.year * 1 || 2021;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }}
            },
            {
                $group: {
                    _id: {$month: '$startDates'},
                    numTourStarts: {$sum: 1},
                    tours: {$push: '$name'}
                }
            },
            {
                $addFields: {month: '$_id'}
            },
            {
                $project: {_id: 0}
            },
            {
                $sort: {numTourStarts: -1}
            }
        ]);
        res.status(200).json({
            status: "success",
            data: {
                plan: plan 
            }
        })
});

module.exports = {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan
}
