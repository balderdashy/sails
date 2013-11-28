/**
 * Grunt errors
 */
 
module.exports = {

	fatal: {


		__GruntAborted__: function ( consoleMsg, stackTrace ) {
			sails.log.error(
				'A Grunt error occurred-- please fix it, then restart ' +
				'Sails to continue watching assets.'
			);
			var relativePublicPath = (require('path').resolve(process.cwd(), './.tmp'));
			var uid = process.getuid && process.getuid() || 'YOUR_COMPUTER_USER_NAME';
			console.log();
			sails.log.error('You might have a malformed LESS or CoffeeScript file...');
			sails.log.error('Or maybe you don\'t have permissions to access the `.tmp` directory?');
			sails.log.error('e.g.');
			sails.log.error(relativePublicPath,'?' );
			sails.log.error();
			sails.log.error('If you think it\'s the latter case, you might try running:');
			sails.log.error('sudo chown -R',uid,relativePublicPath);
			console.log();
			
			return process.exit(1);
		}
	}

};


