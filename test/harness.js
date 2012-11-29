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


// TODO: also explore:

/*

$(SomeModel).find(4);

where $(SomeModel) is just SomeModel, but every attribute that is a function (like find())
automatically gets a callback function provided by parley.  

Then the parley queue can be activated later (at the end of the controller perhaps).

// Examples:
$(User).join(FacebookUser, { name: fullName });

If a parley object is passed into a view, queries to adapter will be deferred until the view is rendered

// IN controller
res.view({
	users: User.where({id:'>4'}).join(FacebookUser, { name: fullName })
})

// Then in view
module.exports = function() {
	return {
		name: this.users.name,
		dateOfBirth: this.users.dateOfBirth
	};
};


// Because the promise passed down to the view contained more than one model, 
// the view will automatically understand that and let you create the api view
// for just one single model, then use that as a template.

*/

// Create flow control object
var $$$ = new parley();

// Connect to adapters
$$$ ( User.adapter.connect ) ();

// Sync adapter schemas (if necessary)
$$$ ( User.adapter['sync'+_.str.capitalize(User.scheme)] ) (User);



