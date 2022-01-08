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
  grade: String,
  phoneNum: Number,
  townLocation: String,
  forwardGeocode: Array,
  zipCode: String,
  email: String,
});

const parentProfile = mongoose.model("parentProfile", parentSchema);

module.exports = parentProfile;
