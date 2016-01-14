// Initialization script that runs once before any tests.
//

// Set the "SAILS_NEW_LINK" env var so that the "sails new" generator
// always uses symlinks (rather than doing npm install) regardless of
// which NPM version is installed.
//
// Traditionally, "sails new" has sped up the process of generating a
// new Sails app by symlinking required project dependencies from the
// Sails module's node_modules folder.  However, starting with NPM 3,
// this shortcut will cause subsequent dependencies (installed by the
// end-user) to fail on install, due to the new flattened node_modules
// file structure.
//
// Starting with NPM 3, doing "sails new" currently causes
// "npm install" to run, in order for the dependencies in the new Sails
// app to be properly flattened.  However, this takes a long time--too long
// for tests.  Since none of the tests install separate dependencies
// in the fixture app, we can get away with using the old symlink strategy,
// which can be activated with a --link option, or with an environment var.
process.env.SAILS_NEW_LINK = true;
