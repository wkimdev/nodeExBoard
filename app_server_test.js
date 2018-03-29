var https = require('https');
var http = require('http');
var express = require('express');
var app = express();
var fs = require('fs');

/* 관리자권한으로 cmd시작해야한다.
명령어를 
1) genrsa 1024
2) req -x509 -new -key private.pem
이렇게 주고 생성되는걸 따로 저장했다.
 */
const options = {
	key: fs.readFileSync('./keys/private.pem'),
	cert: fs.readFileSync('./keys/public.pem')
};

var port1 = 3003;
var port2 = 443;

app.get('/test', function(req, res){
   res.send('test success!');
});

http.createServer(app).listen(port1, function(){  
    console.log("Http server listening on port " + port1);
  });

https.createServer(options, app).listen(port2, function(){  
console.log("Https server listening on port " + port2);
});

// https.createServer(options, app).listen(3003, function() {
//     console.log("HTTPS server listening on port " + 3003);
//   });

// http.createServer(app).listen(3003, function(){  
//     console.log("Http server listening on port " + port1);
// });  