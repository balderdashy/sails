module.exports = {
  options: {
    startTag: '<!--TEMPLATES-->',
    endTag: '<!--TEMPLATES END-->',
    fileTmpl: '<script type="text/javascript" src="%s"></script>',
    appRoot: '.tmp/public'
  },
  files: {
    '.tmp/public/index.html': ['.tmp/public/jst.js'],
    'views/**/*.html': ['.tmp/public/jst.js'],
    'views/**/*.ejs': ['.tmp/public/jst.js']
  }
};
