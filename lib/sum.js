//module2에선 접근할 수 없는 함수
function _sum(a, b){
    return a+b;
}

//exports라고 되어 있는 것만이 module2에서 사용할 수 있다. 인터페이스가 됨.
module.exports = function(a, b){
    return _sum(a,b);
}