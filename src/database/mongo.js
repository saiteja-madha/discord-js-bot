const mongoose = require("mongoose");
const mongoPath = process.env.MONGO_CONNECTION;
mongoose.plugin(require("mongoose-lean-defaults").default);

module.exports = async () => {
  await mongoose.connect(mongoPath, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  console.log("Database connection established");
};
