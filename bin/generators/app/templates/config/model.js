/**
 * Default model definition
 *
 * Unless you override them in each model file, the following options
 * will be included in all of your models by default:
 */
module.exports.model = {
  // The default connection(s) to use with your models
  // i.e. your app's primary database
  connections: [ 'dev_db' ],
  // The way waterline should handle changes to the model,
  // alter: Change/Remove columns to match the db to the model
  // safe: Do nothing currently
  // drop: Drop and recreate database
  migrate: 'safe'
};
