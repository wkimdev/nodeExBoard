var express = require('express');
var session = require('express-session');
var fs = require('fs');
var path = require('path');
/* var md5 = require('md5'); */
//var sha256 = require('sha256');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
//mysql을 사용하기 위한 준비
var mysql = require('mysql');
var conn = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '1234',
  database : 'o2'
});
conn.connect();
var bodyParser = require('body-parser'); //post 처리를 위해
var app = express();
app.set('views', './views/mysql');
//app.use('/admin', express.static(path.join(__dirname, '_admin'), {index: 'login.html'}));
app.use('/views', express.static('views'));

const options = {
	key: fs.readFileSync('./keys/private.pem'),
	cert: fs.readFileSync('./keys/public.pem')
};

var MySQLStore = require('express-mysql-session')(session);
//session table을 만들어서 거기에 session관리
app.use(bodyParser.urlencoded({ extended: false }))
//session 폴더가 생성됨
app.use(session({
  secret: '1239071!@#!$!@184711', //임의의값
  resave: false,
  saveUninitialized: true,  
  store: new MySQLStore({ //store로 mySQLStore 모듈을 쓰고 있다.
     //session에서만 사용하는 정보
     host: 'localhost',
     port: 3306,
     user: 'root',
     password: '1234',
     database: 'o2'
  })
}));
app.use(passport.initialize());
app.use(passport.session());



app.get('/count', function(req, res) {
  if(req.session.count){
    req.session.count++;
  } else {
    req.session.count = 1;
  }
   res.send('count : '+req.session.count);
});
app.get('/tmp', function(req, res){
  //서버의 내용을 가져옴
  //express-session 기본적으로 메모리에 저장하고 있는 정보라서
  //서버를 재접속하면 정보는 사라진다. 
  //실제 서비스할때는 사용 xxx , db에 넣어야 한다.
  res.send('result : '+req.session.count);
});

  //passport 는 session을 사용
  //passport를 이용해 user정보에 엑세스 하는게 바람직.
  app.get('/welcome', function(req, res){
    if(req.user && req.user.displayName) {
      res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">Logout</a>
      `);
    } else {
      res.send(`
      <h1>Welcome</h1>
      <ul>
       <li><a href="/auth/login">Login</a></li>
       <li><a href="/auth/register">Register</a></li>
      </ul>
      `);
    }
  });


var salt ='123%@$#%$!@4334364@&$@$%26';
var users = [
  {
  username:'wkim',  //식별자
  password:'waRMKdUbi4A6yB2gsM6dVWTjsZJHx3JVF5GpvjHf2DYQRysD+D8xvNarQHlPFejA/VQjWV/oVgMRz7qjmPz9MDzVbWkAS/+VnBJ0vjtcqowa2H8prsksFvBRHwuxsv71BlaTfdE96QnXqL2vSGZI9KhyxbZDZTELeM5CmU+R4nA=',
  salt : 'Iu2ytchLHr+ENDK/BDcEH5+LXdVOtbfN+s6NtGy0xl9JHbJINWYBIW6LBuA9604PGRNlE9UCzcF/xwMZqjuPlA==',
  displayName:'Wkimd'
  }
];

passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  //session에 저장
  done(null, user.authId);
});

//한번 접속후, 저장된 사용자의 식별자, seesion에 있는게, 
//이 함수의 첫번째 식별자 id에 들어오게 된다.
//그 식별자 id가 배열에 있는지 확인한 뒤, 해당 내용을 출력한다.
passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  var sql = 'SELECT * FROM users WHERE authId=?';
  conn.query(sql, (id), function(err, results){
    if(err){
      done('There is no user.');
    } else {
      done(null, results[0]);
    }
  });
  // for(var i=0; i<users.length;i++){
  //   var user = users[i];
  //   if(user.username === id){
  //     return done(null, user);
  //   }
  // }
});

passport.use(new LocalStrategy(
  function(username, password, done){
    var uname = username;
    var pwd = password;
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, ['local'+uname], function(err, results){
      console.log(results);
      if(err){
        return done('There is no user.');
      }
      var user = results[0];
      return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
        if(hash === user.password){
          console.log('localstrategy', user);
          //null은 err처리하는 부분
          done(null, user);
        } else {
          done(null, false);
        }
      });
    });
  }
));

passport.use(new FacebookStrategy({
  clientID: '979424482217002',
  clientSecret: '3baa4d7c42bcde8fdcb2005aa577105a', //노출되면 안되는 정보
  callbackURL: "/auth/facebook/callback"  //타사인증은 보안적으로 위험한일. 이 과정에서 각각의 서비스가 맞는지 코드내에서 상호간의 검증과정이 일어난다. 이걸 노출하면 안된다고 한다...
  //그래서 과정이 한단계 더 들어간다.
  
},
function(accessToken, refreshToken, profile, done) {
  console.log(profile);

  // User.findOrCreate(..., function(err, user) {
  //   if (err) { return done(err); }
  //   done(null, user);
  // });
}
));

var auth = require('./routes/mysql/auth')(passport); //함수의 인자로서 passport를 전달한다. passport주입
app.use('/auth/', auth); //auth로 접근하는 모든 요청에 대해 auth라는 라우터가 처리하도록 위임
//그렇기 때문에 auth.js에 /auth전부삭제

app.listen(3003, function(){
  console.log('Connected 3003 port!!!');
});