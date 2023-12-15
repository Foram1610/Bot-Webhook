require("dotenv").config();
const mongoose = require('mongoose');

const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
};

const connect = () => mongoose.createConnection(process.env.DEVELOP_DB_URI, mongoOptions);

const connectToMongoDB = () => {
    const db = connect(process.env.DEVELOP_DB_URI);
    db.on('open', () => {
        console.log(`Mongoose connection open `);
    });
    db.on('error', (err) => {
        console.log(`Mongoose connection error: ${err} with connection `);
        process.exit(0);
    });
    return db;
};

exports.mongodb = (connectToMongoDB)();