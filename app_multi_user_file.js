var express = require('express');
var session = require('express-session');
/* var md5 = require('md5'); */
//var sha256 = require('sha256');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

var MySQLStore = require('express-mysql-session')(session);
//session table을 만들어서 거기에 session관리
var bodyParser = require('body-parser'); //post 처리를 위해
var app = express();
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
  delete req.session.displayName;
  //save는 datastore에 저장이 끝났을 때, 웰컴페이지로 이동하게 해줌.
  req.session.save(function(){
    res.redirect('/welcome');
  })

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
    <ul>
     <li><a href="/auth/login">Login</a></li>
     <li><a href="/auth/register">Register</a></li>
    </ul>
    `);
  }
});

var salt ='123%@$#%$!@4334364@&$@$%26';
var users = [{
  username:'wkim',
  password:'waRMKdUbi4A6yB2gsM6dVWTjsZJHx3JVF5GpvjHf2DYQRysD+D8xvNarQHlPFejA/VQjWV/oVgMRz7qjmPz9MDzVbWkAS/+VnBJ0vjtcqowa2H8prsksFvBRHwuxsv71BlaTfdE96QnXqL2vSGZI9KhyxbZDZTELeM5CmU+R4nA=',
  salt : 'Iu2ytchLHr+ENDK/BDcEH5+LXdVOtbfN+s6NtGy0xl9JHbJINWYBIW6LBuA9604PGRNlE9UCzcF/xwMZqjuPlA==',
  displayName:'Wkimd'
}
];
app.post('/auth/login', function(req, res){
  //추후 db로 처리할 것 - 소스코드에 비번넣는거 좋지 않음.
  var uname = req.body.username;
  var pwd = req.body.password;
 
  console.log('aaaaaaaaaa');
  for(var i=0; i<users.length;i++){
    var user = users[i];
    console.log('bbbbbbbbb');
    //서버에 저장된 user값과 비교
    if(uname === user.username) { 
      //hasher가 실행되는 순간에 함수를 끝내기 
      //
      return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
        console.log('cccccccccccc');
        if(hash === user.password){
             req.session.displayName = user.displayName;
             req.session.save(function(){
              res.redirect('/welcome');
             })
        } else {
          console.log('dddddddddd');
          res.send('who are u?? <a href="/auth/login">login</a>');
        }
      });
    }
  //   if(uname === user.username && sha256(pwd+(user.salt)) === user.password){
  //     req.session.displayName = user.displayName;
  //     //save가 끝난다음에 welcome페이지에 이동함
  //     //return이 있어야 끝난다. retunr => 메서드 종료, 값의 반환
  //     return req.session.save(function(){
  //       res.redirect('/welcome');
  //     });
  // }
}
  console.log('eeeeeeeeee');
  res.send('who are u?? <a href="/auth/login">login</a>');
  //좋은 방법은 아니지만 여기에 인증정보를 둔다.
  //res.send(uname);
});

app.post('/auth/register', function(req, res){
  // hasher는 콜백이기때문에 
  // haser생성한뒤 user생성하기
  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var user = {
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    users.push(user);
    req.session.displayName = req.body.displayName;
    req.session.save(function(){
      res.redirect('/welcome');
    });
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
  `;
  res.send(`${output}`);
});
app.listen(3003, function(){
  console.log('Connected 3003 port!!!');
});