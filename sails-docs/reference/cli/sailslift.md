# `sails lift`


Run the Sails app in the current dir (if `node_modules/sails` exists, it will be used instead of the globally installed Sails).

```usage
sails lift
```

By default, Sails lifts your app in development mode.  In the development environment, Sails uses [Grunt](https://gruntjs.com/) to keep an eye on your files in `/assets`. If you change something (for example in one of your `.css` or `.less` files) and reload your browser, you'll notice that your changes are reflected automatically.

Also note that, in development mode, your view templates won't be cached in memory.  So, like assets, you can also change your view files without restarting Sails.

> Any changes to back-end logic or configuration (e.g. the files in `config/`, `api/`, or `node_modules/`) _will not take effect_ unless you kill and restart the server (CTRL+C  + `sails lift`).

### Usage:

`sails lift` takes the following options:

  * `--prod` - in production environment
  * `--port <portNum>` - on the port specified by `portNum` instead of the default (1337)
  * `--verbose` - with verbose logging enabled
  * `--silly` - with insane logging enabled


### Example

```text
$ sails lift

info: Starting app...

info:
info:
info:    Sails              <|
info:    v1.0.0              |\
info:                       /|.\
info:                      / || \
info:                    ,'  |'  \
info:                 .-'.-==|/_--'
info:                 `--'-------'
info:    __---___--___---___--___---___--___
info:  ____---___--___---___--___---___--___-__
info:
info: Server lifted in `/Users/mikermcneil/code/sandbox/second`
info: To see your app, visit http://localhost:1337
info: To shut down Sails, press <CTRL> + C at any time.

debug: --------------------------------------------------------
debug: :: Sat Apr 05 2014 17:03:39 GMT-0500 (CDT)

debug: Environment : development
debug: Port        : 1337
debug: --------------------------------------------------------
```








<docmeta name="displayName" value="sails lift">
<docmeta name="pageType" value="command">
