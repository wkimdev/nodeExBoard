var express = require('express');
var app = express();

var p1 = require('./routes/p1')(app); //함수로 호출, app이라는 것을 전달
app.use('/p1', p1); //p1으로 들어오는 것들은 router변수가 처리

var p2 = require('./routes/p2')(app);
app.use('/p2', p2);

app.listen(3003, function(){
 console.log('connected');
});

