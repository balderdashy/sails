/*---------------------
	:: User
	-> collection
---------------------*/

// Each CRUD test will set the adapter property to match the adapter being tested
// exports.adapter = 'dirty';

// What synchronization scheme to use: default is 'alter'
// 
// 'drop' => Delete the database and recreate it when the server starts
// 'alter' => Do a best-guess automatic migration from the existing data model to the new one
// 'safe' => Never automatically synchonize-- leave the underlying data alone
exports.migrate = 'drop';

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

// The adapter to test
exports.adapter = {
	identity: 'waterline-dirty'
};