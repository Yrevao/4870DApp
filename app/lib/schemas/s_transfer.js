const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    transferAddress: String,
    name: String,
    price: Number
});

module.exports = mongoose.model('Transfer', transferSchema);