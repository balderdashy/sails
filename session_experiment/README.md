# Session Experiment

Testing Redis-hosted cohabitation of IPC and session storage.  The trouble right now is that the Redis session store reference is attached to the socket, and then the socket is naively serialized by Redis when persisted to the IPC store.  This is bad news bears because it's a recursive object, and Redis will try to stringify it, bringing down the server.

The hypothesis is that we can use just the session id instead (which is already in the socket).  The trouble is that connect expects a reference to the session store in its req object.

This experiment is an attempt to reconcile this, then merge the findings back into Sails.

I welcome your help!

-Mike