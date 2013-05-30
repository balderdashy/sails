module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      dev: {
        files: [
          {expand: true, cwd: './assets', src: ['css/**'], dest: '.tmp/public'},
          {expand: true, cwd: './assets', src: ['js/**'], dest: '.tmp/public'},
          // {expand: true, cwd: './assets', src: ['templates/**'], dest: '.tmp/public'},
          {expand: true, cwd: './assets', src: ['index.html'], dest: '.tmp/public'}
        ]
      }
    },

    clean: {
      dev: [".tmp/public/**"]
    },

    jst: {
      dev: {
        options: {
          templateSettings: {
            interpolate : /\{\{(.+?)\}\}/g
          }
        },
        files: {
          ".tmp/public/templates/templates.js": ["assets/templates/**/*.html"]
        }
      }
    },

    scriptlinker: {
      dev_js: {
        options: {
          startTag: '<!--SCRIPTS-->',
          endTag: '<!--SCRIPTS END-->',
          fileTmpl: '\n<script src="%s"></script>',
          appRoot: '.tmp/public/'
        },
        files: {
          '.tmp/public/index.html': ['.tmp/public/js/jquery.js', '.tmp/public/js/foobar.js', '.tmp/public/js/**/*.js']
        }
      },
      dev_css: {
        options: {
          startTag: '<!--STYLES-->',
          endTag: '<!--STYLES END-->',
          fileTmpl: '\n<link href="%s">',
          appRoot: '.tmp/public/'
        },
        files: {
          '.tmp/public/index.html': ['.tmp/public/css/**/*.css']
        }
      },
      dev_tpl: {
        options: {
          startTag: '<!--TEMPLATES-->',
          endTag: '<!--TEMPLATES END-->',
          fileTmpl: '\n<script src="%s"></script>',
          appRoot: '.tmp/public/'
        },
        files: {
          '.tmp/public/index.html': ['.tmp/public/templates/**/*']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-scriptlinker');
  grunt.loadNpmTasks('grunt-contrib-jst');

  // Default task(s).
  grunt.registerTask('default', ['clean:dev', 'jst:dev', 'copy:dev', 'scriptlinker:dev_js', 'scriptlinker:dev_css', 'scriptlinker:dev_tpl']);
};