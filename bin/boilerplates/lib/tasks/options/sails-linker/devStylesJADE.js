var commonConfig = require('../../common/common.js');
module.exports = {
  options: {
    startTag: '// STYLES',
    endTag: '// STYLES END',
    fileTmpl: 'link(rel="stylesheet", href="%s")',
    appRoot: '.tmp/public'
  },
  files: {
    'views/**/*.jade': commonConfig.cssFilesToInject
  }
};
