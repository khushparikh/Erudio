const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        // required: [true, 'Password cannot be blank']
    },
    tutorName: String,
    grade: String, 
    townLocation: String,  
    recommendations: Array, 
    forwardGeocode: Array,
    zipCode: String,
    tutorScore: String,
    subjects: Array, 
    totalHours: String,  
    phoneNum: String,
    pastRoles: Array,
    rating: Number,

})

const tutorProfile = mongoose.model('tutorProfile', tutorSchema);

module.exports = tutorProfile; 