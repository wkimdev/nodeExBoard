//require를 통해 module.exports라는 객체에 접근할 수 있는데,
//그 객체에는 sum, avg라는 프로퍼티값으로 함수가 정의되어 있다.

module.exports.sum = function(a,b){
    return a+b;
}
//exports 내보내다@@@
module.exports.avg = function(a,b){
    return (a+b)/2; 
} 