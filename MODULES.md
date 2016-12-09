# Modules

Sails is a large project, with many modular components.  Each module is located in its own repository, and in most cases is tested individually.

Below, you'll find an overview of the modules maintained by the core team and community members.


## Sails core

The modules comprising the Sails framework, as well as the other plugins maintained by our core team, are spread across a number of different code repositories.  Some modules can be used outside of the context of Sails, while others are not intended for external use.

#### Core modules

> For more information on the available releases of the Sails framework as a whole, check out the [contribution guide](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md).

| Repo          |  Build Status (edge)                 |  Latest Stable Release   |
|---------------|---------------------------------------|--------------------------|
| <a href="http://github.com/balderdashy/sails" target="_blank" title="Github repo for Sails core"><img src="http://sailsjs.org/images/logos/sails-logo_ltBg_dkBlue.png" width=60 alt="Sails.js logo (small)"/></a>     | [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=master)](https://travis-ci.org/balderdashy/sails)  | [![NPM version](https://badge.fury.io/js/sails.png)](http://badge.fury.io/js/sails) |
| [**waterline**](http://github.com/balderdashy/waterline) | [![Build Status](https://travis-ci.org/balderdashy/waterline.png?branch=master)](https://travis-ci.org/balderdashy/waterline) | [![NPM version](https://badge.fury.io/js/waterline.png)](http://badge.fury.io/js/waterline) |
| [**anchor**](http://github.com/sailsjs/anchor) | [![Build Status](https://travis-ci.org/sailsjs/anchor.png?branch=master)](https://travis-ci.org/sailsjs/anchor) | [![NPM version](https://badge.fury.io/js/anchor.png)](http://badge.fury.io/js/anchor) |
| [**waterline-criteria**](http://github.com/balderdashy/waterline-criteria) | [![Build Status](https://travis-ci.org/balderdashy/waterline-criteria.png?branch=master)](https://travis-ci.org/balderdashy/waterline-criteria) | [![NPM version](https://badge.fury.io/js/waterline-criteria.png)](http://badge.fury.io/js/waterline-criteria) |
| [**waterline-schema**](http://github.com/balderdashy/waterline-schema) | [![Build Status](https://travis-ci.org/balderdashy/waterline-schema.svg?branch=master)](https://travis-ci.org/balderdashy/waterline-schema) | [![NPM version](https://badge.fury.io/js/waterline-schema.png)](http://badge.fury.io/js/waterline-schema) |
| [**waterline-utils**](http://github.com/treelinehq/waterline-utils) | [![NPM version](https://badge.fury.io/js/waterline-utils.png)](http://badge.fury.io/js/waterline-utils) |
| [**sails-generate**](http://github.com/balderdashy/sails-generate) | [![Build Status](https://travis-ci.org/balderdashy/sails-generate.png?branch=master)](https://travis-ci.org/balderdashy/sails-generate) | [![NPM version](https://badge.fury.io/js/sails-generate.png)](http://badge.fury.io/js/sails-generate) |
| [**captains-log**](http://github.com/balderdashy/captains-log) | [![Build Status](https://travis-ci.org/balderdashy/captains-log.png?branch=master)](https://travis-ci.org/balderdashy/captains-log) | [![NPM version](https://badge.fury.io/js/captains-log.png)](http://badge.fury.io/js/captains-log) |


#### Core framework utilities

| Repo       |  Latest Stable Release   |
|------------|--------------------------|
| [**include-all**](http://github.com/balderdashy/include-all) | [![NPM version](https://badge.fury.io/js/include-all.png)](http://badge.fury.io/js/include-all) |
| [**reportback**](http://github.com/balderdashy/reportback) | [![NPM version](https://badge.fury.io/js/reportback.png)](http://badge.fury.io/js/reportback) |
| [**switchback**](http://github.com/balderdashy/switchback) | [![NPM version](https://badge.fury.io/js/node-switchback.png)](http://badge.fury.io/js/switchback) |


#### Core generators

_As of Sails v1.0, core generators are now bundled in [sails-generate](https://github.com/balderdashy/sails-generate).  All generators can still be overridden the same way.  For examples, see below._


#### Core hooks

| Hook           | Package       |  Latest Stable Release           | Build Status (edge)             | Purpose                  |
|:---------------|---------------|----------------------------------|---------------------------------|:---------------|
| `grunt`        | [sails-hook-grunt](https://npmjs.com/package/sails-hook-grunt)  | [![NPM version](https://badge.fury.io/js/node-sails-hook-grunt.png)](http://badge.fury.io/js/sails-hook-grunt) | [![Build Status](https://travis-ci.org/balderdashy/sails-hook-grunt.png?branch=master)](https://travis-ci.org/balderdashy/sails-hook-grunt)  | Implements support for the built-in Grunt asset pipeline in Sails.  |
| `orm`          | [sails-hook-orm](https://npmjs.com/package/sails-hook-orm)  | [![NPM version](https://badge.fury.io/js/node-sails-hook-orm.png)](http://badge.fury.io/js/sails-hook-orm) | [![Build Status](https://travis-
ci.org/balderdashy/sails-hook-orm.png?branch=master)](https://travis-ci.org/balderdashy/sails-hook-orm)  | Implements support for Waterline ORM in Sails.  |
| `sockets`      | [sails-hook-sockets](https://npmjs.com/package/sails-hook-sockets)  | [![NPM version](https://badge.fury.io/js/node-sails-hook-sockets.png)](http://badge.fury.io/js/sails-hook-sockets) | [![Build Status](https://travis-ci.org/balderdashy/sails-hook-sockets.png?branch=master)](https://travis-ci.org/balderdashy/sails-hook-sockets)  | Implements Socket.io support in Sails.  |

> Other core hooks not listed above are currently contained in sub-folders within Sails core.  See [`lib/hooks/`](https://github.com/balderdashy/sails/tree/master/lib/hooks).



#### Core database adapters

| Package                                                          |  Latest Stable Release                                                                                       | Build Status (edge)                                                                                                                           | Platform                                                          |
|:-----------------------------------------------------------------| ----------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------|
| [Local Disk](https://npmjs.com/package/sails-disk)               | [![NPM version](https://badge.fury.io/js/sails-disk.png)](http://badge.fury.io/js/sails-disk)                | [![Build Status](https://travis-ci.org/balderdashy/sails-disk.png?branch=master)](https://travis-ci.org/balderdashy/sails-disk)               | Local disk (`.tmp/`)                                              |
| [MySQL](https://npmjs.com/package/sails-mysql)                   | [![NPM version](https://badge.fury.io/js/sails-mysql.png)](http://badge.fury.io/js/sails-mysql)              | [![Build Status](https://travis-ci.org/balderdashy/sails-mysql.png?branch=master)](https://travis-ci.org/balderdashy/sails-mysql)             | [MySQL](http://dev.mysql.com/)                                    |
| [PostgreSQL](https://npmjs.com/package/sails-postgresql)         | [![NPM version](https://badge.fury.io/js/sails-postgresql.png)](http://badge.fury.io/js/sails-postgresql)    | [![Build Status](https://travis-ci.org/balderdashy/sails-postgresql.png?branch=master)](https://travis-ci.org/balderdashy/sails-postgresql)   | [PostgreSQL](https://www.postgresql.org/)                         |
| [Mongo](https://npmjs.com/package/sails-mongo)                   | [![NPM version](https://badge.fury.io/js/sails-mongo.png)](http://badge.fury.io/js/sails-mongo)              | [![Build Status](https://travis-ci.org/balderdashy/sails-mongo.png?branch=master)](https://travis-ci.org/balderdashy/sails-mongo)             | [MongoDB](https://www.mongodb.com/)                               |
| [Redis](https://npmjs.com/package/sails-redis)                   | [![NPM version](https://badge.fury.io/js/sails-redis.png)](http://badge.fury.io/js/sails-redis)              | [![Build Status](https://travis-ci.org/balderdashy/sails-redis.png?branch=master)](https://travis-ci.org/balderdashy/sails-redis)             | [Redis](http://redis.io)                                          |


#### Core socket client SDKs

| Platform     | Package             |  Latest Stable Release           | Build Status (edge)          |
|--------------|---------------------|----------------------------------|------------------------------|
| Browser      | [sails.io.js-dist](https://npmjs.com/package/sails.io.js-dist)  | [![NPM version](https://badge.fury.io/js/sails.io.js-dist.png)](http://badge.fury.io/js/sails.io.js-dist) | [![Build Status](https://travis-ci.org/balderdashy/sails.io.js.png?branch=master)](https://travis-ci.org/balderdashy/sails.io.js)  |
| Node.js      | [sails.io.js](https://npmjs.com/package/sails.io.js)  | [![NPM version](https://badge.fury.io/js/sails.io.js.png)](http://badge.fury.io/js/sails.io.js) | [![Build Status](https://travis-ci.org/balderdashy/sails.io.js.png?branch=master)](https://travis-ci.org/balderdashy/sails.io.js)  |







## Official Documentation

The official documentation for the Sails framework is written in Markdown, and is automatically compiled for the [Sails website](http://sailsjs.org).

| Repo       | Purpose                           |
|------------|:----------------------------------|
| [sails-docs](https://github.com/balderdashy/sails-docs)  | Raw content for reference, conceptual, anatomical, and other documentation on the Sails website (in Markdown).
| [www.sailsjs.org](https://github.com/balderdashy/www.sailsjs.org) | The Sails app that powers [sailsjs.org](http://sailsjs.org).  HTML content is automatically compiled from [`sails-docs`](https://github.com/balderdashy/sails-docs).
| [doc-templater](https://github.com/uncletammy/doc-templater) | The module we use to pre-process, compile, and format Markdown documentation files into the HTML markup and tree menus at [`sailsjs.org/documentation`](http://sailsjs.org/documentation).






## Community projects

In addition to the official code repositories that are supported by the Sails.js core team, there are countless other plugins created by members of the Sails.js community.


#### Hooks

There are at least 200 community hooks for Sails.js [available on NPM](https://www.npmjs.com/search?q=sails+hook).

> [Learn about custom hooks in Sails](http://sailsjs.org/documentation/concepts/extending-sails/hooks).


#### Asset pipeline

Need to customize your build?  Want automatically-generated spritesheets?  Source maps?  Sails.js uses Grunt for its asset pipeline, which means it supports any Grunt plugin. out of the box.  There are thousands of Grunt plugins [available on NPM](http://gruntjs.com/plugins).

> [Learn how to customize your app's asset pipeline](http://sailsjs.org/documentation/concepts/assets).



#### Generators

Don't like Grunt?  Want to use WebPack or Gulp instead?  Prefer your generated backend files to be written in CoffeeScript?  There are at least 100 community generators for Sails.js [available on NPM](https://www.npmjs.com/search?q=sails%20generate).

> [Learn how to use community generators, and how to build your own](http://sailsjs.org/documentation/concepts/extending-sails/generators).

<!-- Looking for the list that used to be here?  See https://github.com/balderdashy/sails-docs/blob/master/concepts/extending-sails/Generators/generatorList.md -->


#### Database adapters

Is your database not supported by one of the core adapters?  Good news!  There are many different community database adapters for Sails.js and Waterline [available on NPM](https://www.npmjs.com/search?q=sails+adapter).

> [Learn how to install and configure community adapters](http://sailsjs.org/documentation/concepts/extending-sails/adapters).


<!--
Here are a few popular community adapters:

```
| Repo          |  Build Status (edge)  |  Latest Stable Release   | Platform |
|---------------|---------------------------------------|--------------------------|------------|
| [sails-orientdb](https://github.com/appscot/sails-orientdb) | [![Build Status](https://travis-ci.org/appscot/sails-orientdb.svg?branch=master)](https://travis-ci.org/appscot/sails-orientdb) | [![npm version](https://badge.fury.io/js/sails-orientdb.svg)](http://badge.fury.io/js/sails-orientdb) | OrientDB |
| [sails-rest](https://github.com/zohararad/sails-rest) |  |  | REST |
| [sails-oracle](https://github.com/mayconheerdt/sails-oracle) | | | Oracle |
| [sails-mssql](https://github.com/swelham/sails-mssql) | | | MSSQL (for sails@<=0.9.x) |
| [sails-sqlserver](https://github.com/cnect/sails-sqlserver) | | | SQL Server |
| [sails-neo4j](https://github.com/natgeo/sails-neo4j) | | | Neo4j |
| [sails-sqlite3](https://github.com/AndrewJo/sails-sqlite3) | | | SQLite3 |
| [sails-dynamodb](https://github.com/dohzoh/sails-dynamodb) | | | DynamoDB |
| [sails-elasticsearch](https://github.com/DarthHater/sails-elasticsearch) | | | Elasticsearch |
| [sails-couchdb](https://github.com/shmakes/sails-couchdb) | | | CouchDB |
| [sails-couchbase](https://github.com/CaseyJones-/sails-couchbase) | | | Couchbase |
| [sails-odata](https://github.com/TheSharpieOne/sails-odata) | | | OData |
| [sails-db2](https://github.com/IbuildingsItaly/sails-db2) | | | DB2 |
| [sails-rethinkdb](https://github.com/dsincl12/sails-rethinkdb) | | | RethinkDB |
| [sails-azuretables](https://github.com/azuqua/sails-azuretables) | | | Windows Azure Tables |
| [sails-riak](https://github.com/balderdashy/sails-riak) | | | Riak |
| [sails-nedb](https://github.com/balderdashy/sails-riak) | | | NeDB |
| [sails-parse](https://github.com/tskaggs/sails-parse) | | | Parse |
| [sails-tingo](https://github.com/andyhu/sails-tingo) | | | TingoDB |
```

-->


#### Filesystem adapters

Need to upload files to a cloud file store like S3, GridFS, or Azure Cloud Files?  Check out the community filesystem adapters for Sails.js and Skipper [available on NPM](https://www.npmjs.com/search?q=skipper+adapter).

> [Learn how to wire up one or more custom filesystem adapters for your application](https://github.com/balderdashy/skipper#use-cases).



#### 3rd party integrations

Need to process payments with Stripe?  Fetch video metadata from YouTube?  Process user email data via Google APIs?  Choose from hundreds of community machinepacks for Sails.js/Node [available on NPM](http://node-machine.org/machinepacks).

> [Learn how to install and use machinepacks in your controller actions and helpers.](http://node-machine.org/)


#### Database drivers

Want to work with your database at a low level?  Need to get extra performance out of your database queries?  Dynamic database connections?

> [Learn about Waterline drivers](https://github.com/node-machine/driver-interface).


#### View engines

Is EJS bumming you out?  Prefer to use a different templating language like pug (/jade), handlebars, or dust?  Sails.js supports almost any Consolidate/Express-compatible view engine-- meaning you can use just about any imaginable markup language for your Sails.js views.  Check out the community view engines for Sails.js and Express [available on NPM](http://sailsjs.org/documentation/concepts/views/view-engines).

> [Learn how to set up a custom view engine for your app](http://sailsjs.org/documentation/reference/configuration/sails-config-views).


#### Session stores

The recommended production session store for Sails.js is Redis... but we realize that, for some apps, that isn't an option.  Fortunately, Sails.js supports almost any Connect/Express-compatible session store-- meaning you can store your sessions almost anywhere, whether that's Mongo, on the local fileystem, or even in a relational database.  Check out the community session stores for Sails.js, Express, and Connect [available on NPM](https://www.npmjs.com/search?q=connect%20session-).

> [Learn how to install and configure a custom session store in your Sails app](http://sailsjs.org/documentation/reference/configuration/sails-config-session#?production-config).



#### Socket client SDKs & examples

| Platform     | Repo       |  Build Status (edge)             |
|--------------|------------|----------------------------------|
| iOS          | [sails.ios](https://github.com/ChrisChares/sails.ios)  | [![CI Status](http://img.shields.io/travis/ChrisChares/sails.ios.svg?style=flat)](https://travis-ci.org/ChrisChares/sails.ios) |
| Android      | [Sails Messenger](https://github.com/TheFinestArtist/Sails-Messenger)  | _N/A_  |
| Angular      | [angularSails](https://github.com/balderdashy/angularSails)  | [![Build Status](https://travis-ci.org/balderdashy/angularSails.png?branch=master)](https://travis-ci.org/balderdashy/angularSails) |
| Objective C  | [sails.io.objective-c](https://github.com/fishrod-interactive/sails-io.objective-c) | _N/A_ |
| Backbone     | [backbone-to-sails](https://github.com/balderdashy/backbone-to-sails)  | _N/A_ |


#### Misc. projects

| Repo                          |
|-------------------------------|
| [sails-migrations](https://github.com/BlueHotDog/sails-migrations) |
| [sails-mysql-transactions](https://github.com/postmanlabs/sails-mysql-transactions) |



## FAQ

#### What happened to the core generators?

For easier maintainence, they were pulled into [`sails-generate`](https://github.com/balderdashy/sails-generate).
