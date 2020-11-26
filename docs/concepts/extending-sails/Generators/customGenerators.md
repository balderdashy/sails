# Custom generators

<!-- TODO: update this tutorial to reflect how generator names are spat out.  Also update it to explain that you can just delete the package.json file in the newly generated generator if you're not planning on publishing it to npm.  Also bring back in the information that was deleted because the examples were quite out of date (the other content is still good though- see commit history of this file on GitHub  -->

### Overview

Custom [generators](https://sailsjs.com/documentation/concepts/extending-sails/generators) are a type of plugin for the Sails command line.  Through templates, they control which files get generated in your Sails projects when you run `sails new` or `sails generate`, and also what those files look like.

### Creating a generator

To make this easier to play with, let's first make a Sails project.  If you haven't already created one, go to your terminal and type:

```sh
sails new my-project
```

Then `cd` into `my-project` and ask Sails to spit out the template for a new generator:

```sh
sails generate generator awesome
```

### Configuring a generator

To enable the generator you need to tell Sails about it via your test project's [`.sailsrc` file](https://sailsjs.com/documentation/concepts/configuration/using-sailsrc-files).

If we were using an existing generator, we could just install it from NPM, then specify the name of the package in `.sailsrc`.  But since we're developing this generator locally, we'll just connect it to the folder directly:

```javascript
{
  "generators": {
    "modules": {
    	"awesome": "./my-project/awesome"
    }
  }
}
```

> **Note:** For now, we'll stick with "awesome", but you can mount the generator under any name you want.  Whatever you choose for the name of the key in the `.sailsrc` file will be the name you'll use to run this generator from the terminal (e.g. `sails generate awesome`).


### Running a custom generator

To run your generator, just tack its name on to `sails generate`, followed by any desired arguments or command-line options.  For example:

```js
sails generate awesome
```


### Publishing to NPM

If your generator is useful across different projects, you might consider publishing it as an NPM package (note that this doesn't mean that your generator must be open-source: NPM also supports [private packages](https://docs.npmjs.com/private-modules/intro).

First, pop open the `package.json` file and verify the package name (e.g. "@my-npm-name/sails-generate-awesome"), author ("My Name"), license, and other information are correct.  If you're unsure, a good open source license to use is "MIT".  If you're publishing a private generator and want it to remain proprietary to your organization, use "UNLICENSED".

> **Note:**  If you don't already have an NPM account, go to [npmjs.com](https://www.npmjs.com/) and create one.  Then use `npm login` to get set up.

When you're ready to pull the trigger and publish your generator on NPM, cd into the generator's folder in the terminal and type:

```sh
npm publish
```


### Installing a generator

To take your newly-published generator for a spin, cd back into your example Sails project (`my-project`), delete the inline generator, and run:

```js
npm install @my-npm-name/sails-generate-awesome
```

then change the `.sailsrc` in your example Sails project (`my-project/.sailsrc`):

```javascript
{
  "generators": {
    "modules": {
      "awesome": "@my-npm-name/sails-generate-awesome"
    }
  }
}
```

And, last but not least:

```sh
sails generate awesome
```


<docmeta name="displayName" value="Custom generators">
