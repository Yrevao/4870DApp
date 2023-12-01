const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const routes = require('./lib/routes');

mongoose.connect(process.env.MONGOURI).
    then(() => console.log("mongoDB connected")).
    catch(error => {
        console.log(`ERROR: cannot connect to mongodb \n ${error}`);
    });

const app = express();
app.use('/', routes);
app.use(express.static('./app/public'));
app.listen("4123");