# Sails inspect

> ##### _**This command should only be used with modern versions of Node.  For Node v5 and below, use [`sails debug`](https://sailsjs.com/documentation/reference/command-line-interface/sails-debug).**_

Attach the Node debugger and lift the Sails app (similar to running `node --inspect app.js`). You can then use a tool like Chrome DevTools to interactively debug your apps (see the [Node Inspector docs](https://nodejs.org/en/docs/inspector/) for more information).

```usage
sails inspect
```


### Usage
Takes the same options as [`sails lift`](https://sailsjs.com/documentation/reference/command-line-interface/sails-lift), listed [here](https://sailsjs.com/documentation/reference/command-line-interface/sails-lift#?usage).


### Example

```text
$ sails inspect

info: Running app in inspect mode...
info: In Google Chrome, go to chrome://inspect for interactive debugging.
info: For other options, see the link below.
info: ( to exit, type <CTRL>+<C> )

Debugger listening on ws://127.0.0.1:9229/7f984b04-b070-4497-bd15-056261a37f7c
For help see https://nodejs.org/en/docs/inspector
```


> To use the standard (command-line) Node debugger with Sails, you can always just run `node inspect app.js`.

> If you don't see your files in the Chrome DevTools, try clicking the "Filesystem" tab and adding your project folder to the workspace.


<docmeta name="displayName" value="sails inspect">
<docmeta name="pageType" value="command">
