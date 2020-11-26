
# Changelog 0.8.8x
### 0.8.80
+ Refactored app layout to make it a bit more straightforward. To check out the the new folder structure, make a new project with `sails new foo`
+ Added robot.txt in new app generation
+ Bound all methods in adapter to have the right context.

### 0.8.82
_Sunday, February 24, 2013_
+ Bootstrap function fires warning if callback not triggered after a few seconds (thanks [@virpool](https://github.com/virpool))
+ Bug fixes w/ pubsub/model convenience methods.

### 0.8.83
_Saturday, March 2, 2013_
+ Support for streaming large datasets from models `(e.g. User.stream().pipe(res);)`
+ Bug fix for chains of multiple policies (thanks [@themouette](https://github.com/themouette))
+ Jade template support (thanks [@valinorsgatekeeper](https://github.com/valinorsgatekeeper)
+ AssetRack integration for more robust css/js/template/LESS management, replaces Rigging (thanks [@techpines](https://github.com/techpines))
+ Fixed some docs /refactored (thanks @slantzjr)
+ Bundled excruciatingly simple "authenticated" policy in new projects
+ Made "redirect" work in API scaffolds
+ Renamed waterline-* adapter modules as sails-*. Added backwards compat.
+ Added .gitkeep in all directories when generating new projects to make sure they get committed
+ Bootstrap and log config now available in project template
+ View config now available in new projects as 'config/views.js'
+ Better error checking in the `sails` CLI
+ Docs
+ Added app.js file back in, but this time hidden as '.app.js'. It can be run however you like, or you can use npm debug to debug it. To run daemonized, you can use `forever start .app.js`
+ Added notion of `sails.explicitHost` to track whether a host was explicitly specified. If it was not, Express takes the approach of accepting `all connections via INADDR_ANY` (see [http://expressjs.com/2x/guide.html#app.listen()](http://expressjs.com/2x/guide.html#app.listen())) Now, if you specify `sails.config.host`, `sails.explicitHost` gets set, and Express will start the server deliberately using the host you specify. In certain PaaS deployments, this is required. For instance, this was causing problems in an Openshift deployment environment (big thanks to @hypereive for figuring that out).

### 0.8.84
_Saturday, March 2, 2013_
+ Bug fixes: (explicit hosts, and included an additional file in new app generation)

### 0.8.85
_Sunday, March 3, 2013_
+ Check for and warn if port is currently being used on lift, with support for explicit hosts [https://github.com/balderdashy/sails/issues/197](https://github.com/balderdashy/sails/issues/197))
+ Model.stream() support over socket.io [https://github.com/balderdashy/sails/issues/196](https://github.com/balderdashy/sails/issues/196))

### 0.8.86
_Monday, March 4, 2013_
+ Patch to allow for easier SSL configuration.

### 0.8.87
_Monday, March 4, 2013_
+ Patch fixes updates sails-dirty version which fixes sorting by date

### 0.8.88
+ Adds coffeescript support on the front-end in dev and production environments via [asset-rack](https://github.com/techpines/asset-rack) [@techpines](thanks https://github.com/techpines)!)

### 0.8.892
+ Front-end CoffeeScript support in AssetRack (thanks [@techpines](https://github.com/techpines)!)
+ Chained policy support
+ New styles for default home page (thanks [@egdelwonk](https://github.com/egdelwonk)!)
+ Windows compat. fix (thanks [@feroc1ty](https://github.com/feroc1ty)!)
+ Support for string IDs (thanks [@tedkulp](https://github.com/tedkulp)!)
+ Attribute scaffolding for model generation (thanks [@Tidwell](https://github.com/Tidwell))
+ Support for big int string conversion in ID normalization (thanks [@d4mn](https://github.com/d4mn)!)

### 0.8.895
+ Policies: Fixed the "*" route for controllers.
+ Policies: The "*" policy can now be set to false
+ Collections: Type restrictions are cleaner
+ Adapters: Default was changed to memory due to an issue with node-dirty
+ Log: sails.config.log.level is passed to socket.io
+ Assets: Bug fixed: not calling next when compiling LESS with syntax (thanks vicapow)
+ Assets: Typescript supported on front-end (thanks Diullei)
+ Assets: Meaningful LESS errors were added (thanks vicapow)


<docmeta name="displayName" value="0.8.8x Changelog">
<docmeta name="version" value="0.8.8">
