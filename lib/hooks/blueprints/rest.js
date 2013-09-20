module.exports = function (sails) {
  return {
    routes: {
      'get /:id?': 'find',
      'post /': 'create',
      'put /:id?': 'update',
      'delete /:id?': 'destroy'
    },
    middleware: {
      find: require('../controllers/controller.find.js')(sails),
      create: require('../controllers/controller.create.js')(sails),
      update: require('../controllers/controller.update.js')(sails),
      destroy: require('../controllers/controller.destroy.js')(sails)
    }
  };
};