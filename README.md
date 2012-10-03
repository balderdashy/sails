Sails
====

Sails is designed to resemble Ruby on Rails with it's MVC (Model View Controller) architecture and convention over configuration philosophy. Like Node.JS, Sails.JS written in JavaScript, the language most developers are already using. Sails provides a familiar framework for custom apps which cuts development to a fraction of the time.

Sails does a few things other MVC frameworks can't do.

- Sails provides all the productivity benefits of Ruby on Rails, but with the realtime capabilities and asynchronous efficiency of Node.js, all in the same language you're already using, Javascript.
- Sails enabled RESTful routing of WebSocket messages in the same way as HTTP requests.  Controller actions are overidden to respond to Socket.io requests using Express semantics (res.send).  This allows for a consistent development interface for both kinds of requests, and allows you to coallesce your realtime and standard app logic into a single action.  
- Sails also contains built-in role-based access control and authentication middleware.  As it should, this works the same way for realtime socket messages as it does for HTTP requests. (See https://github.com/balderdashy/sails-example)

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


Example
--
https://github.com/balderdashy/sails-example


## Who Built This?
The Sails framework is jointly developed and supported by Mike McNeil and Balderdash Design Co.  Balderdashs build wonderful web apps as a service, and after much frustration, we built Sails to use on our customers' projects.  Naturally, we open-sourced it.  Hopefully, it makes your life a little bit easier!


The MIT License (MIT)
--

Copyright © 2012 Mike McNeil

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.