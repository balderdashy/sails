// This Transaction collection is used for managing in-app transactions.
//
// Some adapters with built-in transactions (i.e. mySQL) may override the default transaction behavior.
// For collections relying on those adapter,s, this Transaction collection is irrelevant-- you can ignore it.
// 
// However, in some production systems without built-in transactions (i.e. Mongo), this will still be the method of choice.
// In that case, you'll want to point this collection at an adapter for a production database (i.e. Mongo)
// That would look like:
/*
exports.adapter = 'waterline-mongo'
*/
exports.identity = require('./config.js').transactionDbIdentity;
exports.adapter = 'sails-dirty';
exports.migrate = 'drop';