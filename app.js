const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./controllers/utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// Middlewares

// Body parser
app.use(express.json({
  limit: '10kb'
}));

app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));


// Limit request from the same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour'
});

app.use('/api', limiter);

// Data sanitization against nosql query injection.
app.use(mongoSanitize());

// Data sanitization against XSS.
app.use(xss());

// Serving static files
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req,res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
