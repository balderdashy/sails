var commonConfig = require('../common/common.js');
module.exports = {
  js: {
    src: commonConfig.jsFilesToInject,
    dest: '.tmp/public/concat/production.js'
  },
  css: {
    src: commonConfig.cssFilesToInject,
    dest: '.tmp/public/concat/production.css'
  }
};
