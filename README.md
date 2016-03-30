<h1>
<a href="http://sailsjs.org"><img alt="Sails.js logo" src="http://balderdashy.github.io/sails/images/logo.png" title="Sails.js"/></a>
</h1>

### [Website](http://sailsjs.org/)  &nbsp; [Getting Started](http://sailsjs.org/get-started) &nbsp;  [Docs](http://sailsjs.org/documentation)  &nbsp; [Submit Issue](https://github.com/balderdashy/sails/blob/master/README.md#issue-submission)

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/balderdashy/sails?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![NPM version](https://badge.fury.io/js/sails.svg)](http://badge.fury.io/js/sails)


Sails.js is a web framework that makes it easy to build custom, enterprise-grade Node.js apps. It is designed to resemble the MVC architecture from frameworks like Ruby on Rails, but with support for the more modern, data-oriented style of web app development. It's especially good for building realtime features like chat.


## Installation &nbsp;
**With [node](http://nodejs.org) [installed](http://sailsjs.org/#!documentation/new-to-nodejs):**
```sh
# Get the latest stable release of Sails
$ sudo npm install sails -g
```

> ######Upgrading from 0.10 or 0.11?
> The v0.12 release of Sails contains a few breaking changes which affect userland. To read the v0.12 migration guide, click [here](http://sailsjs.org/version-notes/0point12-migration-guide).


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

Sails is built on [Node.js](http://nodejs.org/), [Connect](http://www.senchalabs.org/connect/), [Express](http://expressjs.com/), and [Socket.io](http://socket.io/).

Sails [controllers](http://sailsjs.org/documentation/concepts/controllers) are compatible with Connect middleware, so in most cases, you can paste code into Sails from an existing Express project and everything will work-- plus you'll be able to use WebSockets to talk to your API, and vice versa.

The ORM, [Waterline](https://github.com/balderdashy/waterline), has a well-defined adapter system for supporting all kinds of datastores.  Officially supported databases include [MySQL](https://github.com/balderdashy/sails-mysql), [PostgreSQL](https://github.com/balderdashy/sails-postgresql), [MongoDB](https://github.com/balderdashy/sails-mongo), [SQLite3](https://github.com/AndrewJo/sails-sqlite3), [Redis](https://github.com/balderdashy/sails-redis), local [disk](https://github.com/balderdashy/sails-disk), and local [memory](https://github.com/balderdashy/sails-memory).  [Community adapters](https://github.com/balderdashy/sails-docs/blob/master/contributing/intro-to-custom-adapters.md#notable-community-adapters) exist for [CouchDB](https://github.com/search?q=sails+couch&nwo=codeswarm%2Fsails-couchdb-orm&search_target=global&ref=cmdform), [neDB](https://github.com/adityamukho/sails-nedb), [TingoDB](https://github.com/andyhu/sails-tingo), [SQLite](https://github.com/AndrewJo/sails-sqlite3/tree/0.10), [Oracle](https://github.com/search?q=sails+oracle&type=Repositories&ref=searchresults), [MSSQL](https://github.com/cnect/sails-mssql), [DB2](https://github.com/search?q=sails+db2&type=Repositories&ref=searchresults), [ElasticSearch](https://github.com/search?q=%28elasticsearch+AND+sails%29+OR+%28elasticsearch+AND+waterline%29+&type=Repositories&ref=searchresults), [Riak](https://github.com/search?q=sails+riak&type=Repositories&ref=searchresults),
[neo4j](https://www.npmjs.org/package/sails-neo4j), [OrientDB](https://github.com/appscot/sails-orientdb),
[Amazon RDS](https://github.com/TakenPilot/sails-rds), [DynamoDB](https://github.com/TakenPilot/sails-dynamodb), [Azure Tables](https://github.com/azuqua/sails-azuretables), [RethinkDB](https://github.com/search?q=%28%28sails+rethinkdb+in%3Aname%29+OR+%28waterline+rethinkdb+in%3Aname%29%29&type=Repositories&ref=searchresults) and [Solr](https://github.com/sajov/sails-solr); for various 3rd-party REST APIs like Quickbooks, Yelp, and Twitter, including a configurable generic [REST API adapter](https://github.com/zohararad/sails-rest); plus some [eclectic projects](https://www.youtube.com/watch?v=OmcQZD_LIAE).

<!-- Core adapter logos -->
<a target="_blank" href="http://www.mysql.com">
  <img width="75" src="http://www.mysql.com/common/logos/powered-by-mysql-125x64.png" alt="Powered by MySQL" title="sails-mysql: MySQL adapter for Sails"/>
</a>&nbsp; &nbsp; &nbsp; &nbsp;
<a target="_blank" href="http://www.postgresql.org/"><img width="50" title="PostgreSQL" src="http://i.imgur.com/OSlDDKv.png"/></a>&nbsp; &nbsp; &nbsp; &nbsp;
<a target="_blank" href="http://www.mongodb.org/"><img width="100" title="MongoDB" src="http://i.imgur.com/bC2j13z.png"/></a>&nbsp; &nbsp; &nbsp; &nbsp;
<a target="_blank" href="http://redis.io/"><img width="75" title="Redis" src="http://i.imgur.com/dozv0ub.jpg"/></a>&nbsp; &nbsp; &nbsp; &nbsp;
<!-- /core adapter logos -->

## Books
- [Sails.js in Action](http://www.manning.com/mcneil/) by Mike McNeil and Irl Nathan (Manning Publications). [Chapter 1](https://www.manning.com/books/sails-js-in-action)
- [Pro Express.js: Part 3](http://link.springer.com/chapter/10.1007%2F978-1-4842-0037-7_18) by Azat Mardan (Apress).
- [Sails.js Essentials](https://www.packtpub.com/web-development/sailsjs-essentials) by Shaikh Shahid (Packt)

## Support
Need help or have a question?
- [StackOverflow](http://stackoverflow.com/questions/tagged/sails.js)
- [Develop Web Apps in Node.js and Sails.js](https://courses.platzi.com/courses/develop-apps-sails-js/) (free video course on [Platzi](http://platzi.com))
- [SailsCasts](http://irlnathan.github.io/sailscasts/)
- [What are the best video tutorials for Node.js or Sails.js?](https://www.quora.com/What-are-the-best-video-tutorials-for-Node-js-or-Sails-js) (Quora)
- [Sails.js from Scratch](http://code.tutsplus.com/courses/sailsjs-from-scratch) (video course on Tuts+)
- [Up and Running in Node.js](http://www.lynda.com/Node.js-tutorials/Up-Running-Node.js/370605-2.html) (Sails basics are covered towards the end of this video course on Lynda)
- [Gitter Chat Room](https://gitter.im/balderdashy/sails)
- [Professional/Enterprise Support](https://github.com/balderdashy/sails-docs/blob/master/FAQ.md#are-there-professional-support-options)


## Issue Submission
Please read the [issue submission guidelines](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md#opening-issues) before opening a new issue.

Sails is composed of a [number of different sub-projects](https://github.com/balderdashy/sails/blob/master/MODULES.md), many of which have their own dedicated repository. If you suspect an issue in one of these sub-modules, you can find its repo on the [organization](https://github.com/balderdashy) page, or in [MODULES.md](https://github.com/balderdashy/sails/blob/master/MODULES.md).  Click [here](https://github.com/balderdashy/sails/search?q=&type=Issues) to search/post issues in this repository.

## Feature Requests
If you have an idea for a new feature, please feel free to submit it as a pull request to the backlog section of the [ROADMAP.md](https://github.com/balderdashy/sails/blob/master/ROADMAP.md#feature-requests) file in this repository.

## Contribute
There are many different ways you can contribute to Sails:
- answering questions on [StackOverflow](http://stackoverflow.com/questions/tagged/sails.js), [Gitter](https://gitter.im/balderdashy/sails), [IRC](http://sailsjs.org/support/about-irc), [Facebook](https://www.facebook.com/sailsjs), or [Twitter](https://twitter.com/search?f=tweets&vertical=default&q=%40sailsjs%20OR%20%23sailsjs%20OR%20sails.js%20OR%20sailsjs&src=typd)
- improving the [documentation](https://github.com/balderdashy/sails-docs#contributing-to-the-docs) or [website](https://github.com/balderdashy/www.sailsjs.org/issues)
- translating the [documentation](https://github.com/balderdashy/sails-docs/issues/580) to your native language
- writing [tests](https://github.com/balderdashy/sails/blob/master/test/README.md)
- writing a [tutorial](https://github.com/sails101/contribute-to-sails101), giving a [talk](http://lanyrd.com/search/?q=sailsjs), or supporting [your local Sails meetup](http://www.meetup.com/find/?allMeetups=false&keywords=sails.js&radius=Infinity&sort=default)
- troubleshooting [reported issues](https://github.com/balderdashy/sails/search?q=&type=Issues)
- and [submitting patches](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md).

Please carefully read our [contribution guide](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md) and check the [master branch build status](https://github.com/balderdashy/sails/blob/master/MODULES.md) before submitting a pull request with code changes.


## Links
- [Website](http://sailsjs.org/)
- [Official Documentation](http://sailsjs.org/documentation)
- [Blog](http://blog.sailsjs.org)
- [Twitter](https://twitter.com/sailsjs)
- [Roadmap](https://github.com/balderdashy/sails/blob/master/ROADMAP.md#roadmap)
- [Google Group](https://groups.google.com/forum/#!forum/sailsjs)
- [Facebook](https://www.facebook.com/sailsjs)

## Team
Sails was built and is actively maintained by [Balderdash Design Company](http://balderdash.co) ([@balderdashy](http://twitter.com/balderdashy)) and [The Treeline Company](http://treeline.io) ([@treelinehq](http://twitter.com/treelinehq)), with the help of many other amazing [contributors](https://github.com/balderdashy/sails/graphs/contributors).  Our core team consists of:

[![Mike McNeil](http://gravatar.com/avatar/199046437b76e6ca73e00b4cc182a1c5?s=144)](http://twitter.com/mikermcneil) |  [![Cody Stoltman](https://1.gravatar.com/avatar/368567acca0c5dfb9a4ff512c5c0c3fa?s=144)](http://twitter.com/particlebanana) | [![Scott Gress](https://0.gravatar.com/avatar/b74e07aa543552709bf546ca279c9c67?s=144)](http://twitter.com/sgress454) | [![Irl Nathan](https://avatars0.githubusercontent.com/u/1598650?v=3&s=144)](http://twitter.com/irlnathan) | [![Rachael Shaw](https://avatars0.githubusercontent.com/u/3065949?v=3&s=144)](http://twitter.com/fancydoilies)
:---:|:---:|:---:|:---:|:---:
[Mike McNeil](http://github.com/mikermcneil) | [Cody Stoltman](https://github.com/particlebanana) | [Scott Gress](https://github.com/sgress454) | [Irl Nathan](https://github.com/irlnathan) | [Rachael Shaw](https://github.com/rachaelshaw)

Back in 2012, we were designing/builing scalable Node.js apps for startups and enterprise customers.  After building a few applications and taking them into production, we realized that the Node.js development landscape was very much still the Wild West.  Over time, after trying lots of different methodologies, we decided to crystallize all of our best practices into this framework.  Four years later, Sails is now one of the most widely-used web application frameworks in the world. We hope it saves you some time! :)

## License

[MIT License](http://sails.mit-license.org/)  Copyright © 2012-2016 Mike McNeil

> Sails is built around so many great open-source technologies that it would never have crossed our minds to keep it proprietary.  We owe huge gratitude and props to TJ Holowaychuk ([@visionmedia](https://github.com/visionmedia)) and Guillermo Rauch ([@rauchg](https://github.com/rauchg)) for the work they've done, as well as the stewards of all the other open-source modules we use.  Sails could never have been developed without your tremendous contributions to the node community.

![image_squidhome@2x.png](http://sailsjs.org/images/bkgd_squiddy.png)
