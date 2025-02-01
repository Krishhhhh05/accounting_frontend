const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    UPI: String,
    nameonupi: String, // Ensure this field is included
    password: String, // Add password to schema
    walletbalance: { type: Number, default: 0 }, // Add wallet balance field with default value 0
}, {
    timestamps: true
});

module.exports = mongoose.model('Admin', userSchema);