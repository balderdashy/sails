![sails.jpg](http://i.imgur.com/o0Qsp.jpg) 

# Sails
Sails makes it easy to build custom, enterprise-grade Node.js apps. It is designed to resemble the MVC architecture from frameworks like Ruby on Rails, but with support for the more modern, data-oriented style of web app development.  It's especially good for building realtime features like chat.

### Philosophy
Like other MVC frameworks, Sails espouses a same convention-over-configuration philosophy and emphasis on developer happiness, but takes it a step further. Like Node.js, using Sails means your app is written entirely in JavaScript, the language you or your team is already using to build the frontend portion of your web or mobile web app.  This cuts development to a fraction of the time. 
We've used Sails to build production-ready, realtime apps in a matter of weeks.  In the past, that would have taken us months!

### Performance
Meanwhile, since Sails is written in Node.js, your servers reap the performance benefits of an event-driven, asynchronous architecture. (http://venturebeat.com/2011/08/16/linkedin-node/)

### Standing on the shoulders of giants
Sails is built on the rock-solid foundation of Express (routing), EJS (templating) and Socket.io (cross-platform WebSockets), you don't have to worry about reinventing the wheel.

## What else?
Excited?  Us too!  
Sails does a few things other Node.js MVC frameworks can't do:
- Automatically generated JSON API for manipulating models means you don't have to write any backend code to build simple database apps
- Built-in authentication, role-based access control, and customizable policies assignable at the controller/action level
- Transport agnostic routing: Sails controllers also handle Socket.io / WebSocket messages!  This makes it much easier to send the server-originated or 'comet' notifications you need for features like chat, realtime analytics, and multiplayer games.
- Automatic asset minification with Rigging: Your UI code is automatically included in development mode, and minified into a simple, gzipped file in production.
  - Support for:
    - CoffeeScript
    - LESS
    - SASS / SCSS



Installation
--
```npm install sails```

Or to install with the command line tool:
```sudo npm install -g sails```

Getting Started
--
If you installed Sails with the command line tool above, the following command will generate a new Sails project, ```nameOfNewApp/```, in the current directory:

```sails nameOfNewApp```

Then run the app:
```
cd nameOfNewApp
node app.js
```

Example
--
#### Live demo
*Try it in two browser windows*

http://sailsjs.com:1337/experiment

#### Code
https://github.com/balderdashy/sails-example

Dependencies and Compatibility
--

Tested with node 0.8.1

We built Sails on the rock-solid foundations of ExpressJS, Sequelize ORM, and Socket.io.  


## Who Built This?
The Sails framework is jointly developed and supported by Mike McNeil and Balderdash Design Co.  Balderdash builds realtime web apps as a service, and after much frustration with the lack of convention in existing solutions, we built Sails to use on our customers' projects.  Naturally, we open-sourced it.  Hopefully, it makes your life a little bit easier!


The MIT License (MIT)
--

Copyright © 2012 Mike McNeil

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.