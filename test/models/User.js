/*---------------------
	:: User
	-> model
---------------------*/

exports.adapter = 'dirty';

exports.scheme = 'drop';

exports.attributes = {
	name	: 'STRING',
	email	: 'STRING',
	title	: 'STRING',
	phone	: 'STRING'
};