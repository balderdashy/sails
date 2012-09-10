Sails
====

Sails is designed to resemble Ruby on Rails with it's MVC (Model View Controller) architecture and convention over configuration philosophy. Like Node.JS, Sails.JS written in JavaScript, the language most developers are already using. Sails provides a familiar framework for custom apps which cuts development to a fraction of the time.

Sails does a few things other MVC frameworks can't do.

- Sails provides all the productivity benefits of Ruby on Rails, but with the realtime capabilities and asynchronous efficiency of Node.js, all in the same language you're already using, Javascript.
- Sails enabled RESTful routing of WebSocket messages in the same way as HTTP requests.  Controller actions are overidden to respond to Socket.io requests using Express semantics (res.send).  This allows for a consistent development interface for both kinds of requests, and allows you to coallesce your realtime and standard app logic into a single action.  
- Sails also contains built-in role-based access control and authentication middleware.  As it should, this works the same way for realtime socket messages as it does for HTTP requests.

In short, Sails makes for smooth sailing for building custom web applications.


Installation
--
```sudo npm install -g sails```

Getting Started
--
The following command will generate a new Sails project, ```nameOfNewApp/```, in the current directory:
```sails nameOfNewApp```

Dependencies and Compatibility
--

Tested with node 0.6.4 up to node 0.8.1

We built Sails on the rock-solid foundations of ExpressJS, Sequelize ORM, and Socket.io.  