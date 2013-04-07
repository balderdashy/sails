// package.js
// --------------------
// 
// Parses this version of Sails' package.json file

var fs = require('fs');
var packageJSONPath = __dirname + '/../../package.json';
var packageJSON = fs.readFileSync(packageJSONPath, 'utf-8');
module.exports = JSON.parse(packageJSON);