require("dotenv").config();
console.log("process.env.NODE_ENV ", process.env.NODE_ENV);
if (process.env.NODE_ENV === "develop")
  module.exports = require("./develop.config");
if (process.env.NODE_ENV === "production")
  module.exports = require("./production.config");


  