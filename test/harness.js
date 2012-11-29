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

// Collections
var User = require('../models/User.js');



// Connect to adapters
$connect$ ( User.adapter.connect ) ();

$connect$ ( function (x,cb) {
	console.log(" Do more " + x + " stuff!");
	setTimeout(cb,1500);
}) ("111111111111");

$other$ ( function (x,cb) {
	console.log(" Do more " + x + " stuff!");
	setTimeout(cb,500);
}) ("22222222222");

$connect$ ( function (x,cb) {
	console.log(" Do more " + x + " stuff!");
	setTimeout(cb,5500);
}) ("33333333333");

// Sync adapter schemas (if necessary)
$connect$ ( User.adapter.sync[User.scheme] ) (User);

new parley ($connect$, $other$) (console.log) ("!");