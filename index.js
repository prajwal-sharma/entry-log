const express = require('express')
const app = express()
const path = require('path')
const nodemailer = require('nodemailer');
const email_config = require('./emailconfig')
const Email = require('email-templates');
const port = process.env.PORT || 8000;
var moment = require('moment-timezone');
// console.log(email_config.email)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: false}));

//METHOD OVER RIDE
const methodOverride = require('method-override')
app.use(methodOverride('_method'))//over ride get and post method


// MONGODB
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URL||'mongodb://localhost:27017/entry-app').then(() => {
    console.log("Connected")
}).catch((err) => {
    console.log(err)
})


// START EMAIL
const transporter = nodemailer.createTransport({
    service:'gmail',
    // host: 'smtp.mailtrap.io',
    // port: 465,
    // secure: false,
    auth: {
        user: email_config.email,
        pass: email_config.password
    }
});
const email = new Email({
    views: {
        root: "./views/templates/",
        options: {extension: 'ejs',}
    },
    from: email_config.from,
    send: true,
    preview: false,
    transport: transporter,
});

// START SCHEMA
const formSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    address: String,
    email: String,
    phone_number: Number,
    arrival_time: String,
    arrival_date: String,
    departure_time: String,
    departure_date: String,
    is_inside: Boolean

})

const depSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    address: String,
    email: String,
    phone_number: Number,
    arrival_time: String,
    arrival_date: String,
    departure_time: String,
    departure_date: String,
    is_inside: Boolean
})
const log = mongoose.model('Log', formSchema)
const deplog = mongoose.model('deplog', depSchema)
// const accdb = mongoose.model("logs")


// LOGIC
const dateTime = moment().tz("Asia/Kolkata").format().split('+')

app.get('/', function (req, res) {
    res.render('home', {title: "Home"})
})
//GET FORM
app.get('/form', function (req, res) {
    res.render('form', {title: "Register"})
})
//POST FORM
app.post('/form', function (req, res) {
    const formData = req.body
    // console.log(formData)
    const [adate, atime] = formData.atime.split('T')
    // console.log(adate,atime)
    const new_log = new log({
        first_name: formData.fname,
        last_name: formData.lname,
        address: formData.address,
        email: formData.email,
        phone_number: formData.pnumber,
        arrival_time: atime,
        arrival_date: adate,
        departure_time: null,
        departure_date: null,
        is_inside: true
    })
    // console.log(email.config.views)
    email.send({
        template: 'checked-in',
        message:{
            to : formData.email,
        },
        locals:{
            name:formData.fname+" " +formData.lname,
        }
    }).then(()=>{
        console.log("Email Send")
    }).catch((err)=>{
        console.log(err)
    })

    new_log.save().then(() => {
        // console.log(typeof(adate),typeof(atime))
        console.log("new log added")
    }).catch((err) => {
        console.log(err)
    })
    res.redirect('done')
})

// GET DATA FROM DATA BASE
app.get('/done', function (req, res) {

    let length;
    log.find({}, function (err, foundData) {
        // all_data = res.end(JSON.stringify(data))
        // length = all_data.
        if (err) {
            console.log(err)
            res.status(500).send()
        } else {
            if (foundData.length === 0) {
                var all_data = null;
                console.log("NO DATA")
                res.render('done', {data: all_data, title: "Checked In"})
            } else {
                all_data = foundData
                // console.log(all_data)
                // console.log(foundData[0].first_name, foundData.length)
                res.render('done', {data: foundData, title: "Checked In"})
            }
        }
    });
})
app.delete('/done/:email', function (req, res) {
    const {email: user_email} = req.params;
    log.findOneAndRemove({email: user_email}, function (err, data) {
        if (!err) {
            let time= dateTime[0].split('T')
            console.log(time)
            const new_log = new deplog({
                first_name: data.first_name,
                last_name: data.last_name,
                address: data.address,
                email: data.email,
                phone_number: data.phone_number,
                arrival_time: data.arrival_time,
                arrival_date: data.arrival_date,
                departure_time: time[1],
                departure_date: time[0],
                is_inside: false
            })
            email.send({
                template: 'checked-out',
                message:{
                    to : data.email,
                },
                locals:{
                    name:data.first_name+" " +data.last_name,
                }
            }).then(()=>{
                console.log("Email Send Check out")
            }).catch((err)=>{
                console.log(err)
            })
            new_log.save().then(() => {
                console.log("new departure log added")
            }).catch((err) => {
                console.log(err)
            })
        }
    });

    res.redirect('/checked-out')
    // <i class="fas fa-home"></i>
})

app.get('/checked-out', function (req, res) {

    deplog.find({}, function (err, foundData) {
        // all_data = res.end(JSON.stringify(data))
        // length = all_data.
        if (err) {
            console.log(err)
            res.status(500).send()
        } else {
            if (foundData.length === 0) {
                var all_data = [];
                console.log("NO DATA")
                res.render('checked-out', {data: all_data, title: "Checked Out"})
            } else {
                all_data = foundData
                // console.log(all_data)
                console.log(foundData[0].first_name, foundData.length)
                res.render('checked-out', {data: foundData, title: "Checked Out"})
            }
        }
    });
})

//SEARCH

app.post('/search/:type', function (req, res) {
    const {search_email} = req.body
    const {type} = req.params
    console.log(search_email, type)
    if (type === 'Checked Out') {
        console.log("Its check out")
        deplog.find({email: search_email}, function (err, foundData) {
            console.log(foundData)
            res.render('filter_checkout', {data: foundData, title: "Checked Out Search"})

        })

    } else if (type === 'Checked In') {
        console.log("Its checked in type")
        log.find({email: search_email}, function (err, foundData) {
            console.log(foundData)
            res.render('filter_checkin', {data: foundData, title: "Checked In Search"})

        })
    }
})
app.listen(port, function () {
    console.log("Server Running at port: "+ port)

})