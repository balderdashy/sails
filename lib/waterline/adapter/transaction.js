//////////////////////////////////////////////////////////////////////
// Transactions/Concurrency
//
// Note that these are not *TRUE* transactions, but isolated, durable 
// app-level transcations useful for wrapping particular pieces of logic.
// When possible, it is always preferable to use transactions at the data adapter layer
// (which is why the transaction method is overridable per adapter)
// 
//////////////////////////////////////////////////////////////////////


var _ = require('underscore');
var uuid = require('node-uuid');
var waterlineConfig = require('../config.js'); // global waterline config
var MAX_INTEGER = 4294967295; // (for sorting)

module.exports = function (adapterDef) {

	var pub = {};

	/**
	 *	App-level transaction
	 *	@transactionName		a unique identifier for this transaction
	 *	@atomicLogic		the logic to be run atomically
	 *	@afterUnlock (optional)	the function to trigger after unlock() is called
	 */
	pub.transaction = function(transactionName, atomicLogic, afterUnlock) {
		var self = this;

		// Use the adapter definition's transaction() if specified
		if (adapterDef.transaction) return adapterDef.transaction(transactionName, atomicLogic, afterUnlock);
		else if (!adapterDef.commitLog) return afterUnlock("Cannot process transaction. Commit log disabled in adapter, and no custom transaction logic is defined.");

		// Generate unique lock
		var newLock = {
			uuid: uuid.v4(),
			name: transactionName,
			atomicLogic: atomicLogic,
			afterUnlock: afterUnlock
		};

		// write new lock to commit log
		if (!this.transactionCollection) {
			console.error("Trying to start transaction (" + transactionName + ") in collection:", this.identity);
			console.error("But the transactionCollection is: ", this.transactionCollection);
			return afterUnlock("Transaction collection not defined!");
		}
		this.transactionCollection.create(newLock, function afterCreatingTransaction(err, newLock) {
			if (err) return atomicLogic(err, function() {
				throw err;
			});

			// Check if lock was written, and is the oldest with the proper name
			self.transactionCollection.findAll(function afterLookingUpTransactions(err, locks) {
				if (err) return atomicLogic(err, function() {
					throw err;
				});

				var conflict = false;
				_.each(locks, function eachLock(entry) {

					// If a conflict IS found, respect the oldest
					if (entry.name === newLock.name && entry.uuid !== newLock.uuid && entry.id < newLock.id) conflict = entry;
				});

				// If there are no conflicts, the lock is acquired!
				if (!conflict) acquireLock(newLock);

				// Otherwise, get in line: a lock was acquired before mine, do nothing
			});
		});


		/**
		 * acquireLock() is run after the lock is acquired, but before passing control to the atomic app logic
		 *
		 * @newLock					the object representing the lock to acquire
		 * @name						name of the lock
		 * @atomicLogic				the transactional logic to be run atomically
		 * @afterUnlock (optional)	the function to run after the lock is subsequently released
		 */
		var acquireLock = function(newLock) {

			var warningTimer = setTimeout(function() {
				console.error("Transaction :: " + newLock.name + " is taking an abnormally long time (> " + waterlineConfig.transactionWarningTimer + "ms)");
			}, waterlineConfig.transactionWarningTimer);

			newLock.atomicLogic(null, function unlock() {
				clearTimeout(warningTimer);
				releaseLock(newLock, arguments);
			});
		};


		// releaseLock() will grant pending lock requests in the order they were received
		//
		// @currentLock			the lock currently acquired
		// @afterUnlockArgs		the arguments to pass to the afterUnlock function 
		var releaseLock = function(currentLock, afterUnlockArgs) {

			var cb = currentLock.afterUnlock;

			// Get all locks
			self.transactionCollection.findAll(function afterLookingUpTransactions(err, locks) {
				if (err) return cb && cb(err);

				// Determine the next user in line
				// (oldest lock that isnt THIS ONE w/ the proper transactionName)
				var nextInLine = getNextLock(locks, currentLock);

				// Remove current lock
				self.transactionCollection.destroy({
					uuid: currentLock.uuid
				}, function afterLockReleased(err) {
					if (err) return cb && cb(err);

					// Trigger unlock's callback if specified
					// > NOTE: do this before triggering the next queued transaction
					// to prevent transactions from monopolizing the event loop
					cb && cb.apply(null, afterUnlockArgs);

					// Now allow the nextInLine lock to be acquired
					// This marks the end of the previous transaction
					nextInLine && acquireLock(nextInLine);
				});
			});
		};

		// Find the oldest lock with the same transaction name
		function getNextLock(locks, currentLock) {
			var nextLock;
			_.each(locks, function(lock) {

				// Ignore locks with different transaction names
				if (lock.name !== currentLock.name) return;
				
				// Ignore current lock
				if (lock.uuid === currentLock.uuid) return;

				// Find the lock with the smallest id
				var minId = nextLock ? nextLock.id : MAX_INTEGER;
				if (lock.id < minId) nextLock = lock;
			});
			return nextLock;
		}
	};



	// Find this collection's auto-increment field and return its name
	pub.getAutoIncrementAttribute = function(collectionName, cb) {
		this.describe(collectionName, function(err, attributes) {
			var attrName, done = false;
			_.each(attributes, function(attribute, aname) {
				if (!done && _.isObject(attribute) && attribute.autoIncrement) {
					attrName = aname;
					done = true;
				}
			});

			cb(null, attrName);
		});
	};


	// Share this method with the child adapter
	adapterDef.getAutoIncrementAttribute = pub.getAutoIncrementAttribute;


	// Provide access to public methods
	return pub;

};