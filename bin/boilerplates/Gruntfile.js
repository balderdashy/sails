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
      },
      build: {
        files: [
          {expand: true, cwd: '.tmp/public', src: ['**/*'], dest: 'www'}
        ]
      }
    },

    clean: {
      dev: ['.tmp/public/**'],
      build: ['www']
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
          '.tmp/public/index.html': ['.tmp/public/mixins/**/*.js', '.tmp/public/js/**/*.js']
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
          '.tmp/public/index.html': ['.tmp/public/mixins/**/*.css', '.tmp/public/styles/**/*.css']
        }
      },

      // Bring in JST template object
      devTpl: {
        options: {
          startTag: '<!--TEMPLATES-->',
          endTag: '<!--TEMPLATES END-->',
          fileTmpl: '\n<script type="text/javascript" src="%s"></script>\n',
          appRoot: '.tmp/public/'
        },
        files: {
          '.tmp/public/index.html': ['.tmp/public/jst.js']
        }
      }
    },

    watch : {
      api: {
        files: ['api/**/*']
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

  // When assets are changed:
  grunt.registerTask('assetsChanged', [
    'reloadAssets'
  ]);

  // Build the assets into a web accessable folder.
  grunt.registerTask('build', [
    'reloadAssets',
    'clean:build',
    'copy:build'
  ]);

  // When API files are changed:
  grunt.event.on('watch', function(action, filepath) {
    grunt.log.writeln(filepath + ' has ' + action);

    // Send a request to a development-only endpoint on the server
    // which will reuptake the file that was changed.
    var baseurl = grunt.option('baseurl');
    var gruntSignalRoute = grunt.option('signalpath');
    var url = baseurl + gruntSignalRoute + '?action=' + action + '&filepath=' + filepath;

    require('http').get(url)
    .on('error', function(e) {
      console.error(filepath + ' has ' + action + ', but could not signal the Sails.js server: ' + e.message);
    });
  });
};