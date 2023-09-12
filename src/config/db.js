const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.URLMongoodb;
async function connect() {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    await mongoose.connect(url, connectionParams);
    console.log("Connect Success");
  } catch (error) {
    console.log("Connect False");
  }
}
module.exports = { connect };
