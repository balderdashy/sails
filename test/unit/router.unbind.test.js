/**
 * Module dependencies
 */
var $Sails = require('root-require')('test/helpers/sails');
var $Router = require('root-require')('test/helpers/router');



describe('sails.router.unbind', function (){

  var sails = $Sails.load.withAllHooksDisabled();


  $Router.unbind('get /foo')
  .shouldDelete({
    path: '/foo',
    method: 'get'
  });



  $Router.unbind('post /bar_baz_beezzz')
  .shouldDelete({
    path: '/bar_baz_beezzz',
    method: 'post'
  });



  $Router.unbind('patch /user')
  .shouldDelete({
    path: '/user',
    method: 'patch'
  });

});





