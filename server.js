const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('🚨 Uncaught Rejection, Shutting Down Gracefully...');
    process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const PORT = process.env.PORT || 3000;

const DB_URL = process.env.DATABASE_URL.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB_URL)
.then(() => {
    console.log('DB connection successful');
});


// start server
const server = app.listen(PORT, () => {
    console.log(`App running on port: ${PORT}`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('🚨 Unhandled Rejection, Shutting Down Gracefully...');
    server.close(() => {
        process.exit(1);
    });
});

