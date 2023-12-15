const mongoose = require("mongoose");
const { DB_URI } = require("./index");

console.log("Connecting to ", DB_URI);
mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(`MongoDB Connection Error: ${err.message}`));
module.exports = mongoose.connection;
