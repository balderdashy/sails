module.exports = {
  options: {
    startTag: '// SCRIPTS',
    endTag: '// SCRIPTS END',
    fileTmpl: 'script(type="text/javascript", src="%s")',
    appRoot: '.tmp/public'
  },
  files: {
    'views/**/*.jade': ['.tmp/public/min/production.js']
  }
};
