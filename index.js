if(process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express');
const app = express('');
const path = require('path');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const session = require('express-session');

const mongoose = require('mongoose');
const Tutor = require('./models/tutorProfiles');
const Parent = require('./models/parentProfiles')
const Admin = require('./models/adminProfiles')
const Student = require('./models/studentProfiles')

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken})

const requireLogin = (req, res, next) => {
    if(!req.session.user_id){
        res.redirect('/home')
    }
    else{
        next();
    }
}

mongoose.connect('mongodb://localhost:27017/voluntier', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Mongo Database Connected");
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(session({secret: 'notagoodsecret'}));
app.use(express.static(path.join(__dirname, 'public')))

const subjectList = []

app.get('/', async(req, res) => {
    res.render('home')
})  

app.get('/studentRegister', async(req, res) =>{
    if(!req.session.user_id){
        res.render('studentLogin')
    } else {
        res.render('home', subjectList)
    }
})

app.post('studentLogin', async(req, res) =>{
    const {username, password, studentName, townLocation, zipCode, grade, email} = req.body;
    const hash = await bcrypt.hash(password, 12);
    const notValidUser = await Student.findOne({username});
    if(notValidUser) {
        res.redirect('/studentLogin')
    } else {
        const {Algebra1, Geometry, Physics, Chemistry, Algebra2, PreCalculus, English, APEnglish, Art, Music, BusinessElectives, ComputerScience, APCalculus} = req.body;
        const userSubjects = [];
        const subjects = ["Algebra 1", "Geometry", "Physics", "Chemistry", "Algebra 2", "Pre-Calculus", "English", "AP English", "Art", "Music", "Business Electives", "Computer Science", "AP Calculus"];
        for(let subject of subjects) { 
            if(subject){
                userSubjects.push(subject);
            }
        }
        
        const geoData = await geocoder.forwardGeocode({
            query: req.body.zipCode,
            limit: 1
        }).send()
        console.log(geoData)
        var longLat = geoData.body.features[0].geometry.coordinates;
        console.log(longLat)

        const reverseData = await geocoder.reverseGeocode({
            query: geoData.body.features[0].geometry.coordinates,
        }).send()
        console.log(reverseData)
        
        var place = reverseData.body.features[1].place_name
           
        count = place.indexOf(", United States");

        place = place.substring(0, count);

        const newStudent = new Student({
            username, 
            password: hash,
            orgName,
            townLocation: place,
            forwardGeocode: longLat,
            zipCode,
            subjects: userSubjects,
            phoneNum,
            description
        })
        await newStudent.save();
        console.log(newStudent);
        req.session.user_id = newStudent._id;
        res.redirect('/studentProfilePage')
    }
})










app.listen(3000, () => {
    console.log("LISTENING ON PORT 8080")
})




