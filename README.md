Sails
====

Sails is an MVC framework for Node.js.  It relies heavily on Express.JS for routing, Sequelize for ORM, and Socket.io for maintaining socket connections.

It does a few things other MVC frameworks can't do.  Namely:

- Sails gracefully handles WebSocket messages in the same way as HTTP requests, via the router.  Controller actions are overidden to respond to Socket.io requests using Express semantics (res.send).  This allows for a consistent development interface for both kinds of requests, and allows you to coallesce your realtime and standard app logic into a single action.  Sails also maintains precondition middleware (authentication, access control, pre-validation, etc.) and applies it to socket requests as well.

- Sails provides an easy API to access information about other users currently on the same page as you.  Besides maintaining a pubsub room for each view, Sails allows for easy manipulation of rooms via a simple API.