/*---------------------
	:: User
	-> model
---------------------*/

exports.adapter = 'dirty';

exports.scheme = 'alter';

exports.attributes = {
	name	: 'STRING',
	email	: 'STRING',
	title	: 'STRING',
	phone	: 'STRING'
};

// Identity is here to facilitate unit testing
// (this is optional and normally automatically populated based on file name)
exports.identity = 'user';