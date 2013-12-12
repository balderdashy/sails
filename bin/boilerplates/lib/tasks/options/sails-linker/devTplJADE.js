module.exports = {
  options: {
    startTag: '// TEMPLATES',
    endTag: '// TEMPLATES END',
    fileTmpl: 'script(type="text/javascript", src="%s")',
    appRoot: '.tmp/public'
  },
  files: {
    'views/**/*.jade': ['.tmp/public/jst.js']
  }
};
