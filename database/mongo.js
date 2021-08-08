const mongoose = require("mongoose");
const mongoPath = process.env.MONGO_CONNECTION;

module.exports = async () => {
  await mongoose.connect(mongoPath, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  console.log("Database connection established");
};
