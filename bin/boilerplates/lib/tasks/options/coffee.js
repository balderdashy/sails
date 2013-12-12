module.exports = {
  dev: {
    options: {
      bare: true
    },
    files: [
      {
        expand: true,
        cwd: 'assets/js/',
        src: ['**/*.coffee'],
        dest: '.tmp/public/js/',
        ext: '.js'
      },
      {
        expand: true,
        cwd: 'assets/linker/js/',
        src: ['**/*.coffee'],
        dest: '.tmp/public/linker/js/',
        ext: '.js'
      }
    ]
  }
};
