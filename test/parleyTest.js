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

$connect$ ( function (x,cb) {
	console.log(" Do more " + x + " stuff!");
	setTimeout(cb,100);
}) ("111111111111");

$other$ ( function (x,cb) {
	console.log(" Do more " + x + " stuff!");
	setTimeout(cb,200);
}) ("22222222222");

var $_result = $connect$ ( function (x,cb) {
	console.log(" Do more " + x + " stuff!");
	setTimeout(function (){
		cb(null,"some data");
	},500);
}) ("33333333333");

var $next$ = new parley ($connect$, $other$);
$next$ (function ($$,cb) {
	if ($$.error) throw $$.error;
	console.log("DATA:",$$.data);
	cb();
}) ($_result);