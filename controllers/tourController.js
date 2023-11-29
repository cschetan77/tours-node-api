const fs = require('fs');
const Tour = require('../models/tourModel');

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

const getAllTours = async (req, res) => {
    try {
        // Build Query
        const queryObj = {...req.query};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => {
            delete queryObj[el];
        });
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        const query = Tour.find(JSON.parse(queryStr));
        // Execute Query
        const tours = await query;

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

module.exports = {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour
}
