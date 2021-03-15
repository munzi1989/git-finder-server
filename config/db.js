const mongoose = require('mongoose');
const config = require('config');

// get URI from config file w/ config method
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    // connect mongoose with options
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log('SUCCESS! Mongoose connected to MongoDB!');
  } catch (err) {
    console.error(err.message);
    // exit on failure
    process.exit(1);
  }
};

module.exports = connectDB;
