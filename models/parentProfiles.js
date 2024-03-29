const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username cannot be blank"],
  },
  password: {
    type: String,
    required: [true, "Password cannot be blank"],
  },
  parentName: String,
  phoneNum: Number,
  requestedStudent: Array,
  confirmedStudent: Array,
  townLocation: String,
  forwardGeocode: Array,
  zipCode: String,
  email: String,
  requestedStudent: Array,
  confirmedStudent: Array

});

const parentProfile = mongoose.model("parentProfile", parentSchema);

module.exports = parentProfile;
