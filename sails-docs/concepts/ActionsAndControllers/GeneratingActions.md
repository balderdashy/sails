# Generating controllers or standalone actions

You can use [`sails-generate`](https://sailsjs.com/documentation/reference/command-line-interface/sails-generate) from the Sails command line tool to quickly generate a controller, or even just an individual action.


### Generating controllers

For example, to generate a controller:

```sh
$ sails generate controller user
```

Sails will generate `api/controllers/UserController.js`:

```javascript
/**
 * UserController.js
 *
 * @description :: Server-side controller action for managing users.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {

}
```

### Generating standalone actions

Run the following command to generate a standalone action:

```sh
$ sails generate action user/signup
info: Created an action!
Using "actions2"...
[?] https://sailsjs.com/docs/concepts/actions
```

Sails will create `api/controllers/user/sign-up.js`:

```javascript
/**
 * user/sign-up.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {


  friendlyName: 'Sign up',


  description: '',


  inputs: {

  },


  exits: {

  },


  fn: function (inputs, exits) {

    return exits.success();

  }


};

```


Or, using the [classic actions](https://sailsjs.com/documentation/concepts/actions-and-controllers#?classic-actions) interface:


```sh
$ sails generate action user/signup --no-actions2
info: Created a traditional (req,res) controller action, but as a standalone file
```

Sails will create `api/controllers/user/sign-up.js`:

```javascript
/**
 * Module dependencies
 */

// ...


/**
 * user/signup.js
 *
 * Signup user.
 */
module.exports = function signup(req, res) {

  sails.log.debug('TODO: implement');
  return res.ok();

};
```




<docmeta name="displayName" value="Generating actions and controllers">
