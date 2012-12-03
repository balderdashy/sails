// Dependencies
var async = require('async');
var _ = require('underscore');
var parley = require('parley');

// Create flow control objects
var $connect$ = new parley();
var $other$ = new parley();




// Thought:
//////////////////////////////////////////////////////////////////////
//
// instead of a callback function, execute a generator function that
// returns an incrementing id and pass in the result.
// This serializes function calls by providing a unique sequence.
// 
// A __getter__ on globals[] could be used as well to make the syntax even more concise.
//

function z  (str,cb) {
	console.log(str);
	setTimeout(function () {
		cb (null,str);
	},1000);
}

function zzz ($$promise,cb) {
	console.log("Got result:",$$promise.data);
	cb();
}

var $$ = new parley();
var $$1 = new parley();
var $$2 = new parley($$,$$1);

$$ (z) ('test');					// z('test')
$$ (z) ('2');						// z(2)
var $$result = $$ (z) ('3');		// result = {data: z(3)}
$$1 (z) ('some other chain');		// z('some other chain')
$$1 (z) ('some other chain #2');	// z('some other chain #2')



$$2 (zzz) ($$result);				// zzz(result)


// var result = $$(User).find(3);
// $$(function (result,cb) {
// 	console.log(result.error);
// 	console.log(result.data);
// 	cb();
// }) (result);

// $connect$ ( function (x,cb) {
// 	console.log(" Do more " + x + " stuff!");
// 	setTimeout(cb,100);
// }) ("111111111111");

// $other$ ( function (x,cb) {
// 	console.log(" Do more " + x + " stuff!");
// 	setTimeout(cb,200);
// }) ("22222222222");

// var $_result = $connect$ ( function (x,cb) {
// 	console.log(" Do more " + x + " stuff!");
// 	setTimeout(function (){
// 		cb(null,"some data");
// 	},500);
// }) ("33333333333");

// var $next$ = new parley ($connect$, $other$);
// $next$ (function ($$,cb) {
// 	if ($$.error) throw $$.error;
// 	console.log("DATA:",$$.data);
// 	cb();
// }) ($_result);