const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const routes = require('./lib/routes');
const settings = require('./settings');
const crypto = require('crypto');

const x = 'an asset'
const hashedx = crypto.createHash('sha1').update(x).digest('hex');
console.log(hashedx)
return;

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