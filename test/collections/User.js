/*---------------------
	:: User
	-> collection
---------------------*/

// Each CRUD test will set the adapter property to match the adapter being tested
// exports.adapter = 'dirty';

// Models are set to persistent: true by default
exports.persistent = true;

// Attributes for the user data model
exports.attributes = {
	name	: 'STRING',
	email	: 'STRING',
	title	: 'STRING',
	phone	: 'STRING',
	type	: 'STRING'
};

// Identity is here to facilitate unit testing
// (this is optional and normally automatically populated based on file name)
exports.identity = 'user';