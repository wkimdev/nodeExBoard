var express = require('express');
var cookieParser = require('cookie-parser')

var app = express();
app.use(cookieParser('134443$@#$!#$@3342')); //쿠키파서 미들웨어가 붙음.

//db대신 배열로 나타냄
var products = {
   1 : {title : 'The history of web 1'},
   2 : {title : 'The next web'}
};
app.get('/products', function(req, res){
  var output = '';
  for(var name in products){
    output += `<li>
      <a href="/cart/${name}">${products[name].title}<a>
    </li>`;
    console.log(products[name].title);
  }
   //res.send('Products');
   res.send(`<h1>Products</h1><ul>${output}</ul>
   <a href="/cart">Cart</a>`);
});

/**

cart = {
  1(제품의 id번호) : 2(제품이 실린 갯수),
  2 : 1,
  3 : 0
}
 *
 */
app.get('/cart/:id', function(req, res){
  var id = req.params.id;
  if(req.signedCookies.cart) {
      var cart = req.signedCookies.cart;
  } else { //카트에 값이 없이 최초실행일경우
    var cart = {};
  }
  if(!cart[id]){
      cart[id] = 0;
  }
  //쿠키값은 기본적으로 문자형태로 전달됨. 형변환 시켜야 함
  cart[id] = parseInt(cart[id]) + 1;
  res.cookie('cart', cart, {signed:true}); //비어있는 최초값이 쿠키에 셋팅됨
  console.log(cart);
  res.send(cart);
  //사용자가 cart에 값을 줬다면 cart 목록을 보여주는 사용자를 redirenction
  res.redirect('/cart');
});

app.get('/cart', function(req, res){
  //사용자가 보낸 쿠키값을 받기
  var cart = req.cookies.cart;
  if(!cart){
   res.send('Empty!!');
  } else {
     var output = '';
     for(var id in cart){ //id => 제품의 id값
      output += `<li>${products[id].title} (${cart[id]})</li>`;
     }
  }
  res.send(`<h1>Cart</h1><ul>${output}</ul><a href="/products">Products List</a>`)
});

/* 
-- 강의 후기 --
서버가 반대로,
웹 브라우저에 crud를 하고 있다....
잘모르겠는데 ;;;
 */

//쿠키값은 같은 주소의 웹사이트 내에서만 유효하다.
app.get('/count', function(req, res){
    if(req.signedCookies.count){
        //cookie는 문자로 들어온다. 그래서 int로 parse시킴
        //해독시킨 쿠키값으 가져온다.
        var count = parseInt(req.signedCookies.count);
    } else {
       var count = 0;
    }
    count = count+1;
    res.cookie('count', count, {signed:true});
    res.send('count : '+count);
});

//쿠키 request response할때 쓴다.
app.listen('3003', function(){
   console.log('Connected 3003 port !!!');
});
