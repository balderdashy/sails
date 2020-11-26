# Standalone Waterline usage

In addition to built-in usage with the Sails framework, Waterline can be used as a standalone module.

> **Warning:** This section of the documentation is for fairly advanced Node.js users.  If you aren't planning to use Waterline outside of your Sails app (e.g. to build your own framework), you might want to skip this page and head back to [Models and ORM](https://sailsjs.com/documentation/concepts/models-and-orm) instead.

### Installation

Waterline is available via NPM.

```sh
$ npm install --save waterline
```
Waterline ships without any adapters, so you will need to install these separately. For example:

```sh
$ npm install --save sails-mysql
$ npm install --save-dev sails-disk
```

You can install any number of adapters into your application.

The `sails-disk` adapter is a common choice for development and testing.

> If you are new to Node, hop on over to [Getting Started](https://sailsjs.com/get-started) to learn about installing Node on your preferred platform.


### Getting Started

To get started with Waterline as a standalone module, we need two ingredients: adapters and model definitions.

The simplest adapter is the `sails-disk` adapter. Let's install that and Waterline in an empty directory.

```sh
mkdir my-tool
cd my-tool
npm init
# ...
npm install waterline sails-disk
```

Now we want some sample code. Copy the [example code demonstrating raw Waterline usage from here](https://github.com/balderdashy/waterline-docs/blob/master/examples/src/getting-started.js) into a file in the same directory where the `waterline` and `sails-disk` packages were installed.

Before we run it, let's explore how it works.

```js
var Waterline = require('waterline');
var sailsDiskAdapter = require('sails-disk');
var waterline = new Waterline();
```

Here we are simply bootstrapping our main objects. We are setting up the `Waterline` factory object, an instance of an adapter, and an instance of `waterline` itself.

Next we define the specification for the user model, like so:

```js
var userCollection = Waterline.Collection.extend({
  identity: 'user',
  datastore: 'default',
  primaryKey: 'id',
  
  attributes: {
    id: {
        type: 'number',
        autoMigrations: {autoIncrement: true}
    },
    firstName: {type:'string'},
    lastName: {type:'string'},

    // Add a reference to Pets
    pets: {
      collection: 'pet',
      via: 'owner'
    }
  }
});
```

What's important here is the object that we are passing into that factory method.

We need to give our model an `identity` by which it can be referred to later, and also declare which datastore we are going to use.

> A datastore is an instance of an adapter. For example, you could have one datastore for each type of storage you are using (file, MySQL, etc). You might even have more than one datastore for the same type of adapter.

The `attributes` define the properties of the model. In a traditional database, these attributes would align with columns in a table. Our example, `pets`, is a little different because it's defining an association that allows a user to own multiple pets.

> In a relational database, the `pets` attribute won't appear as a column. Rather, it establishes a virtual one-to-many association with the pets model that we are about to define.

We must now define what a pet is:

```js
var petCollection = Waterline.Collection.extend({
  identity: 'pet',
  datastore: 'default',
  primaryKey: 'id'
  
  attributes: {
    id: {
        type: 'number',
        autoMigrations: {autoIncrement: true}
    },
    breed: {type:'string'},
    type: {type:'string'},
    name: {type:'string'},

    // Add a reference to User
    owner: {
      model: 'user'
    }
  }
});
```

Most of the structure is the same as for the user, except there's an additional `owner` field which specifies the owner of this pet.

> In our example, a pet can only have one owner, and we provide the associated model (in this case, `user`) within the `owner` field. Notice that the name of the model needs to match the `identity` given to the model. See, too, that a relational database will, in this example, create a column called `owner` containing a foreign key back to the `user` table.

Next we have some more boring setup chores:

```js
waterline.registerModel(userCollection);
waterline.registerModel(petCollection);
```

Here we are adding the model specifications into the `waterline` instance itself.

Last, but not least, we have to configure the datastores:

```js
var config = {
  adapters: {
    'disk': sailsDiskAdapter
  },

  datastores: {
    default: {
      adapter: 'disk'
    }
  }
};
```

Here we specify the `adapters` that will be used&mdash;one for each type of storage we intend to employ&mdash;and our `datastores`, which will usually contain datastore details for the target storage system (login details, file paths, etc.). Each datastore can be named; in this case we've named our datastore "default" for simplicity.  Depending on the adapter, further configuration may be available for items within `datastores`.  For instance, the `sails-disk` adapter allows the `dir` and `inMemoryOnly` settings to be configured.  See the [sails-disk adapter reference](https://sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters#?optional-datastore-settings-for-sailsdisk) for more information.


Ok, it's time to crank things up and work with the datastore. First we'll initialize the `waterline` instance, and then we can go to work:

```js
waterline.initialize(config, (err, ontology)=>{
  if (err) {
    console.error(err);
    return;
  }

  // Tease out fully initialized models.
  var User = ontology.collections.user;
  var Pet = ontology.collections.pet;

  // Since we're using `await`, we'll scope our selves an async IIFE:
  (async ()=>{
    // First we create a user
    var user = await User.create({
      firstName: 'Neil',
      lastName: 'Armstrong'
    });

    // Then we create the pet
    var pet = await Pet.create({
      breed: 'beagle',
      type: 'dog',
      name: 'Astro',
      owner: user.id
    });

    // Then we grab all users and their pets
    var users = await User.find().populate('pets');
    console.log(users);
  })()
  .then(()=>{
    // All done.
  })
  .catch((err)=>{
    console.error(err);
  });//_∏_
  
});
```

That's a fair chunk of code, so let's unpack it piece by piece.

First we `initialize` the Waterline instance. This wires up the datastores (maybe logs into a database server or two), parses any models looking for associations, and does a heap of other whizbangery. When all that's done, it defers to the callback we passed in the second argument.

After checking for an error, the `ontology` variable gathers the collection objects for our users and our pets. In the next lines, we add some shortcut variables to those collection objects in the form of `User` and `Pet`.

> We typically name models in the singular form; that is, for the _type_ of _object_ you'd get back from a query.

Next, we use some `await` goodness to create a user and a pet and see what we can get back out of the datastore.

We first use the `create` method to create a new user. We just need to supply the attributes for our user to get a copy of the record that was created.

> Note: unless you specify otherwise, Waterline adds an `id` primary key by default.

We then create a new pet. Notice that we can associate the `id` of the user that was created in the previous step with that pet. This is done by setting the `owner` field directly.

Once the pet is created, both sides of the association are ready. To join them, we simply add the pet to a `pets` array in our new user. Then we just save the record using the `save` method on the model.

> Note that `save` is only available on model objects returned by the query. Our `User` collection object does not have access to this.

Finally, we want to see what actually got stuffed into the database, so we use `User.find` to get all the `User` records out of the datastore. We also want the query to resolve the pet association, so we add the `populate` method to tell the query to retrieve the pet records for each user.

Running that simple application gives us:

```sh
$ node getting-started.js
[ { pets:
     [ { breed: 'beagle',
         type: 'dog',
         name: 'Astro',
         owner: 1,
         createdAt: Thu May 07 2015 20:44:37 GMT+1000 (AEST),
         updatedAt: Thu May 07 2015 20:44:37 GMT+1000 (AEST),
         id: 1 } ],
    firstName: 'Neil',
    lastName: 'Armstrong',
    createdAt: Thu May 07 2015 20:44:37 GMT+1000 (AEST),
    updatedAt: Thu May 07 2015 20:44:37 GMT+1000 (AEST),
    id: 1 } ]
```

There are the attributes given to the models, and we can see the primary keys that were automatically generated for us. We can also see that Waterline has thrown in some default `createdAt` and `updatedAt` timestamps. Cool!

> You can turn off the timestamps with other global or per-model configuration options.


### Testing

This section will walk you through running integration tests for Waterline models. For documentation on testing in Sails apps, see [Concepts > Testing](https://sailsjs.com/documentation/concepts/testing).

##### The testing framework

To run the tests, we need a testing framework. There are several out there, but for our examples we will be using [Mocha](mochajs.org). It's best to install this on the command line like so:

```js
$ npm install -g mocha
```

If you are interested in code coverage, you might want to check out a tool called [Istanbul](https://www.npmjs.com/package/istanbul). For spying, stubbing, and mocking, [Sinon](http://sinonjs.org) is a good choice. For simulating HTTP requests, [nock](https://www.npmjs.com/package/nock) is worth a look.

##### Testing a Waterline model

The following example shows how you might test a Waterline model. It assumes the following extremely simple application structure:

```none
root
|- models
|  |- Pet.js
|  `- User.js
`- test
   |- mocha.opts
   `- UserModelTest.js
```

##### `Pet.js`

Here's our standard example Pet model:

```js
module.exports = {

  identity: 'pet',
  datastore: 'default',

  attributes: {
    breed: 'string',
    type: 'string',
    name: 'string',

    // Add a reference to User
    owner: {
      model: 'user'
    }
  }
};
```

##### `User.js`

And our standard example User model:

```js
module.exports = {

  identity: 'user',
  datastore: 'default',

  attributes: {
    firstName: 'string',
    lastName: 'string',

    // Add a reference to Pets
    pets: {
      collection: 'pet',
      via: 'owner'
    }
  }
};
```

##### `UserModelTest.js`

Here's how to test our `User` model.

The `setup` function wires up the Waterline instance with our models, then initializes it. The models are using the `default` adapter, but here the test is overriding that configuration to use the disk adapter. We do this because it's fast, and because it may detect where we're trying to use "magic" in our models that might not be portable across database storages.

The `teardown` function clears the adapters so that future tests can start with a clean slate (it allows you to safely use the `-w` option with Mocha). Note that `teardown` assumes you are using Node 0.12; if you aren't, you'll either need to use a promise library, like Bluebird, or to convert the method to use `async` or similar.

Finally, we get to our test method that tries to create a user and make some basic assertions:

```js
var assert = require('assert');
var Waterline = require('waterline');
var sailsDiskAdapter = require('sails-disk');

suite('UserModel', function () {
  var waterline = new Waterline();
  var config = {
    adapters: {
      'sails-disk': sailsDiskAdapter
    },
    datastores: {
      default: {
        adapter: 'sails-disk'
      }
    }
  }

  setup(function (done) {
    waterline.loadCollection(
      Waterline.Collection.extend(require('../models/User.js'))
    );
    waterline.loadCollection(
      Waterline.Collection.extend(require('../models/Pet.js'))
    );
    waterline.initialize(config, function  (err, ontology) {
      if (err) {
        return done(err);
      }
      done();
    });
  });

  teardown(function () {
    var adapters = config.adapters || {};
    var promises = [];

    Object.keys(adapters)
      .forEach(function (adapter) {
        if (adapters[adapter].teardown) {
          var promise = new Promise(function (resolve) {
            adapters[adapter].teardown(null, resolve);
          });
          promises.push(promise);
        }
      });

    return Promise.all(promises);
  });

  test('should be able to create a user', function () {
    var User = waterline.collections.user;

    return User.create({
        firstName: 'Neil',
        lastName: 'Armstrong'
      })
      .then(function (user) {
        assert.equal(user.firstName, 'Neil', 'should have set the first name');
        assert.equal(user.lastName, 'Armstrong', 'should have set the last name');
        assert.equal(user.pets.length, 0, 'should have no pets');
      });
  });
});
```
> Obviously there is a lot of scope to refactoring the code into a utility library as you add more test files for your models.

Now all we have to to is run the tests:

```sh
$ mocha


  UserModel
    ✓ should be able to create a user


  1 passing (83ms)
```



<docmeta name="displayName" value="Standalone Waterline usage">
