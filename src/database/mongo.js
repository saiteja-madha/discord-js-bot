const mongoose = require("mongoose");
const { MONGO_CONNECTION } = require("@root/config");
mongoose.plugin(require("mongoose-lean-defaults").default);

module.exports = async () => {
  await mongoose.connect(MONGO_CONNECTION, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  console.log("Database connection established");
};
