const Tour = require('../models/tourModel');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

// Multer and sharp configuration
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
   if (file.mimetype.startsWith('image')) {
      cb(null, true);
   } else {
      cb(new AppError('Not an image! Please upload only images.', 400), false);
   }
};

const upload = multer({
   storage: multerStorage,
   fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
   { name: 'imageCover', maxCount: 1 },
   { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
   // req.file for single files

   if (!req.files.imageCover || !req.files.images) return next();

   // COVER IMAGE
   req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
   await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);

   // IMAGES
   req.body.images = [];
   await Promise.all(
      req.files.images.map(async (file, i) => {
         const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

         await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`);

         req.body.images.push(filename);
      }),
   );
   next();
});

//?limit=5&sort=-ratingsAverage,price
exports.aliasTopTours = async (req, res, next) => {
   req.query.limit = '5';
   req.query.sort = '-ratingsAverage,price';
   req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
   next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// Aggregation pipelines
exports.getTourStats = catchAsync(async (req, res, next) => {
   const stats = await Tour.aggregate([
      {
         $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
         $group: {
            _id: { $toUpper: '$difficulty' }, // SETS TO UPPER CASE AND ORDERS THEM BY DIFFICULTY
            numTours: { $sum: 1 }, // GIVES YOU THE NUMBER OF TOURS
            numRatings: { $sum: '$ratingsQuantity' },
            avgRating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
         },
      },
      {
         $sort: { avgPrice: 1 },
      },
      // TO MATCH MULTIPLE TIMES
      // {
      //     $match: { _id: { $ne: 'EASY' } },
      // },
   ]);
   res.status(200).json({
      status: 'success',
      data: {
         stats: stats,
      },
   });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
   const year = req.params.year * 1; // 2021

   const plan = await Tour.aggregate([
      {
         $unwind: '$startDates',
      },
      {
         $match: {
            startDates: {
               $gte: new Date(`${year}-01-01`),
               $lte: new Date(`${year}-12-31`),
            },
         },
      },
      {
         $group: {
            _id: { $month: '$startDates' },
            numToursStarts: { $sum: 1 },
            tours: { $push: '$name' },
         },
      },
      {
         $addFields: { month: '$_id' }, // FIRST PARAMETR THE NAME AND SECOND WHICH TO REPRESENT THE VALUE
      },
      {
         $project: {
            _id: 0, // 0 IF YOU HIDE AND 1 IS FOR SHOWING
         },
      },
      {
         $sort: { month: 1 }, // 1 FOR ASCENDING AND -1 FOR DESCENDING
      },
      {
         $limit: 12, // SHOW ONLY 6 PARAMETERS
      },
   ]);

   res.status(200).json({
      status: 'success',
      data: {
         plan,
      },
   });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
   const { distance, latlng, unit } = req.params;
   const [lat, lng] = latlng.split(',');

   // Need to convert radius to radians = divide the distance by the radius of the earth
   // In case of mi first option, in case of km second option
   const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

   if (!lat || !lng) {
      next(
         new AppError(
            'Please provide latitud and longitude in the format lat,lng',
            400,
         ),
      );
   }

   const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
   });

   res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
         data: tours,
      },
   });
});

exports.getDistances = catchAsync(async (req, res, next) => {
   const { latlng, unit } = req.params;
   const [lat, lng] = latlng.split(',');

   const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

   if (!lat || !lng) {
      next(
         new AppError(
            'Please provide latitud and longitude in the format lat,lng',
            400,
         ),
      );
   }

   const distances = await Tour.aggregate([
      {
         $geoNear: {
            near: {
               type: 'Point',
               coordinates: [lng * 1, lat * 1], // multiply by 1 to change them to number
            },
            distanceField: 'distance',
            distanceMultiplier: multiplier,
         },
      },
      {
         $project: {
            distance: 1,
            name: 1,
         },
      },
   ]);

   res.status(200).json({
      status: 'success',
      data: {
         data: distances,
      },
   });
});
