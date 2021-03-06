(function() {

'use strict';

var test = require('tape');

var skylink = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();
var array = [];

var pushOneToArray = function(){
  array.push(1);
}

var pushToArrayPlusOne = function(value) {
  array.push(value + 1);
};
var pushToArrayPlusTwo = function(value) {
  array.push(value + 2);
};
var pushToArrayPlusThree = function(value) {
  array.push(value + 3);
};
var pushToArrayPlusFour = function(value) {
  array.push(value + 4);
};
var cancelTrigger = function(value) {
  return false;
};

test('Function throttling', function(t){
  t.plan(1);

  var test_func_before_throttle = function(){
    sw._throttle(pushOneToArray,2000)();
  }  

  //Test if only one function fires among these
  test_func_before_throttle();
  test_func_before_throttle();
  test_func_before_throttle();
  test_func_before_throttle();
  test_func_before_throttle();
  test_func_before_throttle();
  test_func_before_throttle();
  test_func_before_throttle();

  //Test if function can not fire halfway during timeout
  setTimeout(test_func_before_throttle, 1000);

  //Test if function can fire after timeout was gone
  setTimeout(test_func_before_throttle, 3000);

  setTimeout(function(){
    t.deepEqual(array,[1,1],'Testing throttle');
  }, 5000);

});

})();