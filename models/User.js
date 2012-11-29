/*---------------------
	:: User
	-> model
---------------------*/

exports.adapter = require('water-mysql');

exports.scheme = 'drop';

exports.attributes = {
	name: STRING,
	email: STRING,
	title: STRING,
	phone: STRING
};