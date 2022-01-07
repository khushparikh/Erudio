const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        // required: [true, 'Password cannot be blank']
    },
    adminName: String,
    townLocation: String,   
    description: String, 
    forwardGeocode: Array,
    zipCode: String,
    tutors: Array,   
    phoneNum: Number,
})

const adminProfile = mongoose.model('adminProfile', adminSchema);

module.exports = adminProfile; 