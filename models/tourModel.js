const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, 'A tour must have a name'],
         unique: true,
         trim: true,
         // This is a validator of strings only
         maxlength: [
            40,
            'A tour name must have less or equal then 40 characters',
         ],
         minlength: [
            10,
            'A tour name must have more or equal then 10 characters',
         ],
         // // Using validator library, for a custom validator
         // validate: [
         //     validator.isAlpha,
         //     'Tour name must only contain characters',
         // ],
      },
      slug: String,
      duration: {
         type: Number,
         required: [true, 'A tour must have a duration'],
      },
      maxGroupSize: {
         type: Number,
         required: [true, 'A tour must have a group size'],
      },
      difficulty: {
         type: String,
         required: [true, 'A tour must hace a difficulty'],
         // enum is a validator only for strings
         enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, or difficult',
         },
      },
      ratingsAverage: {
         type: Number,
         default: 4.5,
         // Number validator for max and min
         min: [0.5, 'Rating must be above 0.5'],
         max: [5, 'Ratings must be below 5'],
         set: val => Math.round(val * 10) / 10,
      },
      ratingsQuantity: {
         type: Number,
         default: 0,
      },
      price: {
         type: Number,
         required: [true, 'A tour must have a price'],
      },
      priceDiscount: {
         type: Number,
         // CUSTOM VALIDATOR with a function and a message, ({VALUE}) is a MongoDB property
         // It is not going to be valid on update
         validate: {
            validator: function (val) {
               // This only points to current doc on NEW document creation
               return val < this.price;
            },
            message:
               'Discount price ({VALUE}) should be below the regular price',
         },
      },
      summary: {
         type: String,
         trim: true,
         required: true,
      },
      description: {
         type: String,
         trim: true, // DOES NOT SHOW THE WHOLE THING
      },
      imageCover: {
         type: String,
         required: ['A tour must have a cover image'], // SENDS A FAIL IF ITS NOT FILLED UP
      },
      images: [String],
      createdAt: {
         type: Date,
         default: Date.now(),
         select: false, // EXCLUDES THE FIELD FROM SHOWING
      },
      startDates: [Date],
      secretTour: {
         type: Boolean,
         default: false,
      },
      startLocation: {
         // GeoJSON
         // We need sub-fields, at least type and coordinates
         type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
         },
         coordinates: [Number],
         address: String,
         description: String,
      },
      locations: [
         {
            type: {
               type: String,
               default: 'Point',
               enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number,
         },
      ],
      // EMBEDING
      //   guides: Array,
      // DATA REFERENCING
      guides: [
         {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
         },
      ],
   },
   {
      // OPTIONS FOR THE schema
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
   },
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
   return this.duration / 7;
});

// Virtual populate to have the reviews Id on tours
tourSchema.virtual('reviews', {
   ref: 'Review',
   foreignField: 'tour',
   localField: '_id',
});

// DOCUMENT MIDDLEWARE MONGOOSE: it turns before the .save() and .create() commands
tourSchema.pre('save', function (next) {
   this.slug = slugify(this.name, { lower: true });
   next();
});

// EMBEDDING
// tourSchema.pre('save', async function (next) {
//      const guidesPromises = this.guides.map(async id => User.findById(id));
//      this.guides = await Promise.all(guidesPromises);

//      next();
// });

// DOC MIDDLEWARE
// tourSchema.pre('save', function (next) {
//     console.log('Will save document...');
//     next();
// });

// POST MIDDLEWARE FROM MONGODB
// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
   this.find({ secretTour: { $ne: true } });

   this.start = Date.now();
   next();
});

tourSchema.pre(/^find/, function (next) {
   this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt',
   });

   next();
});

// QUERY MIDDLEWARE FOR ALL THE FIND METHODS
// tourSchema.post(/^find/, function (docs, next) {
//    console.log(`Query took ${Date.now() - this.start} milliseconds!`); // FINISHED AND USED HERE

//    next();
// });

// AGGREATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//     // this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
