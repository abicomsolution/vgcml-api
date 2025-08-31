var express = require('express');

var routes = express.Router();
var controller = require('./controller');


// routes.get('/process', function (req, res) {
//     controller.processUnilevel(res);
// });

routes.post('/process', function (req, res) {
    controller.processUnilevel(req.body, res);
});

module.exports = routes