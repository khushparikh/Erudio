const mongoose = require("mongoose");
const studentProfile = require("./models/studentProfiles.js");
const bcrypt = require("bcrypt");

mongoose
  .connect("mongodb://localhost:27017/Erudio", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("OH NO MONGO CONNECTION ERROR!");
    console.log("Error");
  });

const password = "monkey123";
const hash = bcrypt.hash(password).then(function (hash) {
  console.log(hash);
});

const Neil = new studentProfile({
  username: "neilagrawal",
  password: hash,
  studentName: "Neil Agrawal",
  grade: 11,
  townLocation: "Montville",
  pastTutors: ["Sunay"],
  potentialTutors: ["Khush"],
  zipCode: "07045",
  subjects: ["Geometry"],
  totalHours: 99,
  email: "neil.agrawal23@montville.net",
});

Neil.save();
