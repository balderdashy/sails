# [![Sails.js logo](http://balderdashy.github.io/sails/images/logo.png "Sails.js")](http://sailsjs.com)

### [Website](https://sailsjs.com/)  &nbsp; [Get Started](https://sailsjs.com/get-started) &nbsp;  [Docs](http://sailsjs.com/documentation)  &nbsp; [News](http://twitter.com/sailsjs) &nbsp; [Submit Issue](http://sailsjs.com/bugs)

[![NPM version](https://badge.fury.io/js/sails.svg)](http://badge.fury.io/js/sails) &nbsp; [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/balderdashy/sails)  &nbsp; [![Twitter Follow](https://img.shields.io/twitter/follow/sailsjs.svg?style=social&maxAge=3600)](https://twitter.com/sailsjs)

Sails.js is a [web framework](http://sailsjs.com/whats-that) that makes it easy to build custom, enterprise-grade Node.js apps. It is designed to resemble the MVC architecture from frameworks like Ruby on Rails, but with support for the more modern, data-oriented style of web app & API development. It's especially good for building realtime features like chat.

Since version 1.0, Sails supports `await` out of the box.  This replaces nested callbacks (and the commensurate error handling) with simple, familiar usage:

```javascript
var orgs = await Organization.find();
```


## Installation &nbsp;
**With [node](http://nodejs.org) [installed](http://nodejs.org/en/download):**
```sh
# Get the latest stable release of Sails
$ npm install sails -g
```

> ##### Upgrading from an earlier version of Sails?
>
> Available as of Node >=v7.9 and Sails >=v1.0, ES8's async/await enables dramatic improvements to the way developers build Node.js / Sails apps.  It allows server-side JavaScript code to be written with the `await` keyword, instead of lower-level (and more fragile) flow control mechanisms like nested callbacks and promise chains.  It lets developers breathe easier by removing the burden of painstaking, manual error handling after every database query.  And best of all, it means **the end of "callback hell"**: the most common source of bugs and stability issues in real world Node.js / Sails applications.
> 
> If ES8 isn't for you, don't worry-- Node callbacks and promise chaining are still fully supported.  But for most teams, the transition to `await` results in sizable gains in productivity, with fewer lines of code.
>
> Upgrade guides for all major releases since 2013 are available on the Sails website under [**Upgrading**](http://sailsjs.com/upgrading).


## Your First Sails Project

**Create a new app:**
```sh
# Create the app
sails new my-app
```

**Lift sails:**
```sh
# cd into the new folder
cd my-app

# fire up the server
sails lift
```

[![Screenshot from the original Sails video](http://i.imgur.com/Ii88jlhl.png)](https://sailsjs.com/get-started)

For the most up-to-date introduction to Sails, [get started here](https://sailsjs.com/get-started).

## Compatibility

Sails is built on [Node.js](http://nodejs.org/), [Express](http://expressjs.com/), and [Socket.io](http://socket.io/).

Sails [actions](http://sailsjs.com/documentation/concepts/actions-and-controllers) are compatible with Connect middleware, so in most cases, you can paste code into Sails from an existing Express project and everything will work-- plus you'll be able to use WebSockets to talk to your API, and vice versa.

The ORM, [Waterline](https://github.com/balderdashy/waterline), has a well-defined adapter system for supporting all kinds of datastores.  Officially supported databases include [MySQL](https://npmjs.com/package/sails-mysql), [PostgreSQL](https://npmjs.com/package/sails-postgresql), [MongoDB](https://npmjs.com/package/sails-mongo), [Redis](https://npmjs.com/package/sails-redis), and [local disk / memory](https://npmjs.com/package/sails-disk).
Community adapters exist for [CouchDB](https://github.com/search?q=sails+couch&nwo=codeswarm%2Fsails-couchdb-orm&search_target=global&ref=cmdform), [neDB](https://github.com/adityamukho/sails-nedb), [TingoDB](https://github.com/andyhu/sails-tingo), [SQLite](https://github.com/AndrewJo/sails-sqlite3/tree/0.10), [Oracle](https://github.com/search?utf8=%E2%9C%93&q=%22sails+oracle%22+OR+%22waterline+oracle%22&type=Repositories&ref=searchresults), [MSSQL](https://github.com/misterGF/sails-mssqlserver), [DB2](https://github.com/search?q=sails+db2&type=Repositories&ref=searchresults), [ElasticSearch](https://github.com/search?q=%28elasticsearch+AND+sails%29+OR+%28elasticsearch+AND+waterline%29+&type=Repositories&ref=searchresults), [Riak](https://github.com/search?q=sails+riak&type=Repositories&ref=searchresults),
[neo4j](https://www.npmjs.org/package/sails-neo4j), [OrientDB](https://github.com/appscot/sails-orientdb),
[Amazon RDS](https://github.com/TakenPilot/sails-rds), [DynamoDB](https://github.com/TakenPilot/sails-dynamodb), [Azure Tables](https://github.com/azuqua/sails-azuretables), [RethinkDB](https://github.com/gutenye/sails-rethinkdb) and [Solr](https://github.com/sajov/sails-solr); for various 3rd-party REST APIs like Quickbooks, Yelp, and Twitter, including a configurable generic [REST API adapter](https://github.com/zohararad/sails-rest); plus some [eclectic projects](https://www.youtube.com/watch?v=OmcQZD_LIAE).

<!-- Core adapter logos -->
<a target="_blank" href="http://www.mysql.com">
  <img width="75" src="http://www.mysql.com/common/logos/powered-by-mysql-125x64.png" alt="Powered by MySQL" title="sails-mysql: MySQL adapter for Sails"/>
</a>&nbsp; &nbsp; &nbsp; &nbsp;
<a target="_blank" href="http://www.postgresql.org/"><img width="50" title="PostgreSQL" src="http://i.imgur.com/OSlDDKv.png"/></a>&nbsp; &nbsp; &nbsp; &nbsp;
<a target="_blank" href="http://www.mongodb.org/"><img width="100" title="MongoDB" src="http://i.imgur.com/bC2j13z.png"/></a>&nbsp; &nbsp; &nbsp; &nbsp;
<a target="_blank" href="http://redis.io/"><img width="75" title="Redis" src="http://i.imgur.com/dozv0ub.jpg"/></a>&nbsp; &nbsp; &nbsp; &nbsp;
<!-- /core adapter logos -->

> For the latest core adapters and notable community adapters, see [Available Adapters](http://sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters).

## Tutorial Course
- [Full-Stack JavaScript with Sails.js and Vue.js](https://platzi.com/cursos/javascript-pro/), taught by [Mike McNeil](https://twitter.com/mikermcneil) _(in English, with optional Spanish subtitles)_


## Books
- [Sails.js in Action](https://www.manning.com/books/sails-js-in-action) by Mike McNeil and Irl Nathan (Manning Publications).
- [Sails.js Essentials](https://www.packtpub.com/web-development/sailsjs-essentials) by Shaikh Shahid (Packt)
- [Pro Express.js: Part 3](http://link.springer.com/chapter/10.1007%2F978-1-4842-0037-7_18) by Azat Mardan (Apress).

## Support
Need help or have a question?
- [Frequently Asked Questions (FAQ)](http://sailsjs.com/faq)
- [Tutorials](http://sailsjs.com/faq#?what-are-some-good-community-tutorials)
- [Community support](http://sailsjs.com/support)
- [Professional/Enterprise options](http://sailsjs.com/faq#?are-there-professional-support-options)


## Issue Submission
Please read the [submission guidelines](http://sailsjs.com/documentation/contributing/issue-contributions) and [code of conduct](http://sailsjs.com/documentation/contributing/code-of-conduct) before opening a new issue.  Click [here](https://github.com/balderdashy/sails/search?q=&type=Issues) to search/post issues in this repository.

## Contribute
There are many different ways you can contribute to Sails:
- answering questions on [StackOverflow](http://stackoverflow.com/questions/tagged/sails.js), [Gitter](https://gitter.im/balderdashy/sails), [Facebook](https://www.facebook.com/sailsjs), or [Twitter](https://twitter.com/search?f=tweets&vertical=default&q=%40sailsjs%20OR%20%23sailsjs%20OR%20sails.js%20OR%20sailsjs&src=typd)
- improving the [documentation](https://github.com/balderdashy/sails-docs#contributing-to-the-docs) or [website](https://github.com/balderdashy/www.sailsjs.com/issues)
- translating the [documentation](https://github.com/balderdashy/sails-docs/issues/580) to your native language
- writing [tests](https://github.com/balderdashy/sails/blob/master/test/README.md)
- writing a [tutorial](https://github.com/sails101/contribute-to-sails101), giving a [talk](https://speakerdeck.com/mikermcneil), or supporting [your local Sails meetup](https://www.meetup.com/find/?allMeetups=false&keywords=node.js&radius=Infinity&sort=default)
- troubleshooting [reported issues](http://sailsjs.com/bugs)
- and [submitting patches](http://sailsjs.com/documentation/contributing/code-submission-guidelines).

_Please carefully read our [contribution guide](http://sailsjs.com/documentation/contributing) and check the [build status](http://sailsjs.com/architecture) for the relevant branch before submitting a pull request with code changes._


## Links
- [Website](http://sailsjs.com/)
- [Documentation](http://sailsjs.com/documentation)
- [Ask a question](http://sailsjs.com/support)
- [Tutorial](https://platzi.com/cursos/javascript-pro/)
- [Roadmap](https://trello.com/b/s9zEnyG7/sails-v1)
- [Twitter (@sailsjs)](https://twitter.com/sailsjs)
- [Facebook](https://www.facebook.com/sailsjs)
- [Newsgroup](https://groups.google.com/forum/#!forum/sailsjs)

## Team
Sails is actively maintained with the help of many amazing [contributors](https://github.com/balderdashy/sails/graphs/contributors).  Our core team consists of:

[![Mike McNeil](https://www.gravatar.com/avatar/4b02a9d5780bdd282151f7f9b8a4d8de?s=144&d=identicon&rating=g)](http://twitter.com/mikermcneil) |  [![Cody Stoltman](https://1.gravatar.com/avatar/368567acca0c5dfb9a4ff512c5c0c3fa?s=144)](http://twitter.com/particlebanana) | [![Scott Gress](https://0.gravatar.com/avatar/b74e07aa543552709bf546ca279c9c67?s=144)](http://twitter.com/sgress454) | [![Irl Nathan](https://www.gravatar.com/avatar/d350bea2bf2e54ad59e6e241f70b7648?s=144&d=identicon&rating=g)](http://twitter.com/irlnathan) | [![Rachael Shaw](https://avatars0.githubusercontent.com/u/3065949?v=3&s=144)](http://twitter.com/fancydoilies)
:---:|:---:|:---:|:---:|:---:
[Mike McNeil](http://github.com/mikermcneil) | [Cody Stoltman](https://github.com/particlebanana) | [Scott Gress](https://github.com/sgress454) | [Irl Nathan](https://github.com/irlnathan) | [Rachael Shaw](https://github.com/rachaelshaw)

[Our company](https://sailsjs.com/about) designs/builds Node.js websites and apps for startups and enterprise customers. After building a few applications and taking them into production, we realized that the Node.js development landscape was very much still the Wild West. Over time, after trying lots of different methodologies, we decided to crystallize all of our best practices into this framework.  Six years later, Sails is now one of the most widely-used web application frameworks in the world. I hope it saves you some time! :)

## License

[MIT License](https://opensource.org/licenses/MIT)  Copyright © 2012-present, Mike McNeil

> Sails is built around so many great open-source technologies that it would never have crossed our minds to keep it proprietary.  We owe huge gratitude and props to Ryan Dahl ([@ry](https://github.com/ry)), TJ Holowaychuk ([@tj](https://github.com/tj)), Doug Wilson ([@dougwilson](https://github.com/dougwilson)) and Guillermo Rauch ([@rauchg](https://github.com/rauchg)) for the work they've done, as well as the stewards of all the other open-source modules we use.  Sails could never have been developed without your tremendous contributions to the JavaScript community.

![image_squidhome@2x.png](http://sailsjs.com/images/bkgd_squiddy.png)
