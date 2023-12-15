require("dotenv").config();
console.log("process.env.DEVELOP_DB_URI ", process.env.DEVELOP_DB_URI);
module.exports = {
    DB_URI : process.env.DEVELOP_DB_URI
}