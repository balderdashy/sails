/*---------------------
	:: User
	-> model
---------------------*/

exports.adapter = require('../adapters/DirtyAdapter.js');

exports.scheme = 'drop';

exports.attributes = {
	name	: 'STRING',
	email	: 'STRING',
	title	: 'STRING',
	phone	: 'STRING'
};