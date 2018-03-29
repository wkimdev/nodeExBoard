module.exports = function(passport){

var express  = require('express');    
var app = express();
var fs = require('fs');
var path = require('path');
var route = require('express').Router(); //라우트레벨 미들웨어???
app.set('views', './views/mysql');
app.use('/views', express.static('views'));

  route.get('/logout', function(req, res){
   //session정보를 삭제
   //redirect, db에 별도 저장일경우
   //저장이 끝나기도 전에 redirect이 일어나는 경우
   // 변경된 사항을 보여주지 못할 수도 있다.
    /* delete req.session.displayName;
    res.redirect('/welcome');
     */
    req.logout(); //passport가 session data를 제거해줌
    req.session.save(function(){
      //save는 datastore에 저장이 끝났을 때, 웰컴페이지로 리다이렉션시켜줌.
      res.redirect('/welcome');
    });
  });

  
  route.post('/login', 
      //미들웨어 : 콜백함수를 만들어주는 역할
      passport.authenticate('local', 
      { 
        successRedirect: '/welcome',
        failureRedirect: '/auth/login',
        failureFlash: false //사용자에게 인증실패 alert창
      }
    )
  );
  
  route.get(
     '/facebook', 
     passport.authenticate( //facebook전략으로 동작
       'facebook'
      )
    );
  route.get(
    '/facebook/callback',
     passport.authenticate(
       'facebook', 
       { 
         successRedirect: '/welcome',
         failureRedirect: '/auth/login' 
        }
      )
    );
  
  route.post('/register', function(req, res){
    // hasher는 콜백이기때문에 
    // haser생성한뒤 user생성하기
    hasher({password:req.body.password}, function(err, pass, salt, hash){
      var user = {
        authId: 'local'+req.body.username,
        username:req.body.username,
        password:hash,
        salt:salt,
        displayName:req.body.displayName
      };
      //users.push(user); 이걸 mysql처리
      var sql = 'INSERT INTO users SET ? ';
      conn.query(sql, user, function(err, results){
        if(err){
          console.log(err);
          res.status(500);
        } else {
      req.login(user, function(err){
        //회원가입끝나자 마자 로그인시킴***
        req.session.displayName = req.body.displayName;
        req.session.save(function(){
        res.redirect('/welcome');
       });
      }); //passport가 넣어주는 메서드
        }
      });
    });
  });
  
route.get('/register', function(req, res){
    res.send('/auth/register');
});

route.get('/login', function(req, res){
    //이걸 어떻게 하면 view로 가게 만들까...??
    //res.redirect('/views/mysql/auth/login.html');
    //app.send('/views/mysql/auth/login.html');
    //fs.readFile('/views/mysql/auth/login.html');
    // fs.readFile('../../../view/mysql/auth/login.html');
    // ../../view/mysql/auth/login.html
    // var __dirname = 'C:\workspace\node\nodeExBoard';
    // fs.readFile(path.join(__dirname, '/views/mysql/auth/login.html'));
    fs.readFileSync('/views/mysql/auth/login.html');
    //C:\workspace\node\nodeExBoard\routes\mysql\views\mysql\auth\login.html
    //app.use('/public', express.static(path.join(__dirname, 'public'), {index: 'index.html'}));
});
    return route;
};