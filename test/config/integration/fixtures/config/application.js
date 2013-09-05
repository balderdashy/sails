module.exports = {
// all configs (not commented out) will be tested
  
  // Port to run this app on
  port: 1702,

  // Self-awareness: the host the server *thinks it is*
  host: 'localhost',

  // Name of application for layout title
  appName: 'portal',

  // Environment to run this app in; one of: ["development", "production"]
  environment: 'production',

  // HTTP cache configuration
  cache: {
    maxAge: 9001
  },
  
  // Custom options for express server
  /*express: {

    // Sails extras
    serverOptions: null,
    customMiddleware: null,

    // Built-in
    bodyParser: require('express').bodyParser,
    cookieParser: require('express').cookieParser,
    methodOverride: require('express').methodOverride
  },*/
  
  // Variables which will be made globally accessible
  globals: {
    _: false,
    /*async: false,
    sails: true,
    services: false,
    adapters: false,
    models: false*/
  },
  
  //ssl: {}

};