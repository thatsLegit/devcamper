const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

//load env vars
dotenv.config({ path: './config/config.env' });

//Load models
const Bootcamp = require('./models/Bootcamp');

//Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

//Read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

//Import into DB
const importD = async () => {
    try {
        await Bootcamp.create(bootcamps);
        console.log('Data imported...'.green.inverse);
        process.exit();
    } catch (error) {
        console.log(err);
    }
}

//Delete data
const deleteD = async () => {
    try {
        //deleteMany() deletes everything
        await Bootcamp.deleteMany();
        console.log('Data deleted...'.red.inverse);
        process.exit();
    } catch (error) {
        console.log(err);
    }
}

/*development only tool, in cli write node seeder -i/-d to
trigger the first or second option*/
if (process.argv[2] === '-i') {
    importD();
} else if (process.argv[2] === '-d') {
    deleteD();
}