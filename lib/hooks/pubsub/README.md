# Pubsub (core hook)



## Events


#### `debug`
Firehose of all app events- only emitted in development (i.e. `sails.config.environment === development`)

###### Client

```javascript
socket.on('debug', function (msg) { .. });
```

###### Server
```javascript
// Any of the pubsub methods..
User.publishUpdate()
sails.sockets.emit()
```

#### Model identity

###### Client

```javascript
socket.on('user', function (msg) { .. });
```



#### `message`
Firehose of all app events.

> Was standard in 0.8.x and 0.9.x.
> In 0.10.x, this is now `debug`.
