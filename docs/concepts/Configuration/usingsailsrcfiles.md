# Using .sailsrc files

In addition to the other methods of configuring your app, you can also specify configuration for one or more apps in `.sailsrc` file(s).  These files are useful for configuring the Sails command-line, and especially for generators.  They also allow you to apply _global_ configuration settings for generators in ANY of the Sails apps you run on your computer, if desired.

When the Sails CLI runs a command, it first looks for  `.sailsrc` files (in either JSON or [.ini](http://en.wikipedia.org/wiki/INI_file) format) in the current directory and in your home folder (i.e. `~/.sailsrc`) (every newly generated Sails app comes with a boilerplate `.sailsrc` file).  Then it merges them in to its existing configuration.

> Actually, Sails looks for `.sailsrc` files in a few other places (following [rc conventions](https://github.com/dominictarr/rc#standards)).  You can put a `.sailsrc` file at any of those paths, if you want it to apply globally to all Sails apps.  That said, stick to convention when you can- the best place to put a global `.sailsrc` file is in your home directory (i.e. `~/.sailsrc`).





<docmeta name="displayName" value="Using `.sailsrc` files">

