const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//////////////////////////////////////////////////////////////
// GLOBAL MIDDLEWARES
// Show the http request and the status of the request

// Set security HTTP headers
// app.use(helmet());
/////////////////////////////////////////////////////////////////
// NEW CODE
// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
const styleSrcUrls = [
   'https://unpkg.com/',
   'https://tile.openstreetmap.org',
   'https://fonts.googleapis.com/',
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

//set security http headers
app.use(
   helmet.contentSecurityPolicy({
      directives: {
         defaultSrc: [],
         connectSrc: ["'self'", ...connectSrcUrls],
         scriptSrc: ["'self'", ...scriptSrcUrls],
         styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
         workerSrc: ["'self'", 'blob:'],
         objectSrc: [],
         imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
         fontSrc: ["'self'", ...fontSrcUrls],
      },
   }),
);
//////////////////////////////////////////////////////////////////

// Development logging
if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'));
}

const limiter = rateLimit({
   max: 100,
   windowMs: 60 * 60 * 1000,
   message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// Parses the data from the parser
app.use(cookieParser());

// DATA sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Prevents parameter polution, duplicate fields on queries
app.use(
   hpp({
      whitelist: [
         'duration',
         'ratingsQuantity',
         'ratingsAverage',
         'maxGroupSize',
         'difficulty',
         'price',
      ],
   }),
);

app.use(compression());

// Serving static files
// Access static public files
app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// middleware to show the time
app.use((req, res, next) => {
   req.requestTime = new Date().toISOString();
   next();
});

//////////////////////////////////////////////////////////////////
// ROUTES

app.use('/', viewRouter);
app.use('/api/v2/tours', tourRouter);
app.use('/api/v2/users', userRouter);
app.use('/api/v2/reviews', reviewRouter);

// use this on this section of the code
// Stands for all http methods
app.all('*', (req, res, next) => {
   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

app.use((err, req, res, next) => {
   // err.stack gives you the stack trace of the error
   err.statusCode = err.statusCode || 500;
   err.status = err.status || 'error';

   res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
   });
});

module.exports = app;
