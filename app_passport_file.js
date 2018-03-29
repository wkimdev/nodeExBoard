var https = require('https');
var express = require('express');
var session = require('express-session');
var fs = require('fs');
/* var md5 = require('md5'); */
//var sha256 = require('sha256');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var https = require('https');
var http = require('http');
var fs = require('fs');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var MySQLStore = require('express-mysql-session')(session);
//session table을 만들어서 거기에 session관리
var bodyParser = require('body-parser'); //post 처리를 위해
var app = express();

const options = {
	key: fs.readFileSync('./keys/private.pem'),
	cert: fs.readFileSync('./keys/public.pem')
};

var port1 = 3003;
var port2 = 443;

app.use(bodyParser.urlencoded({ extended: false }))

//session 폴더가 생성됨
app.use(session({
  secret: '1239071!@#!$!@184711', //임의의값
  resave: false,
  saveUninitialized: true,  
  store: new MySQLStore({
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
app.get('/auth/logout', function(req, res){
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
    authId:'local:wkim',
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
  for(var i=0; i<users.length;i++){
    var user = users[i];
    if(user.authId === id){
      return done(null, user); //flase가 아니면 인증된사용자.
    }
  }
  done('There is no user');
});

passport.use(new LocalStrategy(
  function(username, password, done){
    var uname = username;
    var pwd = password;
    for(var i=0; i<users.length;i++){
      var user = users[i];
      if(uname === user.username) { 
        return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
          if(hash === user.password){
            console.log('localstrategy', user);
            //null은 err처리하는 부분
            done(null, user);
          } else {
            done(null, false);
          }
        });
      }
  }
  done(null, false);
  }
));

passport.use(new FacebookStrategy({
  clientID: '979424482217002',
  clientSecret: '3baa4d7c42bcde8fdcb2005aa577105a', //노출되면 안되는 정보
  callbackURL: "https://localhost:443/auth/facebook/callback",  //타사인증은 보안적으로 위험한일. 이 과정에서 각각의 서비스가 맞는지 코드내에서 상호간의 검증과정이 일어난다. 이걸 노출하면 안된다고 한다...
  //그래서 과정이 한단계 더 들어간다.
  //나의 경우 /auth/facebook/callback 이렇게만 썼더니 차단된 URL: 리디렉션 URI가 앱의 클라이언트 OAuth 설정의 화이트리스트에 없으므로 리디렉션하지 못했습니다. 클라이언트 및 웹 OAuth 로그인이 설정되었는지 확인하고 모든 앱 도메인을 유효한 OAuth 리디렉션 URI로 추가하세요."
  //라고 에러가 발생. 그래서 해결을 위해
  //정책규정이 바껴서 http 못쓴다.
  //https://localhost:443/auth/facebook/callback 이거 아예 강제맵핑했다.
  profileFields:['id', 'email', 'gender', 'link', 'name', 
  'timezone', 'updated_time', 'verified', 'displayName' ]
  //email안던져 준다........
  //profile로 받을 데이터들을 명시적으로 출력해줘야 한다.
},
//callback받는것
//profile, done이 중요하다.
function(accessToken, refreshToken, profile, done) {
  console.log(profile); //여기서 id는 facebook식별자
  var authId = 'facebook:'+profile.Id;
  for(var i=0; i<users.length; i++){
    var user = users[i];
    if(user.authId === authId){ //facebook으로 로긴했을땐 authid가 있을 것.
      return done(null, user);
    } 
  }
  var newuser = {
    'authId':authId,
    'displayName' :profile.displayName,
    'email' : profile.emails[0].value
  }
  users.push(newuser);
  done(null, newuser)
  //이거 다음에 seriallizeUser
  // User.findOrCreate(..., function(err, user) {
  //   if (err) { return done(err); }
  //   done(null, user);
  // });
 }
));

app.post('/auth/login', 
    //미들웨어 : 콜백함수를 만들어주는 역할
    passport.authenticate('local', 
    { 
      successRedirect: '/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false //사용자에게 인증실패 alert창
    }
  )
);

app.get(
   '/auth/facebook', 
   passport.authenticate( //facebook전략으로 동작
     'facebook',
     { scope: 'email' } //scope을 추가해서 페북에서 한번더 확인해야 한다.
    ),
  );
app.get(
  '/auth/facebook/callback',
   passport.authenticate(
     'facebook',     
     { 
       successRedirect: '/welcome',
       failureRedirect: '/auth/login' 
      }
    )
  );

app.post('/auth/register', function(req, res){
  // hasher는 콜백이기때문에 
  // haser생성한뒤 user생성하기
  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var user = {
      authId:'local:'+req.body.username,
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    users.push(user);
    req.login(user, function(err){
      //회원가입끝나자 마자 로그인시킴***
      req.session.displayName = req.body.displayName;
      req.session.save(function(){
      res.redirect('/welcome');
    });
    }); //passport가 넣어주는 메서드
    
  });
});

app.get('/auth/register', function(req, res){
  var output = `
  <h1>Register</h1>
  <form action="/auth/register" method="post">
    <p><input type="text" name="username" id="username" placeholder="username"></p>
    <p><input type="password" name="password" id="password" placeholder="password"></p>
    <p><input type="text" name="displayName" id="displayName" placeholder="displayName"></p>
    <p><input type="submit"></p>
  </form>
  `;
  res.send(`${output}`);
});


app.get('/auth/login', function(req, res){
  var output = `
 <h1>Login</h1>
 <form action="/auth/login" method="post">
 <p>
  <input type="text" name="username" placeholder="username">
  </p>
  <p>
  <input type="password" name="password" placeholder="password">
   </p> 
   <p>
   <input type="submit">
   </p>
 </form> 
 <a href="/auth/facebook">facebook</a>
  `;
  res.send(`${output}`);
});
// app.listen(3003, function(){
//   console.log('Connected 3003 port!!!');
// });

http.createServer(app).listen(port1, function(){  
  console.log("Http server listening on port " + port1);
});

https.createServer(options, app).listen(port2, function(){  
console.log("Https server listening on port " + port2);
});