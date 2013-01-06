# Collection

```
// The name of the adapter that will be used to store and retrieve this collection's models
// (Default: 'dirty', an in-memory database for development only)
exports.adapter = 'dirty';

// What schema migration/synchronization scheme to use
// (Default: 'alter')
// 
// 'drop' => Delete the database and recreate it when the server starts
// 'alter' => Do a best-guess automatic migration from the existing data model to the new one
// 'safe' => Never automatically synchonize-- leave the underlying data alone
exports.migrate = 'alter';

// If readOnly is set to true, the underlying data will never be touched
// (Default: false)
exports.readOnly = 'false';

// Schema for this collection
// What attributes do you need to store and retrieve?
exports.attributes = {
	name	: 'STRING',
	email	: 'STRING',
	title	: 'STRING',
	phone	: 'STRING',
	type	: 'STRING'
};

// In Sails, the identity property is optional and automatically populated based on file name
// It can be overridden here
exports.identity = 'user';
```