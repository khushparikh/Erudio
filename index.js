if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express("");
const path = require("path");
const methodOverride = require("method-override");
const bcrypt = require("bcrypt");
const session = require("express-session");

const mongoose = require("mongoose");
const Tutor = require("./models/tutorProfiles");
const Parent = require("./models/parentProfiles");
const Admin = require("./models/adminProfiles");
const Student = require("./models/studentProfiles");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    res.redirect("/home");
  } else {
    next();
  }
};

mongoose.connect("mongodb://localhost:27017/Erudio", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Mongo Database Connected");
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(session({ secret: "notagoodsecret" }));
app.use(express.static(path.join(__dirname, "public")));

const subjectList = [
  "Algebra1",
  "Geometry",
  "Physics",
  "Chemistry",
  "Algebra2",
  "PreCalculus",
  "English",
  "APEnglish",
  "Art",
  "Music",
  "BusinessElectives",
  "ComputerScience",
  "APCalculus",
];

app.get("/", async (req, res) => {
  res.render("home");
});

app.get("/studentLogin", async (req, res) => {
  res.render("login/studentLogin");
});

app.get("/tutorLogin", async (req, res) => {
  res.render("login/tutorLogin");
});

app.get("/parentLogin", async (req, res) => {
  res.render("login/parentLogin");
});

// student log in and register routes
app.post("/studentLogin", async (req, res) => {
  const { username, password, id } = req.body;
  const user = await Student.findOne({ username });
  if (!user) {
    res.redirect("login");
  } else {
    console.log(user.password);
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
      req.session.user_id = user._id;
      res.redirect("/StudentProfilePage");
    } else {
      res.redirect("login/studentLogin");
    }
  }
});

app.post("/studentRegister", async (req, res) => {
  const {
    username,
    password,
    studentName,
    townLocation,
    zipCode,
    grade,
    phoneNum,
    email,
    school,
  } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const notValidUser = await Student.findOne({ username });
  if (notValidUser) {
    res.redirect("register/studentRegister");
  } else {
    const {
      Algebra1,
      Geometry,
      Physics,
      Chemistry,
      Algebra2,
      PreCalculus,
      English,
      APEnglish,
      Art,
      Music,
      BusinessElectives,
      ComputerScience,
      APCalculus,
    } = req.body;
    const userSubjects = [];
    for (let subject of subjectList) {
      if (subject) {
        userSubjects.push(subject);
      }
    }

    const geoData = await geocoder
      .forwardGeocode({
        query: req.body.zipCode,
        limit: 1,
      })
      .send();
    console.log(geoData);
    var longLat = geoData.body.features[0].geometry.coordinates;
    console.log(longLat);

    const reverseData = await geocoder
      .reverseGeocode({
        query: geoData.body.features[0].geometry.coordinates,
      })
      .send();
    console.log(reverseData);

    var place = reverseData.body.features[1].place_name;

    count = place.indexOf(", United States");

    place = place.substring(0, count);

    const newStudent = new Student({
      username,
      password: hash,
      grade,
      studentName,
      townLocation: place,
      forwardGeoCode: longLat,
      zipCode,
      phoneNum,
      email,
      school,
    });

    await newStudent.save();
    console.log(newStudent);
    req.session.user_id = newStudent._id;
    res.redirect("/studentProfilePage");
  }
});

// Parent Routes
// login post
app.post("/parentLogin", async (req, response) => {
  const { username, password, id } = req.body;
  const user = await Parent.findOne({ parentName });
  if (user) {
    console.log(user.password);
    // idk if this works
    bcrypt.compare(password, user.password, function (err, res) {
      if (err) {
        throw err;
      } else if (res) {
        response.redirect("/parentProfilePage");
      }
    });
  } else {
    response.redirect("login/parentLogin");
  }
});

// profile get
app.get("/parentProfilePage", requireLogin, async (req, res) => {
  const foundUser = await Parent.findById(req.session.user_id);
  if (!foundUser) {
    res.redirect("/");
  } else {
    res.render("parentProfile");
  }
});

//Register Routes
app.get("/studentRegister", async (req, res) => {
  if (!req.session.user_id) {
    res.render("login/studentLogin");
  } else {
    res.render("register/studentRegister", subjectList);
  }
});

app.post("/parentRegister", async (req, res) => {
  res.redirect("parentProfile");
});

app.get("/parentRegister", async (req, res) => {
  if (!req.session.user_id) {
    res.render("login/parentLogin");
  } else {
    res.render("register/parentRegister");
  }
});

app.listen(3000, () => {
  console.log("LISTENING ON PORT 3000");
});
