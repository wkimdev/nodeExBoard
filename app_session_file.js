var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var bodyParser = require('body-parser'); //post 처리를 위해
var app = express();
app.use(bodyParser.urlencoded({ extended: false }))

//session 폴더가 생성됨
app.use(session({
  secret: '1239071!@#!$!@184711', //임의의값
  resave: false,
  saveUninitialized: true,  
  store: new FileStore() //express-session은 이 파일스토어에 저장하게 된다.
}));

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
  delete req.session.displayName;
  res.redirect('/welcome');
});
app.get('/welcome', function(req, res){
  if(req.session.displayName) {
    res.send(`
    <h1>Hello, ${req.session.displayName}</h1>
    <a href="/auth/logout">Logout</a>
    `);
  } else {
    res.send(`
    <h1>Welcome</h1>
    <a href="/auth/login">Login</a>
    `);
  }
});
app.post('/auth/login', function(req, res){
  //추후 db로 처리할 것 - 소스코드에 비번넣는거 좋지 않음.
  var user = {
    username:'wkim',
    password:'111',
    displayName:'Wkimd'
  };
  var uname = req.body.username;
  var pwd = req.body.password;
  if(uname === user.username && pwd === user.password){
    req.session.displayName = user.displayName;
    res.redirect('/welcome');
  } else {
    res.send('who are u?? <a href="/auth/login">login</a>');
  }
  //좋은 방법은 아니지만 여기에 인증정보를 둔다.
  //res.send(uname);
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
  `;
  res.send(`${output}`);
});
app.listen(3003, function(){
  console.log('Connected 3003 port!!!');
});