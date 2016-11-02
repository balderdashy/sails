/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');


/**
 * [exports description]
 * @return {[type]} [description]
 */

module.exports = function toJSON () {
  return _.reduce(this, function (pojo, val, key) {
    if (key === 'config') {
      pojo[key] = val;
    }
    if (key === 'hooks') {
      pojo[key] = _.reduce(val, function (memo, hook, ident) {
        memo.push(ident);
        return memo;
      }, []);
    }
    if (key === 'models') {
      pojo[key] = _.reduce(val, function (memo, model, ident) { //TODO: unused variable ident
        if (!model.junctionTable) {
          memo.push({
            attributes: model.attributes,
            identity: model.identity,
            globalId: model.globalId,
            connection: model.connection,
            schema: model.schema,
            tableName: model.tableName
          });
        }
        return memo;
      }, []);
    }

    return pojo;
  }, {});
};
