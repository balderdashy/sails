## Moduleloader Hook

This hook loads modules from your configured directories in `sails.config.paths`.  It is always loaded first or second.

> Note that consequently, in order to customize `sails.config.paths`, you need to inject configuration into the load process using env variables, the .sailsrc file, or by passing in an option to the programmatic call to sails.lift (i.e. in app.js). Otherwise, by the time your user configuration files in config/* have loaded, it is too late (this hook has already run using the default paths).

##### Contributing to this hook
Not a good place to jump in right now.  Please tweet @mikermcneil before working on this part!
