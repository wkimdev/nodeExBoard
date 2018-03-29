module.exports = function(app){
    //이 함수안으로 들어옴으로서 어플리케이션으로서의 액션처리
    //app_route.js의 객체를 전달하여 이용하기 위해 이렇게 처리
    var express = require('express');
    var route = express.Router();
    route.get('/r1', function(req, res){
        res.send('Hello /p2/r1');
    });
    route.get('/r2', function(req, res){
        res.send('Hello /p2/r2');
    });

    return route;
};