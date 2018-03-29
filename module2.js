//sum.js를 불러오는 require 코드가 필요
//부름을 당하는 sum.js에서 module.exports 라고 객체필요
//이렇게 모듈을 만들어서 가져다 쓸 수 있음.
//sw의 복잡성을 낮출 수 있다.

var sum = require('./lib/sum');
console.log(sum(1,2));

var cal  = require('./lib/calculator');
console.log('cal sum', cal.sum(1,2));
console.log('cal avg', cal.avg(1,2));