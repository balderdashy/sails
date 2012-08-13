Sails
====

Tested with node 0.6.4 up to node 0.8.1



Sails is an MVC framework for Node.js.  It relies heavily on Express.JS for routing, Sequelize for ORM, and Socket.io for maintaining socket connections.

It does a few things other MVC frameworks can't do.

- Sails provides all the productivity benefits of Ruby on Rails, but with the realtime capabilities and asynchronous efficiency of Node.js, all in the same language you're already using, Javascript.
- Sails enabled RESTful routing of WebSocket messages in the same way as HTTP requests.  Controller actions are overidden to respond to Socket.io requests using Express semantics (res.send).  This allows for a consistent development interface for both kinds of requests, and allows you to coallesce your realtime and standard app logic into a single action.  
- Sails also contains built-in role-based access control and authentication middleware.  As it should, this works the same way for realtime socket messages as it does for HTTP requests.