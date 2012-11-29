/*---------------------
	:: User
	-> model
---------------------*/

exports.adapter = require('water-mysql');


exports.attributes = {
	name: STRING,
	email: STRING,
	title: STRING,
	phone: STRING
};