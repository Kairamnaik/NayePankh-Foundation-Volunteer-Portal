const dbShim = require('./dbShim');

const connectDB = async () => {
  await dbShim.connectDB();
};

module.exports = connectDB;
