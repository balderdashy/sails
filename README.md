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
Sails is built on the rock-solid foundations of ExpressJS and Socket.io.  


## Who Built This?

The Sails framework was developed by Mike McNeil (@mikermcneil) and is maintained by Balderdash (@balderdashy), a realtime web & mobile studio I started with Heather White (@hdesignsit) in Austin, TX.

After building a few realtime javascript apps and taking them into production, we realized that the  JavaScript development landscape is very much still the Wild West.  Over time, after trying lots of different methodologies (on the front end and the back), we decided to crystallize all of our best practices into this framework.  I hope it saves you some time :)


License
--

Sails is built around so many great open-source technologies that it would never have crossed our minds to keep it proprietary.  We owe huge gratitude and props to TJ Holowaychuk (@visionmedia) and Guillermo Rauch (@guille) for the work they did, as well as the stewards of all the other open-source modules we use.  Sails could never have been developed without your tremendous contributions to the node community.

The MIT License (MIT)
--

Copyright © 2012-2013 Mike McNeil

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/8acf2fc2ca0aca8a3018e355ad776ed7 "githalytics.com")](http://githalytics.com/balderdashy/sails)
