const mongoose = require('mongoose');

const connectDB = async () => {
    /*mongoose functions return promises
    the MongoDB connection string is in the config file*/
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });

    console.log(`Connected to database: ${conn.connection.host}`.cyan.underline.bold);
}

module.exports = connectDB;