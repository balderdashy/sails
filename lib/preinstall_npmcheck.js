/* Npm Preinstall Script
* This Script checks if the installed npm-Version matches the 'engine'-Item in package.json
 */

var child_process = require('child_process'),
    required_npm_version = require('./../package.json').engines.npm;


/*
 * Execute 'npm -v' and give back result
 * @param {callback} cb - callback-function(err,version)
 */

var getNpmVersion = function(cb) {

    child_process.exec('npm -v', function (err, stdout) {

        if(err){
            return cb(err);
        }

        // remove whitespaces
        stdout = stdout.replace(/\s+/g, '');

        // Check if version-number given back
        if(!/^[0-9]{1,}\.[0-9]{1,}\.[0-9]{1,}$/.test(stdout)){
            return cb('Unexpected output');
        }

        return cb(null,stdout);
    });
};

/*
 * Check if version of first parameter >= version of 2nd parameter
 * ATTENTION: Only support '>='
 * @param {string} v - Version to check (e.g. '10.5.2')
 * @param {string} v2 - Version to check against (e.g. '0.8.14')
 * @return {boolean}
 */
var checkVersion = function(v,v2) {

    // Delete all unnecessary strings and make arrays
    v = v.replace(/(\s+)|([^(0-9\.)])/g,'').split('.');
    v2 = v2.replace(/(\s+)|([^(0-9\.)])/g,'').split('.');

    if(v.length != 3 || !v2.length){
        return false;
    }

    // Fill with 0 if necessary
    if(v2.length < 3) {
        if(v2.length == 2){
            v2.push([0]);
        }else{
            v2.push([0,0]);
        }

    }

    var found = undefined;
    v.forEach(function(item,key) {
        if(found === undefined){

            if(item > v2[key]) {
                found = true;
            }else if(item < v2[key]) {
                found = false;
            }

        }
    });

    return found;

};


getNpmVersion(function(err,version){
    
    // If no npm found at 'engine'-Item in package.json
    if(required_npm_version === undefined){
        return process.exit(0);
    }

    if(err){
        console.log('\033[31mSails.js Installation - Error');
        console.log('--------------------------------------------------------\033[00m');
        console.log('Unable to check your npm-version');
        console.log('');
        console.log('Please reinstall npm to use Sails.js');
        console.log('\033[31m--------------------------------------------------------');
        return process.exit(1);
    }


    // If installed Version to old
    if(!checkVersion(version,required_npm_version)){
        console.log('\033[31mSails.js Installation - Error');
        console.log('--------------------------------------------------------\033[00m');
        console.log('Your npm-Version is too old:');
        console.log('Sails require npm ' +required_npm_version+ ' (you currently have '+ version +')');
        console.log('');
        console.log('Please update the installed npm (Node Package Manager)');
        console.log(' to install Sails.');
        console.log('\033[31m--------------------------------------------------------');
        return process.exit(1);
    }

    console.log('Sails.js Installation: Checking npm-version successful');
    return process.exit(0);

});

