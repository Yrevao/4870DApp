const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    receiverId: String,
    transferAddress: String,
    name: String,
    price: Number
});

module.exports = mongoose.model('Transfer', transferSchema);