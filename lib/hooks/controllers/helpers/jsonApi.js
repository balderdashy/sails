var pluralize = require('pluralize');

module.exports = function (sails) {

  return function jsonAPI (Model, models) {
    var response = {};
    response[pluralize(Model.identity)] = models;
    return response;
  };
};

