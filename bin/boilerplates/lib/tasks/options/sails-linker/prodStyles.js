module.exports = {
  options: {
    startTag: '<!--STYLES-->',
    endTag: '<!--STYLES END-->',
    fileTmpl: '<link rel="stylesheet" href="%s">',
    appRoot: '.tmp/public'
  },
  files: {
    '.tmp/public/index.html': ['.tmp/public/min/production.css'],
    'views/**/*.html': ['.tmp/public/min/production.css'],
    'views/**/*.ejs': ['.tmp/public/min/production.css']
  }
};
