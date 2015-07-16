/**
 * npm pre-install script.
 *
 * This script checks if the installed npm-version matches the required engine
 * defined in the package.json.
 */

var exec = require('child_process').exec;
var project = require('./../package.json');


// Validate npm version before installing Sails.
if (project.engines && project.engines.npm) exec('npm -v', validateNpmVersion);

/**
 * Callback for the 'npm -v' execution.
 * @param  err    Possible command execution error.
 * @param  stdout Command execution result.
 */
function validateNpmVersion(err, stdout) {

  // Throw-up process errors.
  if (err) return exitWithMessage(err);

  // Parse Semver for current and required.
  var semver = getSemver(stdout);
  var requiredNpmSemver = getSemver(project.engines.npm, true);

  // Get only the release numbering.
  var version = semver && semver[1];
  var requiredNpmVersion = requiredNpmSemver && requiredNpmSemver[1];

  // If no version is identified, stop install.
  if (!version) exitWithMessage([
    'Unable to check your npm-version',
    '',
    'Please reinstall npm to use Sails.js'
  ]);

  // Handle old npm installations.
  if (!satisfiesVersion(version, requiredNpmVersion)) exitWithMessage([
    'Your current npm version (' + version + ') is not supported:',
    'Sails requires at least version ' + project.engines.npm,
    '',
    'Try uploading npm before installing Sails.'
  ]);

  console.log('Sails.js Installation: Checking npm-version successful');

  // Exit process with success.
  process.exit(0);
}

/**
 * Exit proccess with a given error beautifully.
 */
function exitWithMessage(err, code) {

  // Exit error header.
  console.log('\033[31mSails.js Installation - Error');
  console.log('--------------------------------------------------------\033[00m');

  // Exit (possibly multiple) error lines.
  (typeof err === 'string' ? [err] : err).forEach(function (err) {
    console.log(err);
  });

  // Exit error footer.
  console.log('\033[31m--------------------------------------------------------');

  // Exit processing with a 1 (error) default code.
  process.exit(code === undefined ? 1 : code);
}

/**
 * Parse version string into semver array.
 * @param {string} version
 * @param {boolean} range If version is a range, make sure to consider up-front
 *                        specification.
 * @return {Array}  An array with the version's parts or null if not valid.
 */
function getSemver(version, range) {

  // Fulfil possibly missing zeros, if range is allowed.
  if (range) {
    version = version.split('.');
    var missing = 3 - version.length;

    for(;missing > 0; missing--) {
      version.push(0);
    }

    version = version.join('.');
  }

  var versionRegex = '(([0-9]{1,})\\.([0-9]{1,})\\.([0-9]{1,}))(?:-?(.*))';
  var regex = new RegExp('^' + (range ? '(?:.*)' : '') + versionRegex + '$');

  return version.replace(/\s+/g, '').match(regex);
}

/**
 * Makes a simple '>=' version comparison.
 * @param  {string} version
 * @param  {string} compare
 * @return {boolean}
 */
function satisfiesVersion(version, compare) {
  version = version.split('.');
  compare = compare.split('.');
  var satisfied;

  return compare.every(function (value, i) {
    if (satisfied !== undefined) return satisfied;
    if (version[i] > value) return satisfied = true;
    if (version[i] < value) return satisfied = false;

    return true;
  }) && satisfied !== false;
}
