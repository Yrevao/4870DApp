const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    name: String,
    address: String,
    assets: [{id: String, price: Number}]
});

module.exports = mongoose.model('Site', siteSchema);