//app을 매개변수로 받아서 주입시킨다.
module.exports = function(app){
    var express = require('express');
    var route = express.Router();

    route.get('/r1', function(req, res){
        res.send('Hello /p1/r1');
    });
    route.get('/r2', function(req, res){
        res.send('Hello /p1/r1');
    });
    
    app.get('/p3/r1', function(req, res){

    });
    return route;
};