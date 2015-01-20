<h1>
<a href="http://sailsjs.org"><img alt="Sails.js logo" src="http://balderdashy.github.io/sails/images/logo.png" title="Sails.js"/></a>
</h1>

### [Website](http://sailsjs.org/)  &nbsp; [Getting Started](http://sailsjs.org/#!getStarted) &nbsp;  [Docs](http://sailsjs.org/#!documentation)  &nbsp; [Submit Issue](https://github.com/balderdashy/sails/blob/master/README.md#issue-submission)

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/balderdashy/sails?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


Sails.js is a web framework that makes it easy to build custom, enterprise-grade Node.js apps. It is designed to resemble the MVC architecture from frameworks like Ruby on Rails, but with support for the more modern, data-oriented style of web app development. It's especially good for building realtime features like chat.


## Installation &nbsp;  [![NPM version](https://badge.fury.io/js/sails.svg)](http://badge.fury.io/js/sails)

**With [node](http://nodejs.org) [installed](http://sailsjs.org/#!documentation/new-to-nodejs):**
```sh
# Get the latest stable release of Sails
$ sudo npm install sails -g
```

> ######New release available
> The v0.11 release of Sails (with support for Socket.io v1.0) is nearly here.  You can preview the v0.11 upgrading guide [here](http://sailsjs.org/#/documentation/concepts/Upgrading).  To install the beta, run:
> ```
> sudo npm install -g sails@beta
> ```


> ######Upgrading from v0.9?
> Be sure and check out the [v0.10 upgrading guide](http://sailsjs.org/#/documentation/concepts/Upgrading).


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

Sails [controllers](http://sailsjs.org/#!documentation/controllers) are compatible with Connect middleware, so in most cases, you can paste code into Sails from an existing Express project and everything will work-- plus you'll be able to use WebSockets to talk to your API, and vice versa.


The ORM, [Waterline](https://github.com/balderdashy/waterline), has a well-defined adapter system for supporting all kinds of datastores.  Officially supported databases include [MySQL](https://github.com/balderdashy/sails-mysql), [PostgreSQL](https://github.com/balderdashy/sails-postgresql), [MongoDB](https://github.com/balderdashy/sails-mongo), [Redis](https://github.com/balderdashy/sails-redis), local [disk](https://github.com/balderdashy/sails-disk), and local [memory](https://github.com/balderdashy/sails-memory).  [Community adapters](https://github.com/balderdashy/sails-docs/blob/master/intro-to-custom-adapters.md#notable-community-adapters) exist for [CouchDB](https://github.com/search?q=sails+couch&nwo=codeswarm%2Fsails-couchdb-orm&search_target=global&ref=cmdform), [neDB](https://github.com/adityamukho/sails-nedb), [TingoDB](https://github.com/andyhu/sails-tingo), [SQLite](https://github.com/AndrewJo/sails-sqlite3/tree/0.10), [Oracle](https://github.com/search?q=sails+oracle&type=Repositories&ref=searchresults), [MSSQL](https://github.com/cnect/sails-mssql), [DB2](https://github.com/search?q=sails+db2&type=Repositories&ref=searchresults), [ElasticSearch](https://github.com/search?q=%28elasticsearch+AND+sails%29+OR+%28elasticsearch+AND+waterline%29+&type=Repositories&ref=searchresults), [Riak](https://github.com/search?q=sails+riak&type=Repositories&ref=searchresults),
[neo4j](https://www.npmjs.org/package/sails-neo4j),
[Amazon RDS](https://github.com/TakenPilot/sails-rds), [DynamoDB](https://github.com/TakenPilot/sails-dynamodb), [Azure Tables](https://github.com/azuqua/sails-azuretables), and [RethinkDB](https://github.com/search?q=%28%28sails+rethinkdb+in%3Aname%29+OR+%28waterline+rethinkdb+in%3Aname%29%29&type=Repositories&ref=searchresults); for various 3rd-party REST APIs like Quickbooks, Yelp, and Twitter, including a configurable generic [REST API adapter](https://github.com/zohararad/sails-rest); plus some [eclectic projects](https://www.youtube.com/watch?v=OmcQZD_LIAE).

<!-- Core adapter logos -->
<a target="_blank" href="http://www.mysql.com">
  <img width="75" src="http://www.mysql.com/common/logos/powered-by-mysql-125x64.png" alt="Powered by MySQL" title="sails-mysql: MySQL adapter for Sails"/>
</a>&nbsp; &nbsp; &nbsp; &nbsp;
<a target="_blank" href="http://www.postgresql.org/"><img width="50" title="PostgreSQL" src="http://i.imgur.com/OSlDDKv.png"/></a>&nbsp; &nbsp; &nbsp; &nbsp;
<a target="_blank" href="http://www.mongodb.org/"><img width="100" title="MongoDB" src="http://i.imgur.com/bC2j13z.png"/></a>&nbsp; &nbsp; &nbsp; &nbsp;
<a target="_blank" href="http://redis.io/"><img width="75" title="Redis" src="http://i.imgur.com/dozv0ub.jpg"/></a>&nbsp; &nbsp; &nbsp; &nbsp;
<!-- /core adapter logos -->


## Issue Submission
Make sure you've read the [issue submission guidelines](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md#opening-issues) before opening a new issue.

Sails is composed of a [number of different sub-projects](https://github.com/balderdashy/sails/blob/master/MODULES.md), many of which have [their own dedicated repository](https://github.com/search?q=sails+user%3Amikermcneil+user%3Abalderdashy+user%3Aparticlebanana&type=Repositories&ref=advsearch&l=). If you suspect an issue in one of Sails sub-modules, you'll usually find its repo on the [organization](https://github.com/balderdashy) page.  Click [here](https://github.com/balderdashy/sails/search?q=&type=Issues) to search/post issues in this repository.

## Feature Requests
See the [Trello board](https://trello.com/b/cGzNVE0b/sails-js-feature-requests) to view/discuss our roadmap and [request features](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md#requesting-features).

## Contribute
See the [contribution guide](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md).


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
[Mike McNeil](http://michaelmcneil.com) | [Cody Stoltman](https://github.com/particlebanana) | [Scott Gress](https://github.com/sgress454) | [Greg Thornton](https://github.com/xdissent) | [Zoli Kahan](https://github.com/Zolmeister)

[Balderdash](http://balderdash.co) designs/builds scalable Node.js apps for startups and enterprise customers.  After building a few apps and taking them into production, we realized that the Node.js development landscape was very much still the Wild West.  Over time, after trying lots of different methodologies, we decided to crystallize all of our best practices into this framework.  [I](http://twitter.com/mikermcneil) hope it saves you some time :)


## License

[MIT License](http://sails.mit-license.org/)  Copyright © 2012-2014 Mike McNeil

> Sails is built around so many great open-source technologies that it would never have crossed our minds to keep it proprietary.  We owe huge gratitude and props to TJ Holowaychuk ([@visionmedia](https://github.com/visionmedia)) and Guillermo Rauch ([@guille](https://github.com/guille)) for the work they did, as well as the stewards of all the other open-source modules we use.  Sails could never have been developed without your tremendous contributions to the node community.



![image_squidhome@2x.png](http://sailsjs.org/images/bkgd_squid@2x.png)

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/8acf2fc2ca0aca8a3018e355ad776ed7 "githalytics.com")](http://githalytics.com/balderdashy/sails)
