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
        tasks: ['apiChanged']
      },
      assets: {
        files: ['assets/**/*'],
        tasks: ['assetsChanged']
      }
    }
  });

  // Get path to core grunt dependencies from Sails
  var depsPath = grunt.option('gdsrc');
  grunt.loadTasks(depsPath + '/grunt-contrib-clean/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-copy/tasks');
  grunt.loadTasks(depsPath + '/grunt-scriptlinker/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-jst/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-watch/tasks');

  // When Sails is lifted:
  grunt.registerTask('default', [
    'reloadAssets',
    'watch'
  ]);

  grunt.registerTask('reloadAssets', [
    'clean:dev',
    'jst:dev',
    'copy:dev',
    'scriptlinker:devJs',
    'scriptlinker:devStyles',
    'scriptlinker:devTpl'
  ]);

  // When API files are changed:
  grunt.registerTask('apiChanged', function(a,b) {
     console.log('reloading api!',a,b);
     grunt.log.writeln('Currently running the "reloadApi" task.');

  });

  // When assets are changed:
  grunt.registerTask('assetsChanged', [
    'reloadAssets'
  ]);
};