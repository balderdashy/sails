// Global adapter defaults
module.exports = {

	// Automatically define updatedAt field in schema and refresh with the current timestamp when models are updated
	updatedAt: true,

	// Automatically define createdAt field in schema and populate with the current timestamp during model creation
	createdAt: true,

	// Define a collection to use for app-level transactions
	transactionCollection: {
		adapter: 'dirtylocksmith',
		identity: '___transaction'
	}
};