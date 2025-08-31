var express = require('express');
var CronJob = require('cron').CronJob;
var moment = require('moment');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');

var mongoose = require('mongoose')
var router = require('./router');
var app = express();


const config = {
    mongoURL: process.env.MONGO_URL || 'mongodb://localhost:27017/vgcml',
    port: 3020
}

mongoose.connect(config.mongoURL, { useNewUrlParser: true })
.then((respo) => {

})
.catch((error) => {
    console.log(error)
})


app.use(bodyParser.json({ extended: true, limit: "" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "200mb" })); // for parsing application/x-www-form-urlencoded
app.use(methodOverride());
app.use(cookieParser());

app.use('/api', router);

app.listen(config.port, function () {
    console.log('Cron Job started at port:', config.port);
});

