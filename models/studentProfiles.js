const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        // required: [true, 'Password cannot be blank']
    },
    studentName: String,
    grade: String, 
    townLocation: String,  
    pastTutors: Array,
    potentialTutors: Array, 
    forwardGeocode: Array,
    zipCode: String,
    subjects: Array, 
    totalHours: String,  
    email: String,
})

const studentProfile = mongoose.model('studentProfile', studentSchema);

module.exports = studentProfile; 