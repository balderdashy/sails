// Dependencies
var async = require('async');
var _ = require('underscore');
_.str = require('underscore.string');
var parley = require('parley');
var waterline = require('../waterline.js');

// Extend collection and adapter definition
var User = new waterline.Collection(require('../models/User.js'));
_.bindAll(User.adapter);
var newAdapter = new waterline.Adapter(User.adapter);

// TODO: instead of saving empty list to dirty-db, use an entry for each model

/*
i.e. for model:
{
	collection: 'User',
	data: {
		name: 'Mike',
		email: 'mike@balderdash.co'
	}
}
*/


// Create flow control object
var $$$ = new parley();

// Connect to adapters
$$$ ( User.adapter.connect ) ();

// Sync adapter schemas (if necessary)
$$$ ( User.adapter['sync'+_.str.capitalize(User.scheme)] ) (User);



