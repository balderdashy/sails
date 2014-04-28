/**
 * Module dependencies
 */
var supertest = require('supertest');

var $Sails = require('../../helpers/sails');
var $Router = require('../../helpers/router');


describe('Blueprints hook', function (){

	describe('without ORM hook', function (){
		$Sails.load({
			globals: false,
			loadHooks: [
				'moduleloader',
				'userconfig',
				'blueprints'
			]
		});


		// TODO: test that blueprint actions are loaded
		// TODO: test shadow routes are bound for:
		//					+ all controller actions
		//					+ controllers' index action
	});



	describe('with controllers hook', function (){
		$Sails.load({
			globals: false,
			loadHooks: [
				'moduleloader',
				'userconfig',
				'controllers',
				'blueprints'
			]
		});

		// TODO: test that blueprint actions are loaded
		// TODO: test shadow routes are bound:
		//			+ controller.*()
		//			+ controller.index()
		//			+ CRUD methods (find(),create(),etc.)
		//				+ RESTful (GET,POST,PUT,DELETE)
		//				+ URL-bar shortcuts (/find, /create, etc.)

	});



	describe('with ORM hook', function (){
		$Sails.load({
			globals: false,
			loadHooks: [
				'moduleloader',
				'userconfig',
				'orm',
				'blueprints'
			]
		});

		// TODO: test that blueprint actions are loaded
		// TODO: test shadow routes are bound:
		//			+ controller.*()
		//			+ controller.index()
		//			+ CRUD methods (find(),create(),etc.)
		//				+ RESTful (GET,POST,PUT,DELETE)
		//				+ URL-bar shortcuts (/find, /create, etc.)

	});


	describe('with ORM and controllers hooks', function (){
		$Sails.load({
			globals: false,
			loadHooks: [
				'moduleloader',
				'userconfig',
				'orm',
				'controllers',
				'blueprints'
			]
		});

		// TODO: test that blueprint actions are loaded
		// TODO: test shadow routes are bound:
		//			+ controller.*()
		//			+ controller.index()
		//			+ CRUD methods (find(),create(),etc.)
		//				+ RESTful (GET,POST,PUT,DELETE)
		//				+ URL-bar shortcuts (/find, /create, etc.)

	});

	describe('with ORM and policies hooks', function (){
		$Sails.load({
			globals: false,
			loadHooks: [
				'moduleloader',
				'userconfig',
				'orm',
				'policies',
				'blueprints'
			]
		});

		// TODO: test that blueprint actions are loaded
		// TODO: test shadow routes are bound:
		//			+ controller.*()
		//			+ controller.index()
		//			+ CRUD methods (find(),create(),etc.)
		//				+ RESTful (GET,POST,PUT,DELETE)
		//				+ URL-bar shortcuts (/find, /create, etc.)

	});


	describe('with controllers and policies hooks', function (){
		$Sails.load({
			globals: false,
			loadHooks: [
				'moduleloader',
				'userconfig',
				'controllers',
				'policies',
				'blueprints'
			]
		});

		// TODO: test that blueprint actions are loaded
		// TODO: test shadow routes are bound:
		//			+ controller.*()
		//			+ controller.index()
		//			+ CRUD methods (find(),create(),etc.)
		//				+ RESTful (GET,POST,PUT,DELETE)
		//				+ URL-bar shortcuts (/find, /create, etc.)

	});


	describe('with controllers, policies, and orm hooks', function (){
		$Sails.load({
			globals: false,
			loadHooks: [
				'moduleloader',
				'userconfig',
				'controllers',
				'policies',
				'orm',
				'blueprints'
			]
		});

		// TODO: test that blueprint actions are loaded
		// TODO: test shadow routes are bound:
		//			+ controller.*()
		//			+ controller.index()
		//			+ CRUD methods (find(),create(),etc.)
		//				+ RESTful (GET,POST,PUT,DELETE)
		//				+ URL-bar shortcuts (/find, /create, etc.)

	});


});





