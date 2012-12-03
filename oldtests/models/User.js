/*---------------------
	:: User
	-> model
---------------------*/

exports.adapter = 'mysql';

exports.scheme = 'drop';

exports.attributes = {
	name	: 'STRING',
	email	: 'STRING',
	title	: 'STRING',
	phone	: 'STRING'
};