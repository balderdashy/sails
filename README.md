# [![Sails.js](http://balderdashy.github.io/sails/images/logo.png)](http://sailsjs.org)

### [Website](http://sailsjs.org/)  &nbsp; [Getting Started](http://sailsjs.org/#!getStarted) &nbsp;  [Documentation](http://sailsjs.org/#!documentation)  &nbsp; [Submit Issue](https://github.com/balderdashy/sails/search?q=&type=Issues)

Sails.js is a web framework that makes it easy to build custom, enterprise-grade Node.js apps. It is designed to resemble the MVC architecture from frameworks like Ruby on Rails, but with support for the more modern, data-oriented style of web app development. It's especially good for building realtime features like chat.


## Installation

**With [node](http://nodejs.org) [installed](http://sailsjs.com/#!documentation/new-to-nodejs):**
```sh
# Get the latest stable release of Sails
$ sudo npm install sails -g
```


## Your First Sails Project

**Create a new app:**
```sh
# Create the app
$ sails new testProject
```

**Lift sails:**
```sh
# cd into the new folder
$ cd testProject

# fire up the server
$ sails lift
```

**Generate a REST API:**

[![ScreenShot](http://i.imgur.com/Ii88jlhl.png)](https://www.youtube.com/watch?v=GK-tFvpIR7c)


## Compatibility

[![NPM version](https://badge.fury.io/js/sails.png)](http://badge.fury.io/js/sails)

Sails is built on Node.js, Connect, Express, and Socket.io.

Sails [controllers](http://sailsjs.org/#!documentation/controllers) are compatible with Connect middleware, so in most cases, you can paste code into Sails from an existing Express project and everything will work-- plus you'll be able to use WebSockets to talk to your API, and vice versa.

The ORM, [Waterline](https://github.com/balderdashy/waterline), has a well-defined adapter system for supporting all kinds of datastores.  Officially supported databases include **[MySQL](https://github.com/balderdashy/sails-mysql)**, **[PostgreSQL](https://github.com/balderdashy/sails-postgresql)**, **[MongoDB](https://github.com/balderdashy/sails-mongo)**, **[Redis](https://github.com/balderdashy/sails-redis)**, local [disk](https://github.com/balderdashy/sails-disk), and local [memory](https://github.com/balderdashy/sails-memory).  [Community adapters](https://github.com/balderdashy/sails-docs/blob/master/intro-to-custom-adapters.md#notable-community-adapters) exist for Riak, CouchDB, and ElasticSearch; for various 3rd-party REST APIs like Yelp and Twitter; plus some [eclectic projects](https://www.youtube.com/watch?v=OmcQZD_LIAE).




<!--
Generate a JSON API:
```sh
# generate a user model + controller (i.e. a User API)
sails generate user
```
-->

<!--
> Sails provides "blueprint routes" (URL mappings) and "blueprint actions" (built-in CRUD and pubsub operations) for every controller+model in your app. These "blueprints" can be configured and/or completely disabled as needed.  Notably, all logic in Sails (including blueprint actions) supports both WebSockets and HTTP out of the box.  

+ List all users ([http://localhost:1337/user](http://localhost:1337/user))
+ Find the user with id 1 ([http://localhost:1337/user/1](http://localhost:1337/user/1))
+ Create a new user ([http://localhost:1337/user/create?name=Fisslewick](http://localhost:1337/user/create?name=Fisslewick), or `POST to http://localhost:1337/user`)
+ Update the name of the user with id 1 ([http://localhost:1337/user/update/1?name=Gordo](http://localhost:1337/user/update/1?name=Gordo), or `PUT http://localhost:1337/user/1`)
+ Destroy the user with id 1 (visit [http://localhost:1337/user/destroy/1](http://localhost:1337/user/destroy/1), or `DELETE http://localhost:1337/user/1`)
-->


## Issue Submission
Make sure you've read the [issue submission guidelines](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md#opening-issues) before opening a new issue.

Sails is composed of a [number of different sub-projects](https://npmjs.org/search?q=sails), many of which have [their own dedicated repository](https://github.com/search?q=sails+user%3Amikermcneil+user%3Abalderdashy+user%3Aparticlebanana&type=Repositories&ref=advsearch&l=). If you are looking for a repo for a particular piece, you'll usually find it on the [organization](https://github.com/balderdashy) page.

## Feature Requests
See the [Trello board](https://trello.com/b/cGzNVE0b/sails-js-feature-requests) to view/discuss our roadmap and [request features](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md#requesting-features).

## Contribute
See the [contributing docs](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md).


## Support
Need help or have a question?

- [Tutorials](https://github.com/balderdashy/sails-docs/blob/master/FAQ.md#where-do-i-get-help)
- [Stackoverflow](http://stackoverflow.com/questions/tagged/sails.js)
- [#sailsjs on Freenode](http://webchat.freenode.net/) (IRC channel)
- [Professional/Enterprise Options](https://github.com/balderdashy/sails-docs/blob/master/FAQ.md#are-there-professional-support-options)

_Please don't use the issue tracker for support/questions._

## Links
- [Website](http://sailsjs.org/)
- [Official Documentation](http://sailsjs.org/#!documentation)
- [Changelog](https://github.com/balderdashy/sails-docs/blob/0.9/changelog.md)
- [Roadmap](https://github.com/balderdashy/sails-wiki/blob/0.9/roadmap.md)
- [Google Group](https://groups.google.com/forum/?fromgroups#!forum/sailsjs)
- [Twitter](https://twitter.com/sailsjs)
- [SailsCasts](http://irlnathan.github.io/sailscasts/)



## Team
Sails is actively built and maintained by [Balderdash](http://balderdash.co) ([@balderdashy](http://twitter.com/balderdashy)), a realtime web & mobile studio, with the help of these [contributors](https://github.com/balderdashy/sails/graphs/contributors):

[![Mike McNeil](http://gravatar.com/avatar/199046437b76e6ca73e00b4cc182a1c5?s=144)](http://michaelmcneil.com) | [![Cody Stoltman](https://1.gravatar.com/avatar/368567acca0c5dfb9a4ff512c5c0c3fa?s=144)](http://particlebanana.com) |  [![Scott Gress](https://0.gravatar.com/avatar/b74e07aa543552709bf546ca279c9c67?s=144)](http://www.pigandcow.com/) | [![Greg Thornton](https://2.gravatar.com/avatar/b7c50edb558d5289331440f45ff600b0?s=144)](http://xdissent.com) | [![Zoli Kahan](http://gravatar.com/avatar/55dbeca986f875e1d1cb4d51e2fc42e4?s=144)](http://www.zolmeister.com/)
:---:|:---:|:---:|:---:|:---:
[Mike McNeil](http://michaelmcneil.com) | [Cody Stoltman](http://particlebanana.com) | [Scott Gress](https://github.com/sgress454) | [Greg Thornton](https://github.com/xdissent) | [Zoli Kahan](https://github.com/Zolmeister)

Balderdash designs/builds scalable Node.js apps for startups and enterprise customers.  After building a few apps and taking them into production, we realized that the Node.js development landscape was very much still the Wild West.  Over time, after trying lots of different methodologies, we decided to crystallize all of our best practices into this framework.  [I](http://twitter.com/mikermcneil) hope it saves you some time :)


## License

[MIT License](http://sails.mit-license.org/)  Copyright © 2012-2014 Mike McNeil

> Sails is built around so many great open-source technologies that it would never have crossed our minds to keep it proprietary.  We owe huge gratitude and props to TJ Holowaychuk ([@visionmedia](https://github.com/visionmedia)) and Guillermo Rauch ([@guille](https://github.com/guille)) for the work they did, as well as the stewards of all the other open-source modules we use.  Sails could never have been developed without your tremendous contributions to the node community.

![image_squidhome@2x.png](http://i.imgur.com/RIvu9.png)

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/8acf2fc2ca0aca8a3018e355ad776ed7 "githalytics.com")](http://githalytics.com/balderdashy/sails)
