const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/error');
//morgan: logger middleware
const morgan = require('morgan');
const colors = require('colors');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

//load env vars
dotenv.config({ path: './config/config.env' });

//Connect to database
connectDB();

//require routes
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

//Initialize express
const app = express();

/*A middleware is just a function that has access to req, res
that ends with a next();
integrate it to app.use() and the middleware will be ran on each request.
The middlewares are being ran before the actual code for the route
So a logger mddw would authenticate and then pass the user a req var ! */

//body parser middleware
app.use(express.json());

//Cookie parser
app.use(cookieParser());

/*Dev logging middleware
To be used only in development mode*/
if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}

//File uploading
app.use(fileupload());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent cross-site scripting
app.use(xss());

//Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 1000 * 60, //10 minutes
    max: 100
});
app.use(limiter);

//Prevent http param pollution
app.use(hpp());

/*Enable cross-origin ressource sharing (default is same origin policy)
But if we want our api to be public, we must enable it.*/
app.use(cors());

//Set static folder (accessible in the url through localhost:port/uploads/...)
app.use(express.static(path.join(__dirname, 'public')));

//Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

/*The errorHandling middleware has to be AFTER
routers mounting quite logically*/
/*Attention, le middleware a accès aux req, res mais pas aux routes donc /:id...*/
app.use(errorHandler);

/*By default NODE_ENV is set to development
If you don't have two separate scripts for dev and prod, 
we cannot really distinguish devlopment and production
dependencies.*/
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

/*Handle unhandled promise rejection
This is typically in case we cannot 
connect to MongoDB whathever the reason*/
process.on('unhandledRejection', (err, promise) => {
    console.log(`error: ${err.message}`.red);
    //close server & exit process
    server.close(() => process.exit(1));
})