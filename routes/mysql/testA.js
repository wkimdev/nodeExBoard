module.exports = function(){
var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var route = require('express').Router(); 
// route.set('/views', express.static(path.join(__dirname, 'docs'), {index: 'index.html'}));
// app.set('views', './views/mysql');

app.use(express.static('views'));

route.get('/login', function(req, res){
  //fs.readFileSync('/views/mysql/auth/login.html');
  app.use(express.static(__dirname + '/views/mysql/auth/login.html'));
});
    return route;
};