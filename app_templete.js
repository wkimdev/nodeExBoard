var express = require('express');
var app = express();

app.get('/count', function(req, res){
  res.send('count: ' );
});

app.listen(3003, function(){
  console.log('Connected 3003 port!!!');
});
