![image_squidhome@2x.png](http://i.imgur.com/7rMxw.png) 

# Waterline

Waterline is a brand new kind of storage and retrieval engine.  

It provides a uniform API for accessing stuff from different kinds of databases, protocols, and 3rd party APIs.  That means you write the same code to get users, whether they live in mySQL, LDAP, MongoDB, or Facebook.

At the same time, Waterline aims to learn lessons and maintain the best features from  both Rails' ActiveRecord and Grails' Hibernate ORMs.
Waterline also comes with built-in transaction support which takes advantage of any API the datstore you're using offers, but falls back to maintaining a separate atomic commit log (i.e. the same way Mongo does transactions).


## Adapters currently supported

* Dirty (in memory and simple disk JSON store)
* mySQL

## In development
* mongoDB (Jan)
* redis (March)


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
