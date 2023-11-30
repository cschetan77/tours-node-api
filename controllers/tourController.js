const Tour = require('../models/tourModel');
const APIFeatures = require('./utils/APIFeatures');

const aliasTopTours = (req, res, next) => {
    req.query = {
        ...req.query,
        limit: '5',
        sort: '-ratingsAverage,price',
        fields: 'name,price,ratingsAverage,summary,difficulty'
    };
    next();
};

const getAllTours = async (req, res) => {
    try {
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();

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
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

const getTour = async (req, res) => {
    const tourId = req.params.id;
    try {
        const tour = await Tour.findById(tourId);
        res.status(200).json({
            status: "success",
            data: {
                tour: tour
            }
        });
    }
    catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
};

const createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch(err) {
        res.status(400).json({
            status: 'failed',
            message: 'Inavlid data sent'
        });
    }
    
};

const updateTour = async (req, res) => {
    try {
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
    }
    catch(err) {
        res.status(400).json({
            status: 'failed',
            message: 'Inavlid data sent'
        });
    }
    
};

const deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: "success",
            data: null
        })
    }
    catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
};

const getTourStats = async (req, res) => {
    try {
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
    }
    catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

module.exports = {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats
}
