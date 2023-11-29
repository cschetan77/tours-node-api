const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./models/tourModel');

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE_URL.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB);

// Read json file 

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json', 'utf-8'));

// Import data into DB
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data successfully uploaded');
    }
    catch(err) {
        console.log(err);
    }
    process.exit();
};

// Delete all data in DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data deleted successfully');
    }
    catch(err) {
        console.log(err);
    }
    process.exit();
};

const arg = process.argv[2];

if(arg === '--import') {
    importData();
}
else if(arg === '--delete') {
    deleteData();
}
else {
    console.log('Wrong argument');
}
