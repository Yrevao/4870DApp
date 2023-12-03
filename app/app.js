const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const routes = require('./lib/routes');
const settings = require('./settings');

if(settings.enableMongo) {
    mongoose.connect(process.env.MONGOURI).
        then(() => console.log("mongoDB connected")).
        catch(error => {
            console.log(`ERROR: cannot connect to mongodb \n ${error}`);
        });
}

const app = express();
app.use('/', routes);
app.use(express.static('./app/public'));
app.listen(settings.port);