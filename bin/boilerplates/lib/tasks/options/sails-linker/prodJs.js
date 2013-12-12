module.exports = {
  options: {
    startTag: '<!--SCRIPTS-->',
    endTag: '<!--SCRIPTS END-->',
    fileTmpl: '<script src="%s"></script>',
    appRoot: '.tmp/public'
  },
  files: {
    '.tmp/public/**/*.html': ['.tmp/public/min/production.js'],
    'views/**/*.html': ['.tmp/public/min/production.js'],
    'views/**/*.ejs': ['.tmp/public/min/production.js']
  }

}
