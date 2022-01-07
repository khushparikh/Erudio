const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        // required: [true, 'Password cannot be blank']
    },
    parentName: String,
    townLocation: String,  
    children: Array,
    forwardGeocode: Array,
    zipCode: String,
    totalHours: String,  
    email: String,
    phoneNum: String,
})

const parentProfile = mongoose.model('parentProfile', parentSchema);

module.exports = parentProfile; 