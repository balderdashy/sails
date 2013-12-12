var commonConfig = require('../../common/common.js');
module.exports = {
  options: {
    startTag: '<!--STYLES-->',
    endTag: '<!--STYLES END-->',
    fileTmpl: '<link rel="stylesheet" href="%s">',
    appRoot: '.tmp/public'
  },

  // cssFilesToInject defined up top
  files: {
    '.tmp/public/**/*.html': commonConfig.cssFilesToInject,
    'views/**/*.html': commonConfig.cssFilesToInject,
    'views/**/*.ejs': commonConfig.cssFilesToInject
  }
};
