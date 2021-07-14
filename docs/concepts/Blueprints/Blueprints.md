# Blueprints

### Overview

Like any good web framework, Sails aims to reduce both the amount of code you write and the time it takes to get a functional app up and running.  _Blueprints_ are Sails&rsquo;s way of quickly generating API [routes](https://sailsjs.com/documentation/concepts/routes) and [actions](https://sailsjs.com/documentation/concepts/controllers#?actions) based on your application design.

Together, [blueprint routes](https://sailsjs.com/documentation/concepts/blueprints/blueprint-routes) and [blueprint actions](https://sailsjs.com/documentation/concepts/blueprints/blueprint-actions) constitute the **blueprint API**, the built-in logic that powers the [RESTful JSON API](http://en.wikipedia.org/wiki/Representational_state_transfer) you get every time you create a model and controller.

For example, if you create a `User.js` model file in your project, then with blueprints enabled you will be able to immediately visit `/user/create?name=joe` to create a user, and visit `/user` to see an array of your app's users.  All without writing a single line of code!

Blueprints are a powerful tool for prototyping, but in many cases can be used in production as well, since they can be overridden, protected, extended or disabled entirely.

### Up next

+ [Read more](https://sailsjs.com/documentation/concepts/blueprints/blueprint-actions) about built-in blueprint actions
+ [Read more](https://sailsjs.com/documentation/concepts/blueprints/blueprint-routes) about implicit "shadow" routes and how to configure or override them

<docmeta name="displayName" value="Blueprints">
