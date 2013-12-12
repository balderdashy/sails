module.exports = {
  api: {

    // API files to watch:
    files: ['api/**/*']
  },
  assets: {

    // Assets to watch:
    files: ['assets/**/*'],

    // When assets are changed:
    tasks: ['compileAssets', 'linkAssets']
  }
};
