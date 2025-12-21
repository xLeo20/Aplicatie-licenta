const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Conectat: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.log(`Eroare: ${error.message}`.red.bold);
    process.exit(1);
  }
};

module.exports = connectDB;