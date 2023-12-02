const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const routes = require('./lib/routes');
const options = require('./options');

if(options.enableMongo) {
    mongoose.connect(process.env.MONGOURI).
        then(() => console.log("mongoDB connected")).
        catch(error => {
            console.log(`ERROR: cannot connect to mongodb \n ${error}`);
        });
}

const app = express();
app.use('/', routes);
app.use(express.static('./app/public'));
app.listen(options.port);