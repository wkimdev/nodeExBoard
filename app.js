var express = require('express');
var app = express();
app.use(express.static('public'));

app.all('/', function(req, res){
    //req : 요청
    //res : 응답에 대한 객체 전달
});

app.listen(3000, function(){
    console.log('Connected 3000 port!!');
});

//login 화면 root
/* app.use('/login', express.static(path.join(__dirname, '__admin'), {index: 'login.html'}));

app.use('/admin', express.static(path.join(__dirname, '_admin'), {index: 'login.html'}));

app.use('/util', express.static(path.join(__dirname, 'util')));
 */

module.exports = app;