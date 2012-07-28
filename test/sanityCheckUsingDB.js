var vows = require('vows'),
assert = require('assert');

// Mock the domain model
require(__dirname+"/../lib/common");

// Perform trivial test using built in Account / Role relations
// TODO:

vows.describe('Domain Model').addBatch({
	'after creating an Account, a Directory dA, a Directory dB, a File fA (in dA), and a File fB (in dB)': {
		topic: function () {
			var done = this.callback;
			
			// Create an instance of the given domain w/ the given properties
			var doCreate = function(domain,properties){
				return function(cb){
					console.log("TRYING TO CREATE "+domain);
					domain.create(properties).success(cb).error(function(e){
						throw new (e);
						console.log(e);
					});
				}
			}
			
			async.auto({
				createAccount:		doCreate(Account,{username:'testAccount'}),
				createDirectoryA:	doCreate(Directory,{name:'dA'}),
				createDirectoryB:	doCreate(Directory,{name:'dB'}),
				createFileA:		['createDirectoryA',doCreate(File,{name:'fA'})],
				createFileB:		['createDirectoryB',doCreate(File,{name:'fB'})]
			},function(){
				done();
			});
		},
		
		'when adding a FilePermission on fA': {
			topic: function () {
				var done = this.callback;
				done(true);
			},

			'both foreign keys exist': function (topic) {
				assert.isTrue(topic);
			}
		},
		'when adding a DirectoryPermission on dB': {
			topic: function () {
				var done = this.callback;
				done(true);
			},

			'both foreign keys exist': function (topic) {
				assert.isTrue(topic);
			}
		},
		'when moving fA into dB': {
			topic: function () {
				var done = this.callback;
				done(true);
			},

			'both foreign keys exist': function (topic) {
				assert.isTrue(topic);
			}
		}
	}
}).export(module);