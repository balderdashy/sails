"use strict";
var sails = null,
	isLifted = false;

module.exports = {
	buildOptions: function() {
		var _ = require("lodash"),
			opts = require('optimist').argv;

		// Reduce logging
		opts.log = {
			level: "warn"
		};

		// A little ott maybe - but lets knock up a table of ports
		var portSet = [];
		for(var i=0;i<10;i++) {
			portSet.push(1024+Math.ceil(Math.random()*64511));
		}
		// pick one of them
		//opts.port = _.min(portSet);
		opts.port = portSet[Math.ceil(Math.random()*10)];

		return opts;
	},
	lower: function(done){
		//console.log("Lowering Sails");
		//sails.lower();
		if (done && typeof done==="function") {
			done();
		}
	},
	raise: function(opts, done){

		if (!isLifted) {
			sails.lift(opts,
				function(){
					// lifted
					isLifted = true;
					done();
				}
			);
		} else {
			done();
		}
	},
	init: function (done) {
		if (sails && typeof sails !== 'undefined') {
			//
		} else {
			sails = require('sails');
		}

		this.raise(this.buildOptions(), done);
	}
}
