const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    name: String,
    address: String,
    assets: [{name: String, price: Number}]
});

module.exports = mongoose.model('Site', siteSchema);