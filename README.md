# Waterline

Waterline is a brand new kind of storage and retrieval engine.  

It provides a uniform API for accessing stuff from different kinds of databases, protocols, and 3rd party APIs.  That means you write the same code to get users, whether they live in mySQL, LDAP, MongoDB, or Facebook.

At the same time, Waterline aims to learn lessons and maintain the best features from  both Rails' ActiveRecord and Grails' Hibernate ORMs.
Waterline also comes with built-in transaction support, as well as a configurable migration schemes. 

> NOTE: Waterline is currently in unreleased alpha-- that means it's not production ready!  If you want to use waterline in a production app, awesome!  Currentliy, the plan is for an open alpha release early next year (2013).  Thanks!

## Adapters currently supported

* Dirty (in memory and simple disk JSON store)
* mySQL

## In development
* mongoDB (Feb)
* redis (March)
* OpenStack (Feb)
* Amazon S3 (Feb)


## Roadmap

### SQL Datastores
* postgres
* oracle
* db2
* mssql

### NoSQL Datastores
* Cassandra
* Neo4J
* CouchDB

### Misc
* LDAP
* Active Directory
* 
* 

## Writing adapters

It's easy to add your own adapters for integrating with proprietary systems or existing open APIs.  For most things, it's as easy as `require('some-module')` and mapping the appropriate methods to match waterline semantics.



[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/a22d3919de208c90c898986619efaa85 "githalytics.com")](http://githalytics.com/mikermcneil/waterline)
