var commonConfig = require('../../common/common.js');
module.exports = {
  options: {
    startTag: '<!--SCRIPTS-->',
    endTag: '<!--SCRIPTS END-->',
    fileTmpl: '<script src="%s"></script>',
    appRoot: '.tmp/public'
  },
  files: {
    '.tmp/public/**/*.html': commonConfig.jsFilesToInject,
    'views/**/*.html': commonConfig.jsFilesToInject,
    'views/**/*.ejs': commonConfig.jsFilesToInject
  }
};
