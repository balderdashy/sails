# Waterline

Waterline is a new kind of storage and retrieval engine.  It provides a uniform API for accessing stuff from different kinds of databases, protocols, and 3rd party APIs.  That means you write the same code to get users, whether they live in mySQL, LDAP, MongoDB, or Facebook.

Waterline also comes with built-in transaction support, as well as a configurable environment setting. 

> NOTE: Waterline is currently in unreleased alpha-- that means it's not production ready!  If you want to use waterline in a production app, please contribute.  Currentliy, the plan is for an open alpha release early next year (2013).  Thanks!

## Adapters currently supported
(* not yet complete)


### Datastores:
* Dirty (in memory and simple disk JSON store)
* mySQL*
* mongoDB*
* redis*
* cassandra*
* oracle*
* postgres*
* db2*
* mssql*

### Misc:
* HTTP ( client for api integrations and unit testing )*
* Socket.io / WebSockets ( client for api integrations and unit testing )*
* LDAP*
* Active Directory*
* Mandril (hosted email from MailChimp)*
* Facebook friends*
* Tweets*
* SMTP*
* IMAP*

## Writing adapters

It's easy to add your own adapters for integrating with proprietary systems or existing open APIs.  For most things, it's as easy as `require('some-module')` and mapping the appropriate methods to match waterline semantics.



[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/a22d3919de208c90c898986619efaa85 "githalytics.com")](http://githalytics.com/mikermcneil/waterline)