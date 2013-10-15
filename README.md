# Sails.js [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=master)](https://travis-ci.org/balderdashy/sails) [![NPM version](https://badge.fury.io/js/sails.png)](http://badge.fury.io/js/sails)

![image_squidhome@2x.png](http://i.imgur.com/RIvu9.png)

Sails.js makes it easy to build custom, enterprise-grade Node.js apps. It is designed to resemble the MVC architecture from frameworks like Ruby on Rails, but with support for the more modern, data-oriented style of web app development.  It's especially good for building realtime features like chat.



## Installation

To install the latest stable release with the command-line tool:
```sh
sudo npm -g install sails
```


## Creating a New Sails Project

Create a new app
```sh
# Create the app
sails new testProject
```

Lift Sails
```sh
# cd into the new folder
cd testProject

# Fire up the server  
sails lift
```

The default port for Sails is 1337, so at this point, if you visit <a href="http://localhost:1337/">http://localhost:1337/</a>, you'll see the default home page.

Now, let's get Sails to do cool stuff.


## Creating a RESTful JSON API

Sails.js API blueprints are nothing like scaffolds. Generated forms just don't make sense for modern web apps (no one uses them!)
Instead, Sails allows you to generate a powerful RESTful JSON API using the command line tool.
This is exactly what you need for [AJAX web pages](http://irlnathan.github.io/sailscasts/blog/2013/10/10/building-a-sails-application-ep22-manipulating-the-dom-based-upon-changes-via-real-time-model-events/), [realtime apps](http://lanyrd.com/2013/nodepdx/video/), [SPAs](https://www.youtube.com/watch?v=Di50_eHqI7I), [Backbone apps](http://net.tutsplus.com/tutorials/javascript-ajax/working-with-data-in-sails-js/), [Angular apps](https://github.com/rdroro/tulipe-personal-todolist), [Cordova/PhoneGap apps](https://groups.google.com/forum/#!topic/sailsjs/o7HaB0rvSKU), [native mobile apps](https://github.com/aug2uag/SampleAppiOS), [refrigerators](https://www.youtube.com/watch?v=tisWSKMPIg8), [lamps](https://www.youtube.com/watch?v=OmcQZD_LIAE), etc.

Without writing any code, Sails supports:
  + filtering (`where`)
  + search (`or`, `and`, `in`, `startsWith`, `endsWith`, `contains`, `greaterThan`, `lessThan`, `not`)
  + sorting (`sort`)
  + pagination (`limit`, `skip`, `sort`)
  + JSONP
  + CORS
  + csrf protection

Best of all, all of these things work with both HTTP _and_ WebSockets, and work across any of the supported database adapters, including PostgreSQL, MongoDB, and MySQL.  Authentication and access control are implemented using [policies](https://github.com/balderdashy/sails-docs/blob/0.9/policies.md).  More on all that stuff here:

[![Creating a REST API with Sails.js](http://i.imgur.com/drtMlWH.png)](//www.youtube.com/embed/xlOolpwwGQg?feature=player_embedded) [![Original Sails.js Screencast from March 2013](http://balderdashy.github.com/sails/images/screenshot.png)](http://youtu.be/GK-tFvpIR7c)

---------------------------------------------------------------------------------

###### Enough talk!  Let's generate a User API.


We'll need an empty model and controller:
```
sails generate user
```

If you check out your app, you'll notice that this created a file at **/api/models/User.js** and **/api/controllers/UserController.js**.  

Now, if you send a POST request to `http://localhost:1337/user` or visit `http://localhost:1337/user/create`, you'll see:
```json
{
  "createdAt": "2013-01-10T01:33:19.105Z",
  "updatedAt": "2013-01-10T01:33:19.105Z",
  "id": 1
}
```

That's it!  You just created a model in the database!  You can also `find`, `update`, and `destroy` users:

```bash
# List of all users
http://localhost:1337/user

# Find the user with id 1
http://localhost:1337/user/1

# Create a new user
http://localhost:1337/user/create?name=Fisslewick
(or send an HTTP POST to http://localhost:1337/user)

# Update the name of the user with id 1
http://localhost:1337/user/update/1?name=Gordo
(or send an HTTP PUT to http://localhost:1337/user/1)

# Destroy the user with id 1
http://localhost:1337/user/destroy/1
(or send an HTTP DELETE to http://localhost:1337/user/1)
```


> #### JSONP, CORS, CSRF?
> This built-in API bundles optional support for JSONP-- and in general, Sails has built-in support for CORS, and CSRF protection.
> See your project's `config/cors.js`, `config/csrf.js`, and `config/controllers.js` files for more options.


## Custom Controllers

These automatically generated URL routes are called "blueprints".  Blueprints may be disabled, pluralized, or prefixed globally or on a per-controller basis.

But what if you need more customized logic?  

Say, your `UserController.create` needs to also send a confirmation email-- no problem.
Just write a custom `create` method in your `UserController` and it will be available using the same blueprint routes (e.g. `POST /user`)


Custom controllers are just Express middleware, the de facto standard for writing server code in Node.js. 

e.g.
```javascript
// api/controllers/UserController
module.exports = {
  /**
   * @param {String} email
   * @param {String} name
   */
  create: function (req, res) {
    User.create({
      name: req.param('name'),
      email: req.param('email')
    })
    .exec(function userCreated(err, newUser) {
    
      // Bail out if there's an error!
      // (this will use the app-global logic in config/500.js)
      if (err) return res.serverError(err);
      
      // Send some email
      require('my-favorite-email-module').send({
        html: 'Well that\'s neat.',
        to: newUser.email
      });
      
      sails.log('New user created successfully!');
      sails.log.verbose('Confirmation email sent to', newUser.email);
      
      // Send JSON response
      return res.json(newUser);
    })
  }
};
```



> Worth noting is that the custom controller above still supports WebSockets out of the box, since Sails will actually simulate `req` and `res` objects when it receives properly-formatted messages from Socket.io.
> Check out `assets/js/app.js` in your project for an example of how to use Socket.io to talk to your Sails backend.





## Custom Routes

You can also define custom routes, controllers, and controller methods (aka "actions").

```sh
sails generate controller hello index
```

This will generate a file called `HelloController.js` in your app's `api/controllers` directory with one action, `index()`.

Now let's edit that action to send back the string `'Hello World!'`.

```javascript
// api/controllers/HelloController.js
module.exports = {

  index: function(req, res) {
    // Here, you can do all the Express/Connect things!
    res.send('Hello World!');
  }
};
```


Let's say we want the application to display this hello response specifically when a request comes in for `http://localhost:1337/hi`. 
Go into the **/config/routes.js** file and add a route like this:

```javascript
// config/routes.js
module.exports = {
	'/hi': 'HelloController.index'
};
```

Finally, restart the server by going to your node terminal and pressing control+c. Then enter the following.

```sh
sails lift
```

Now when you visit <a href="http://localhost:1337/hi">http://localhost:1337/hi</a>, or send a Sails-formatted Socket.io message to `/hi`:
```
// Try this from the Chrome/Firebug javascript console on your app's home page:
socket.get('/hi', function (response) { console.log(response); });
```

You'll see:

```
Hello World!
```



## Documentation & Resources

#### Official Documentation
[Docs](http://github.com/balderdashy/sails-docs)

#### FAQ
https://github.com/balderdashy/sails/wiki

#### SailsCasts
Short screencasts that take you through the basics of building traditional websites, single-page/mobile apps, and APIs using Sails.  Perfect for both novice and tenured developers, but does assume some background on MVC:
[SailsCasts](http://irlnathan.github.io/sailscasts/)

#### Google Group
If you have questions, ideas, or run into a problem, post it to our google group-- someone there might be able to help you.
[Sails.js Google Group](https://groups.google.com/forum/?fromgroups#!forum/sailsjs)

#### IRC
We're [#sailsjs on freenode](http://webchat.freenode.net/)





## Version, Dependencies and Compatibility

#### Latest stable release
[![NPM](https://nodei.co/npm/sails.png?downloads=true&stars=true)](https://nodei.co/npm/sails/)


#### Dependencies
Sails is tested with [node](http://nodejs.org/) versions 0.8.22 and 0.10.x, and built on the rock-solid foundations of [Express](http://expressjs.com/) and [Socket.io](http://socket.io/).

[![NPM](https://nodei.co/npm/express.png?compact=true)](https://nodei.co/npm/express/)  [![NPM](https://nodei.co/npm/socket.io.png?compact=true)](https://nodei.co/npm/socket.io/)
<!-- <img src="http://nodejs.org/images/logos/nodejs.png"/> -->

#### What's Next?
+ [Roadmap](https://github.com/balderdashy/sails-wiki/blob/0.9/roadmap.md)

#### What's Changed?
+ [Changelog](https://github.com/balderdashy/sails-wiki/blob/0.9/changelog.md)

<br/>
<br/>


<!-- ![icon_circleheart@2x.png](http://i.imgur.com/liHPV.png) -->

## Who Built This?

The Sails framework was developed by Mike McNeil ([@mikermcneil](http://twitter.com/mikermcneil)) and is maintained by [Balderdash](http://balderdash.co) ([@balderdashy](http://twitter.com/balderdashy)), a realtime web & mobile studio I started with Heather White (@hdesignsit) in Austin, TX a few years ago.  We design/build scalable Node.js apps for startups and enterprise customers.

After building a few realtime JavaScript apps and taking them into production, we realized that the Node.js development landscape was very much still the Wild West.  Over time, after trying lots of different methodologies, we decided to crystallize all of our best practices into this framework.  I hope it saves you some time :)




<!-- ![icon_circlelightbulb@2x.png](http://i.imgur.com/eOFXn.png)  -->

License
--

Sails is built around so many great open-source technologies that it would never have crossed our minds to keep it proprietary.  We owe huge gratitude and props to TJ Holowaychuk ([@visionmedia](https://github.com/visionmedia)) and Guillermo Rauch ([@guille](https://github.com/guille)) for the work they did, as well as the stewards of all the other open-source modules we use.  Sails could never have been developed without your tremendous contributions to the node community.


The MIT License (MIT)
--

Copyright © 2012-2013 Mike McNeil

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/8acf2fc2ca0aca8a3018e355ad776ed7 "githalytics.com")](http://githalytics.com/balderdashy/sails)
