const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = require('./app');

const PORT = process.env.PORT || 3000;

const DB_URL = process.env.DATABASE_URL.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB_URL)
.then(() => {
    console.log('DB connection successful');
});


// start server
app.listen(PORT, () => {
    console.log(`App running on port: ${PORT}`);
});
