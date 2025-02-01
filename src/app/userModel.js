const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    UPI: String,
    merchant: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('Admin', userSchema);
