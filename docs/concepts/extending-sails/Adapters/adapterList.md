# Available database adapters

This page is meant to be an up-to-date, comprehensive list of all of the core adapters available for the Sails.js framework, and a reference of a few of the most robust community adapters out there.

All supported adapters can be configured in roughly the same way: by passing in a Sails/Waterline adapter (`adapter`), as well as a connection URL (`url`).  For more information on configuring datastores, see [sails.config.datastores](https://sailsjs.com/documentation/reference/configuration/sails-config-datastores).

> Having trouble connecting?  Be sure to check your connection URL for typos.  If that doesn't work, review the documentation for your database provider, or [get help](https://sailsjs.com/support).

### Officially-supported database adapters

The following core adapters are maintained, tested, and used by the Sails.js core team.

> Want to help out with a core adapter?  Get started by reading [the Sails project contribution guide](https://sailsjs.com/contributing).

|  Database technology    | Adapter                                                        | Connection URL structure                      | For production?     |
|:------------------------|:---------------------------------------------------------------|:----------------------------------------------|:--------------------|
|  MySQL                  | [require('sails-mysql')](http://npmjs.com/package/sails-mysql)            | `mysql://user:password@host:port/database`      | Yes
|  PostgreSQL             | [require('sails-postgresql')](http://npmjs.com/package/sails-postgresql)  | `postgresql://user:password@host:port/database` | Yes
|  MongoDB                | [require('sails-mongo')](http://npmjs.com/package/sails-mongo)            | `mongodb://user:password@host:port/database`      | Yes
|  Local disk / memory           | _(built-in, see [sails-disk](http://npmjs.com/package/sails-disk))_          | _n/a_                                         | **No!**



### sails-mysql

[MySQL](http://en.wikipedia.org/wiki/MySQL) is the world's most popular relational database.


[![NPM package info for sails-mysql](https://img.shields.io/npm/dm/sails-mysql.svg?style=plastic)](http://npmjs.com/package/sails-mysql) &nbsp; [![License info](https://img.shields.io/npm/l/sails-mysql.svg?style=plastic)](http://npmjs.com/package/sails-mysql)

```bash
npm install sails-mysql --save
```

```javascript
adapter: 'sails-mysql',
url: 'mysql://user:password@host:port/database',
```

> + The default port for MySQL is `3306`.
> + If you plan on saving special characters&mdash;like emojis&mdash;in your data, you may need to set the [`charset`](https://dev.mysql.com/doc/refman/5.7/en/charset-charsets.html) configuration option for your datastore.  To allow emojis, use `charset: 'utf8mb4'`.  You may use the [`columnType` setting](https://sailsjs.com/documentation/concepts/models-and-orm/attributes#?columntype) in a model attribute to set the character set.
> + For relational database servers like MySQL and PostgreSQL, you may have to create a "database" first using a free tool like [SequelPro](https://www.sequelpro.com/) or in the MySQL REPL on the command-line (if you're an experience SQL user). It's customary to make a database specifically for your app to use.
> + The sails-mysql adapter is also 100% compatible with [Amazon Aurora](https://aws.amazon.com/rds/aurora/) databases.

##### Handshake inactivity timeout errors
If you find yourself encountering a "Handshake inactivity timeout" error when your Sails app interacts with MySQL, you can increase the timeout using the `connectTimeout` option.  This is [usually only necessary](https://github.com/mysqljs/mysql/issues/1434) when queries are running side-by-side with computationally expensive operations (for example, compiling client-side typescript files or running webpack during development).

For example, you might extend the timeout to 20 seconds:

```javascript
adapter: 'sails-mysql',
url: 'mysql://user:password@host:port/database',
connectTimeout: 20000
```


### sails-postgresql

[PostgreSQL](http://en.wikipedia.org/wiki/postgresql) is a modern relational database with powerful features.

[![NPM package info for sails-postgresql](https://img.shields.io/npm/dm/sails-postgresql.svg?style=plastic)](http://npmjs.com/package/sails-postgresql) &nbsp; [![License info](https://img.shields.io/npm/l/sails-postgresql.svg?style=plastic)](http://npmjs.com/package/sails-postgresql)

```bash
npm install sails-postgresql --save
```

```javascript
adapter: 'sails-postgresql',
url: 'postgresql://user:password@host:port/database',
```

> + The default port for PostgreSQL is `5432`.
> + In addition to `adapter` and `url`, you might also need to set `ssl: true`.  This depends on where your PostgreSQL database server is hosted.  For example, `ssl: true` is required when connecting to Heroku's hosted PostgreSQL service.
> + Note that in `pg` version 8.0, the syntax was updated to `ssl: { rejectUnauthorized: false }`.
> + Compatible with most versions of Postgres. See [this issue](https://github.com/balderdashy/sails/issues/6957) to learn more about compatability with Postgres >12

### sails-mongo

[MongoDB](http://en.wikipedia.org/wiki/MongoDB) is the leading NoSQL database.

[![NPM package info for sails-mongo](https://img.shields.io/npm/dm/sails-mongo.svg?style=plastic)](http://npmjs.com/package/sails-mongo) &nbsp; [![License info](https://img.shields.io/npm/l/sails-mongo.svg?style=plastic)](http://npmjs.com/package/sails-mongo)

```bash
npm install sails-mongo --save
```

```javascript
adapter: 'sails-mongo',
url: 'mongodb://user:password@host:port/database',
```

> + The default port for MongoDB is `27017`.
> + If your Mongo deployment keeps track of its internal credentials in a separate database, then you may need to name that database by tacking on [`?authSource=theotherdb`](https://stackoverflow.com/a/40608735/486547) to the end of the connection URL.
> + Other [Mongo configuration settings](https://github.com/balderdashy/sails-mongo/blob/master/lib/private/constants/config-whitelist.constant.js) provided via querystring in the connection URL are passed through to the underlying Mongo driver.



### sails-disk

Write to your computer's hard disk, or a mounted network drive.  Not suitable for at-scale production deployments, but great for a small project, and essential for developing in environments where you may not always have a database set up.  This adapter is bundled with Sails and works out of the box with zero configuration.

You can also operate `sails-disk` in _memory-only mode_.  See the settings table below for details.

[![NPM package info for sails-disk](https://img.shields.io/npm/dm/sails-disk.svg?style=plastic)](http://npmjs.com/package/sails-disk) &nbsp; [![License info](https://img.shields.io/npm/l/sails-disk.svg?style=plastic)](http://npmjs.com/package/sails-disk)

_Available out of the box in every Sails app._

_Configured as the default database, by default._

##### Optional datastore settings for `sails-disk`

| Setting | Description | Type  | Default |
|:--------|:------------|:------|:--------|
| `dir`   | The directory to place database files in.  The adapter creates one file per model. | ((string)) | `.tmp/localDiskDb` |
| `inMemoryOnly` | If `true`, no database files will be written to disk.  Instead, all data will be stored in memory (and will be lost when the app stops running). | ((boolean)) | `false` |

> + You can configure the default `sails-disk` adapter by adding settings to the `default` datastore in `config/datastores.js`.


### Community-supported database adapters

Is your database not supported by one of the core adapters?  Good news!  There are many different community database adapters for Sails.js and Waterline [available on NPM](https://www.npmjs.com/search?q=sails+adapter).

Here are a few highlights:


| Database technology             | Adapter                | Maintainer | Interfaces implemented | Stable release |
|:--------------------------------|:-----------------------|:-----------|:-----------------------|-----------------------|
| **Redis**                       | [sails-redis](https://npmjs.com/package/sails-redis) | [Ryan Clough / Solnet Solutions](https://github.com/Ryanc1256) | Semantic, Queryable                                               | [![NPM package info for sails-redis](https://img.shields.io/npm/dm/sails-redis.svg?style=plastic)](http://npmjs.com/package/sails-redis) |
| **MS SQL Server**               | [sails-MSSQLserver](https://github.com/misterGF/sails-mssqlserver) | [misterGF](https://github.com/misterGF) | Semantic, Queryable                  | [![NPM package info for sails-sqlserver](https://img.shields.io/npm/dm/sails-sqlserver.svg?style=plastic)](http://npmjs.com/package/sails-sqlserver)
| **OrientDB**                    | [sails-orientDB](https://github.com/appscot/sails-orientdb) | [appscot](https://github.com/appscot) | Semantic, Queryable, Associations, Migratable | [![NPM package info for sails-orientdb](https://img.shields.io/npm/dm/sails-orientdb.svg?style=plastic)](http://npmjs.com/package/sails-orientdb)
| **Oracle**                      | [sails-oracleDB](https://npmjs.com/package/sails-oracledb) | [atiertant](https://github.com/atiertant) | Semantic, Queryable | [![NPM package info for sails-oracledb](https://img.shields.io/npm/dm/sails-oracledb.svg?style=plastic)](http://npmjs.com/package/sails-oracledb) |
| **Oracle (AnyPresence)**        | [waterline-oracle-adapter](https://github.com/AnyPresence/waterline-oracle-adapter) | [AnyPresence](https://github.com/AnyPresence) | Semantic, Queryable     | [![Release info for AnyPresence/waterline-oracle-adapter](https://img.shields.io/github/tag/AnyPresence/waterline-oracle-adapter.svg?style=plastic)](https://github.com/AnyPresence/waterline-oracle-adapter)
| **Oracle (stored procedures)**  | [sails-oracle-SP](https://npmjs.com/sails-oracle-sp) | [Buto](http://github.com/buto) and [nethoncho](http://github.com/nethoncho) | Semantic, Queryable     | [![NPM package info for sails-oracle-sp](https://img.shields.io/npm/dm/sails-oracle-sp.svg?style=plastic)](http://npmjs.com/package/sails-oracle-sp)
| **SAP HANA DB**                 | [sails-HANA](https://npmjs.com/sails-hana) | [Enrico Battistella](https://github.com/battistaar) | Semantic, Queryable     | [![NPM package info for sails-hana](https://img.shields.io/npm/dm/sails-hana.svg?style=plastic)](http://npmjs.com/package/sails-hana)
| **SAP HANA (AnyPresence)**      | [waterline-SAP-HANA-adapter](https://github.com/AnyPresence/waterline-sap-hana-adapter) | [AnyPresence](https://github.com/AnyPresence) | Semantic, Queryable     | [![Release info for AnyPresence/waterline-sap-hana-adapter](https://img.shields.io/github/tag/AnyPresence/waterline-sap-hana-adapter.svg?style=plastic)](https://github.com/AnyPresence/waterline-sap-hana-adapter)
| **IBM DB2**                     | [sails-DB2](https://npmjs.com/sails-db2) | [ibuildings Italia](https://github.com/IbuildingsItaly) &amp; [Vincenzo Ferrari](https://github.com/wilk) | Semantic, Queryable     | [![NPM package info for sails-db2](https://img.shields.io/npm/dm/sails-db2.svg?style=plastic)](http://npmjs.com/package/sails-db2)
| **ServiceNow SOAP**             | [waterline-ServiceNow-SOAP](https://npmjs.com/waterline-servicenow-soap) | [Sungard Availability Services](http://www.sungardas.com/) | Semantic, Queryable     | [![NPM package info for waterline-servicenow-soap](https://img.shields.io/npm/dm/waterline-servicenow-soap.svg?style=plastic)](http://npmjs.com/package/waterline-servicenow-soap)
| **Cassandra**                   | [sails-cassandra](https://github.com/dtoubelis/sails-cassandra) | [dtoubelis](https://github.com/dtoubelis) | Semantic, Migratable, Iterable | [![NPM package info for sails-cassandra](https://img.shields.io/npm/dm/sails-cassandra.svg?style=plastic)](http://npmjs.com/package/sails-cassandra)
| **Solr**                        | [sails-solr](https://github.com/sajov/sails-solr) | [sajov](https://github.com/sajov) | Semantic, Migratable, Queryable | [![NPM package info for sails-solr](https://img.shields.io/npm/dm/sails-solr.svg?style=plastic)](http://npmjs.com/package/sails-solr)
| **FileMaker Database**          | [sails-FileMaker](https://github.com/geistinteractive/sails-filemaker) | [Geist Interactive](https://www.geistinteractive.com/) | Semantic | [![NPM package info for sails-filemaker](https://img.shields.io/npm/dm/sails-filemaker.svg?style=plastic)](http://npmjs.com/package/sails-filemaker)
| **Apache Derby**                | [sails-derby](https://github.com/dash-/node-sails-derby) | [dash-](https://github.com/dash-) | Semantic, Queryable, Associations, SQL | [![NPM package info for sails-derby](https://img.shields.io/npm/dm/sails-derby.svg?style=plastic)](http://npmjs.com/package/sails-derby)
| **REST API (Generic)**          | [sails-REST](https://github.com/zohararad/sails-rest) | [zohararad](https://github.com/zohararad) | Semantic                                        | [![NPM package info for sails-rest](https://img.shields.io/npm/dm/sails-rest.svg?style=plastic)](http://npmjs.com/package/sails-rest)



##### Add your custom adapter to this list

If you see out of date information on this page, or if you want to add an adapter you made, please submit a pull request to this file updating the table of community adapters above.

Note that, to be listed on this page, an adapter must:

1. Be free and open source (_libre_ and _gratis_), preferably under the MIT license.
2. Pass all of the Waterline adapter tests for the interface layers declared in its package.json file.
3. Support configuration via a connection URL, as `url` (if applicable).


If you find that any of these conventions are not true for any of the community adapters above (i.e. for latest stable release published on NPM, not for the code on GitHub), then please reach out to the maintainer of the adapter.  If you can't reach them or need further assistance, then please [get in touch](https://sailsjs.com/contact) with a member of the Sails core team.



<docmeta name="displayName" value="Available adapters">
