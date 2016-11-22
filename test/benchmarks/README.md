# Benchmarks

### Run the benchmarks

From the root directory of sails:

```sh
$ BENCHMARK=true mocha test/benchmarks
```

To get a more detailed report with millisecond timings for each benchmark, run:

```sh
$ BENCHMARK=true mocha test/benchmarks -v
```


### Goals

These tests are related to benchmarking the performance of different parts of Sails.  For now, our benchmark tests should be "integration" or "acceptance" tests.  By that, I mean they should measure a specific "user action" (e.g. running `sails new`, running `sails lift`, sending an HTTP request to a dummy endpoint, connecting a Socket.io client, etc.).



##### Why test features first, and not each individual method?

Feature-wide benchmarks are the "lowest-hanging fruit", if you will.  We'll spend much less development time, and still get valuable benchmarks that will give us ongoing data on Sails performance.  This way, we'll know where to start writing lower-level benchmarks to identify choke-points.


##### Writing good benchmarks
+ Pick what you want to test.
+ Whatever you choose does not have to be atomic (see examples above)-- in an ideal world, we would have benchmarks for every single function in our apps, but that is not how things work today.
+ Write a benchmark test that isolates that functionality. (the hard part)
+ Then see how many milliseconds it takes. (easy)

> **Advice from Felix Geisendörfer ([@felixge](https://github.com/felixge))**
>
>  + First of all, keep in mind our problems are definitely not the same as Felix's, and we must remember to follow [his own advice](https://github.com/felixge/faster-than-c#taking-performance-advice-from-strangers): `[What]...does not work is taking performance advise (euro-sic) from strangers...`  That said, he's got some great ideas.
>  + [Benchmark-Driven Optimization](https://github.com/felixge/faster-than-c#benchmark-driven-development)
>  + I also highly recommend this [talk on optimization and benchmarking](http://2012.jsconf.eu/speaker/2012/09/05/faster-than-c-parsing-node-js-streams-.html) ([slides](https://github.com/felixge/faster-than-c)).


### Things to test

Here are the most important things we need to benchmark:

##### Features:

+ Bootstrap
  + `sails.load` (programmatic)
  + `sails.lift` (programmatic) and `sails lift` (CLI)
  + `sails load`
  + `sails new` and `sails generate *`
    + (could be pulled into generic generator suite, like adapters)

+ Router
  + private Sails requests via `sails.emit('request')`
  + http requests to the HTTP server
  + http file uploads to the HTTP server
  + connections to the socket.io server
  + socket emissions to the socket.io server
  + socket broadcasts FROM the socket.io server (pubsub hook)


> Thankfully, the ORM is already covered by the benchmarks in Waterline core and its generic adapter tests.


##### Measuring:

+ Execution time
+ Memory usage

##### Under varying levels of stress:

+ Low concurrency (c1k)
+ High-moderate concurrency (c10k)

##### In varying environments:

+ Every permutation of the core hook configuration
+ With different configuration options set


### Considerations

Some important things to consider when benchmarking Node.js / Express-based apps in general:

+ Keep in mind that, unless you use the cluster module, or spin up multiple instances of the server, you're testing performance on one CPU.  Most production servers, cloud or not, have more than one CPU available.  This may or may not be relevant, depending on the benchmark and whether it is CPU-intensive.
+ Be sure to configure [`maxSockets`](http://nodejs.org/api/http.html#http_agent_maxsockets), since most of the requests in a benchmark test are likely to originate from the same source.

> **Sources:**
> + https://groups.google.com/forum/#!topic/nodejs/tgATyqF-HIc



### Benchmarking libraries

> Don't know the best route here yet-- but here are some links for reference.  Would love to hear your ideas!

+ https://github.com/spumko/flod
+ https://github.com/LearnBoost/mongoose/blob/3.8.x/benchmarks/benchjs/casting.js
+ https://npmjs.org/package/benchmark

