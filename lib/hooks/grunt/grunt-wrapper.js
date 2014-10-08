/**
 * A hack to exec grunt without knowing exactly where it is.
 *
 * grunt-cli could be installed as a peer to sails, so we don't know
 * where its bin script might be. But require can find it. We have this thin
 * wrapper to be a script we can exec, and it will execute the grunt-cli,
 * wherever it may be installed.
 */

require('grunt-cli/bin/grunt');
