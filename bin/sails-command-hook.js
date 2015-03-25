var path = require('path');
var buildDictionary = require('sails-build-dictionary');
var _ = require('lodash');
var program = require('commander');

module.exports = function() {
  var cliArguments = _.initial(arguments);
  var commandName = cliArguments.shift();
  var args = cliArguments;
  buildDictionary.optional({
    dirname: path.resolve('.', "node_modules"),
    filter: /^(package\.json)$/,
    depth: 2
  }, function(err, packages) {
    var objectKeys = Object.keys(packages);
    for(var i = 0; i < objectKeys.length; i++){
      var pkg = packages[objectKeys[i]];
      var cmd = loadModule(pkg, commandName);
      if(cmd){
        cmd.execute(args);
        return;
      }
    }
    return program.usageMinusWildcard();
  });
};

function loadModule(package, commandName){
  if (package['package.json'] && package['package.json'].sails && package['package.json'].sails.isCommand) {
    var module = require(path.resolve('.', 'node_modules', package['package.json'].name));
    if(module.command){
      program.command(module.command); //add to list of help commands
      if (module.command === commandName) {
        return module;
      }
    }
  }
}
