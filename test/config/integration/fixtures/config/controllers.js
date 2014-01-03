module.exports.controllers = {
  // all configs not commented out will be tested
  
  // (Note: global controller.routes config may be overridden on a per-controller basis
  //			by setting the 'blueprint' property in a controller)
  routes: {

    // Whether routes are automatically generated for controller actions
    actions: false,

    // e.g. '/:controller/find/:id'
    //shortcuts: true,

    // e.g. 'get /:controller/:id?': 'foo.find'
    //rest: true,

    // Optional mount path prefix for blueprint routes
    // e.g. '/api/v2'
    prefix: 'Z',

    // If a blueprint REST route catches a request,
    // only match an `id` if it's an integer
    expectIntegerId: true
  },


  // CSRF middleware protection, all non-GET requests must send '_csrf' parmeter
  // _csrf is a parameter for views, and is also available via GET at /csrfToken
  csrf: true

};