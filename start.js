const http = require('http');
 
const hostname = '127.0.0.1';
const port = 1337;

//node js는 서버쪽 위치하여, 서버 요청을 빠르게 응답하는 기반시스템 제공하는 부분에 초점을 맞추고 있다.
//web server를 아래 코드로 생성함.
//그리고 이 컴퓨터에 listening을 하게 만듬
//리스닝하게 만든 port는 1337
http.createServer((req, res) => {
 res.writeHead(200, { 'Content-Type': 'text/plain' });

 //응답
 res.end('Hello World\n');
}).listen(port, hostname, () => {
 console.log(`Server running at http://${hostname}:${port}/`);
});