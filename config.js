// Global adapter defaults
module.exports = {

	// This uses an auto-incrementing integer attirbute (id) as the primary key for the collection
	// This is a common pattern and best-practice in relational and non-relational databases,
	// since it eliminates confusion when more than one developer hops on the project
	defaultPK: true,

	// Automatically define updatedAt field in schema and refresh with the current timestamp when models are updated
	updatedAt: true,

	// Automatically define createdAt field in schema and populate with the current timestamp during model creation
	createdAt: true,

	// Define a collection to use for app-level transactions
	transactionCollection: {
		adapter: 'dirty',
		persistent: false,
		identity: '___transaction'
	},

	// ms to wait before warning that a tranaction is taking too long
	transactionWarningTimer: 2000,

	// ms to wait before timing out a transaction and calling unlock() with an error
	// (App can then handle the logic to undo the transaction)
	// TODO: Make this work
	transactionTimeout: 15000
};