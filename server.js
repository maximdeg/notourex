// const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
// const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');
// const catchAsync = require('./utils/catchAsync');

const connectDatabase = async function () {
   try {
      const db = process.env.DATABASE.replace(
         'USERNAME',
         process.env.DATABASE_USERNAME,
      ).replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

      await mongoose.connect(db);

      console.log('Connected to DATABASE 🦾');
   } catch (error) {
      console.error('Error connecting to database:\n', error);
   }
};

connectDatabase();

const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`App running on port ${port}...`);
});
