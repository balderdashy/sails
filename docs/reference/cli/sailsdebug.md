# `sails debug`

> ##### _**This command should only be used with older versions of Node.  For Node v6 and above, use [`sails inspect`](https://sailsjs.com/documentation/reference/command-line-interface/sails-inspect).**_

Attach the node debugger and lift the Sails app (similar to running `node --debug app.js`). You can then use [node-inspector](https://github.com/node-inspector/node-inspector) to debug your app as it runs.

```usage
sails debug
```


### Usage
Takes the same options as [`sails lift`](https://sailsjs.com/documentation/reference/command-line-interface/sails-lift), listed [here](https://sailsjs.com/documentation/reference/command-line-interface/sails-lift#?usage).


### Example

```text
$ sails debug

info: Running node-inspector on this app...
info: If you don't know what to do next, type `help`
info: Or check out the docs:
info: http://nodejs.org/api/debugger.html

info: ( to exit, type <CTRL>+<C> )

debugger listening on port 5858
```


> To use the standard (command-line) Node debugger with Sails, you can always just run `node debug app.js`.

### Using Node Inspector

To debug your Sails app using Node Inspector, first install it over npm:

```bash
$ npm install -g node-inspector
```

Then, launch it with the `node-inspector` command:

```bash
$ node-inspector
```

Now, you can lift your Sails app in debug mode:

```bash
$ sails debug
```

Once the application is launched, visit http://127.0.0.1:8080?port=5858 in Opera or Chrome (Sorry, other browsers!). Now you can request your app as usual on port 1337 and debug your code from the browser.

> **How it works**
> Node.js includes a TCP-based debugger. When you start your application using `sails debug`, Node.js lifts your app and opens a socket on port `5858`. This socket allows external tools to interact with and control the debugger. Node Inspector, accessible via the port `8080`, is this kind of tool.

> If you don't see your files in the browser at http://127.0.0.1:8080?port=5858 or if it's very slow to load, try running Node Inspector with the `--no-preload` argument. [See the Node Inspector repo](https://github.com/node-inspector/node-inspector) for more details.


<docmeta name="displayName" value="sails debug">
<docmeta name="pageType" value="command">
