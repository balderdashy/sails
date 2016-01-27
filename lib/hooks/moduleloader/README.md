# `moduleloader` (Core Hook)

This hook exposes `sails.modules`, a set of functions which other core hooks call to load modules from an app's configured directories in `sails.config.paths`.

The moduleloader hook is always the first core hook to load; even before `userconfig`.  Consequently, in order to customize `sails.config.paths`, you need to inject configuration into the load process using env variables, the .sailsrc file, or by passing in an option to the programmatic call to sails.lift (i.e. in app.js). Otherwise, by the time your user configuration files in config/* have loaded, it is too late (this hook has already run using the default paths).
