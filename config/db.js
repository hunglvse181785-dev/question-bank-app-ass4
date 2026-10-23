const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Chưa khai báo MONGODB_URI trong .env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Đã kết nối MongoDB:', mongoose.connection.name);
}

module.exports = connectDB;