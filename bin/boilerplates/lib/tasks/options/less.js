module.exports = {
  dev: {
    files: [
      {
        expand: true,
        cwd: 'assets/styles/',
        src: ['*.less'],
        dest: '.tmp/public/styles/',
        ext: '.css'
      },
      {
        expand: true,
        cwd: 'assets/linker/styles/',
        src: ['*.less'],
        dest: '.tmp/public/linker/styles/',
        ext: '.css'
      }
    ]
  }
};
