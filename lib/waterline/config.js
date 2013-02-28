// Global adapter defaults
module.exports = {

	// By default assume the app path is the current directory
	appPath: __dirname,

	// ms to wait before warning that a tranaction is taking too long
	// TODO: move this logic as a configuration option into the actual transaction collection
	transactionWarningTimer: 2000,

	// ms to wait before timing out a transaction and calling unlock() with an error
	// (App can then handle the logic to undo the transaction)
	// TODO: Make this work
	// TODO: move this logic as a configuration option into the actual transaction collection
	transactionTimeout: 15000,

	// Default config for all waterline collections
	collection: {

		migrate: 'alter',

		// Make collection globally accessible as globalId
		globalize: true,

		adapter: 'sails-dirty',

		// This uses an auto-incrementing integer attirbute (id) as the primary key for the collection
		// This is a common pattern and best-practice in relational and non-relational databases,
		// since it eliminates confusion when more than one developer hops on the project
		autoPK: true,

		// Automatically define updatedAt field in schema and refresh with the current timestamp when models are updated
		autoUpdatedAt: true,

		// Automatically define createdAt field in schema and populate with the current timestamp during model creation
		autoCreatedAt: true
	}
};