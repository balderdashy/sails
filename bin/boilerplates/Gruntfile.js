module.exports = function(grunt) {

  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      dev: {
        files: [
          {expand: true, cwd: './assets', src: ['**/*'], dest: '.tmp/public'}
        ]
      }
    },

    clean: {
      dev: ['.tmp/public/**']
    },

    jst: {
      dev: {
        options: {
          templateSettings: {
            interpolate : /\{\{(.+?)\}\}/g
          }
        },
        files: {
          '.tmp/public/templates/templates.js': ['assets/templates/**/*.html']
        }
      }
    },

    scriptlinker: {
      devJs: {
        options: {
          startTag: '<!--SCRIPTS-->',
          endTag: '<!--SCRIPTS END-->',
          fileTmpl: '\n<script src="%s"></script>\n',
          appRoot: '.tmp/public/'
        },
        files: {
          '.tmp/public/index.html': ['.tmp/public/js/jquery.js', '.tmp/public/js/foobar.js', '.tmp/public/js/**/*.js']
        }
      },
      devStyles: {
        options: {
          startTag: '<!--STYLES-->',
          endTag: '<!--STYLES END-->',
          fileTmpl: '\n<link rel="stylesheet" href="%s">\n',
          appRoot: '.tmp/public/'
        },
        files: {
          '.tmp/public/index.html': ['.tmp/public/styles/**/*.css']
        }
      },
      devTpl: {
        options: {
          startTag: '<!--TEMPLATES-->',
          endTag: '<!--TEMPLATES END-->',
          fileTmpl: '\n<script src="%s"></script>\n',
          appRoot: '.tmp/public/'
        },
        files: {
          '.tmp/public/index.html': ['.tmp/public/templates/**/*']
        }
      }
    },

    watch : {
      api: {
        files: ['api/**/*'],
        tasks: ['api']
      },
      assets: {
        files: ['assets/**/*'],
        tasks: ['assets']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-scriptlinker');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // When Sails is lifted:
  grunt.registerTask('default', [
    'watch:api',
    'watch:assets',
    'clean:dev',
    'jst:dev',
    'copy:dev',
    'scriptlinker:devJs',
    'scriptlinker:devStyles',
    'scriptlinker:devTpl'
  ]);

  // When API files are changed:
  grunt.registerTask('api', [
    
  ]);

  // When assets are changed:
  grunt.registerTask('assets', [
    'clean:dev',
    'jst:dev',
    'copy:dev',
    'scriptlinker:devJs',
    'scriptlinker:devStyles',
    'scriptlinker:devTpl'
  ]);
};