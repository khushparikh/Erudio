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

//Login Routes
app.get("/studentLogin", async (req, res) => {
  res.render("login/studentLogin");
});

app.get("/tutorLogin", async (req, res) => {
  res.render("login/tutorLogin");
});

app.get("/parentLogin", async (req, res) => {
  res.render("login/parentLogin");
});

app.post("/studentLogin", async (req, res) => {
  const { username, password, id } = req.body;
  const user = await Student.findOne({ id });

  if (!user) {
    res.redirect("/studentLogin");
  } else {
    const validPassword = await bcrypt.compare(password, user.password);
    console.log(validPassword)
    if (validPassword) {
      req.session.user_id = user._id;
      res.redirect("/studentProfilePage");
    } else {
      res.redirect("/");
    }
  }
});

app.post("/parentLogin", async (req, response) => {
  const { username, password, id } = req.body;
  const user = await Parent.findOne({username});
  if (user) {
    console.log(user.password);
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

//Register Routes
app.get("/studentRegister", async (req, res) => {
  // 6:18 PM 1/12: Updated the logic for redirecting to the correct page--> when no session, then redirect to the register, otherwise redirect to the homepage
  if (!req.session.user_id) {
    res.render("register/studentRegister", subjectList);
  } else {
    res.redirect("/");
  }
});

app.get("/parentRegister", async (req, res) => {
  // 6:18 PM 1/12: Updated the logic for redirecting to the correct page--> when no session, then redirect to the register, otherwise redirect to the homepage
  if (!req.session.user_id) {
    res.render("register/parentRegister");
  } else {
    res.redirect("/");
  }
});

app.post("/parentRegister", async (req, res) => {
  const {
    username,
    password,
    parentName,
    zipCode,
    phoneNum,
    email,
  } = req.body;

  console.log(req.body);
  const hash = await bcrypt.hash(password, 12)
  const notValidUser = await Parent.findOne(
    { parentName }
  )
  if (notValidUser) {
    res.redirect("register/parentRegister")
  }

  // copied from student register
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

    const newParent = new Parent({
      username,
      password: hash,
      parentName,
      phoneNum,
      townLocation: place,
      forwardGeoCode: longLat,
      zipCode,
      email,
    });

    await newParent.save();
    console.log(newParent);
    req.session.user_id = newParent._id;
    res.redirect("/parentProfile");

});

app.post("/studentRegister", async (req, res) => {
  const {
    username,
    password,
    studentName,
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


// Profiles Routes
app.get('/parentProfile', requireLogin, async (req, res) => {
  const foundUser = await Parent.findById(req.session.user_id);
  if (!foundUser) {
    res.redirect("/");
  } else {
    res.render('parentProfile.ejs', {foundUser, subjectList});
  }
});

app.get('/studentProfilePage', requireLogin, async(req, res) => {
  const foundUser = await Student.findById(req.session.user_id);
    if(!foundUser){
        res.redirect('/studentLogin')
    }
    else{

        const parentList = [];
        
        for(let parentID of foundUser.requestedParent) {
          const parent = Parent.findById(parentID)
          parentList.push(parent)
        }
        res.render('profiles/studentProfile.ejs', {foundUser, parentList})
    }
})

app.get('/linkStudent', async(req, res) => {
  
    res.render('studentLink/linkStudent.ejs')
})

app.post('/linkStudent', async(req, res) => {
  
  const {studentLink} = req.body;
  console.log(req.body)


  const requestedStudent = await Student.findByIdAndUpdate(studentLink, req.body, {runValidators: true, new: true});
    const parent = requestedStudent.requestedParent;
    parent.push(req.session.user_id);
    requestedStudent.requestedParent = parent;
    await requestedStudent.save(); 
  
  console.log(requestedStudent);
})

app.get('/studentLink', async(req, res) => {
  
})


app.listen(3000, () => {
  console.log("LISTENING ON PORT 3000");
});
