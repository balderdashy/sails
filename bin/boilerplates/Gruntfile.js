module.exports = function(grunt) {

  'use strict';

  // Get path to core grunt dependencies from Sails
  var depsPath = grunt.option('gdsrc') || 'node_modules/sails/node_modules';
  grunt.loadTasks(depsPath + '/grunt-contrib-clean/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-copy/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-concat/tasks');
  grunt.loadTasks(depsPath + '/grunt-scriptlinker/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-jst/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-watch/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-uglify/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-cssmin/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-less/tasks');

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
          '.tmp/public/jst.js': ['assets/templates/**/*.html', 'assets/linker/templates/**/*.html']
        }
      }
    },
    
    less: {
      dev: {
        files: [
          {
            expand: true,
            cwd: 'assets/styles/',
            src: ['*.less'],
            dest: '.tmp/public/styles/',
            ext: '.css'
          },{
            expand: true,
            cwd: 'assets/linker/styles/',
            src: ['*.less'],
            dest: '.tmp/public/linker/styles/',
            ext: '.css'
          }
        ]
      }
    },

    concat: {
      js: {
        src: ['.tmp/public/linker/js/**/*.js'],
        dest: '.tmp/public/concat/production.js'
      },
      css: {
        src: ['.tmp/public/linker/styles/**/*.css'],
        dest: '.tmp/public/concat/production.css'
      }
    },

    uglify: {
      dist: {
        src: ['.tmp/public/concat/production.js'],
        dest: '.tmp/public/min/production.js'
      }
    },

    cssmin: {
      dist: {
        src: ['.tmp/public/concat/production.css'],
        dest: '.tmp/public/min/production.css'
      }
    },

    scriptlinker: {

      devJs: {
        options: {
          startTag: '<!--SCRIPTS-->',
          endTag: '<!--SCRIPTS END-->',
          fileTmpl: '<script src="%s"></script>',
          appRoot: '.tmp/public/'
        },
        files: {
          '.tmp/public/**/*.html': ['.tmp/public/linker/**/*.js'],
          'views/**/*.html': ['.tmp/public/linker/**/*.js'],
          'views/**/*.ejs': ['.tmp/public/linker/**/*.js']
        }
      },

      prodJs: {
        options: {
          startTag: '<!--SCRIPTS-->',
          endTag: '<!--SCRIPTS END-->',
          fileTmpl: '<script src="%s"></script>',
          appRoot: '.tmp/public/'
        },
        files: {
          '.tmp/public/**/*.html': ['.tmp/public/min/production.js'],
          'views/**/*.html': ['.tmp/public/min/production.js'],
          'views/**/*.ejs': ['.tmp/public/min/production.js']
        }
      },

      devStyles: {
        options: {
          startTag: '<!--STYLES-->',
          endTag: '<!--STYLES END-->',
          fileTmpl: '<link rel="stylesheet" href="%s">',
          appRoot: '.tmp/public/'
        },
        files: {
          '.tmp/public/**/*.html': ['.tmp/public/linker/**/*.css'],
          'views/**/*.html': ['.tmp/public/linker/**/*.css'],
          'views/**/*.ejs': ['.tmp/public/linker/**/*.css'],
        }
      },

      prodStyles: {
        options: {
          startTag: '<!--STYLES-->',
          endTag: '<!--STYLES END-->',
          fileTmpl: '<link rel="stylesheet" href="%s">',
          appRoot: '.tmp/public/'
        },
        files: {
          '.tmp/public/index.html': ['.tmp/public/min/production.css'],
          'views/**/*.html': ['.tmp/public/min/production.css'],
          'views/**/*.ejs': ['.tmp/public/min/production.css']
        }
      },

      // Bring in JST template object
      devTpl: {
        options: {
          startTag: '<!--TEMPLATES-->',
          endTag: '<!--TEMPLATES END-->',
          fileTmpl: '<script type="text/javascript" src="%s"></script>',
          appRoot: '.tmp/public/'
        },
        files: {
          '.tmp/public/index.html': ['.tmp/public/jst.js'],
          'views/**/*.html': ['.tmp/public/jst.js'],
          'views/**/*.ejs': ['.tmp/public/jst.js']
        }
      },
      
      
      /*******************************************
       * Jade linkers (TODO: clean this up)
       *******************************************/
      
      devJsJADE: {
        options: {
          startTag: '// SCRIPTS',
          endTag: '// SCRIPTS END',
          fileTmpl: 'script(type="text/javascript", src="%s")',
          appRoot: '.tmp/public/'
        },
        files: {
          'views/**/*.jade': ['.tmp/public/linker/**/*.js']
        }
      },

      prodJsJADE: {
        options: {
          startTag: '// SCRIPTS',
          endTag: '// SCRIPTS END',
          fileTmpl: 'script(type="text/javascript", src="%s")',
          appRoot: '.tmp/public/'
        },
        files: {
          'views/**/*.jade': ['.tmp/public/min/production.js']
        }
      },

      devStylesJADE: {
        options: {
          startTag: '// STYLES',
          endTag: '// STYLES END',
          fileTmpl: 'link(rel="stylesheet", href="%s")',
          appRoot: '.tmp/public/'
        },
        files: {
          'views/**/*.jade': ['.tmp/public/linker/**/*.css']
        }
      },

      prodStylesJADE: {
        options: {
          startTag: '// STYLES',
          endTag: '// STYLES END',
          fileTmpl: 'link(rel="stylesheet", href="%s")',
          appRoot: '.tmp/public/'
        },
        files: {
          'views/**/*.jade': ['.tmp/public/min/production.css']
        }
      },

      // Bring in JST template object
      devTplJADE: {
        options: {
          startTag: '// TEMPLATES',
          endTag: '// TEMPLATES END',
          fileTmpl: 'script(type="text/javascript", src="%s")',
          appRoot: '.tmp/public/'
        },
        files: {
          'views/**/*.jade': ['.tmp/public/jst.js']
        }
      }
      /************************************
       * Jade linker end
       ************************************/
    },

    watch : {
      api: {

        // API files to watch:
        files: ['api/**/*']
      },
      assets: {

        // Assets to watch:
        files: ['assets/**/*'],

        // When assets are changed:
        tasks: ['compileAssets', 'linkAssets']
      }
    }
  });

  // When Sails is lifted:
  grunt.registerTask('default', [
    'compileAssets',
    'linkAssets',
    'watch'
  ]);

  grunt.registerTask('compileAssets', [
    'clean:dev',
    'jst:dev',
    'less:dev',
    'copy:dev'
  ]);

  grunt.registerTask('linkAssets', [

    // Update link/script/template references in `assets` index.html
    'scriptlinker:devJs',
    'scriptlinker:devStyles',
    'scriptlinker:devTpl',
    'scriptlinker:devJsJADE',
    'scriptlinker:devStylesJADE',
    'scriptlinker:devTplJADE'
  ]);
  

  // Build the assets into a web accessible folder.
  // (handy for phone gap apps, chrome extensions, etc.)
  grunt.registerTask('build', [
    'compileAssets',
    'linkAssets',
    'clean:build',
    'copy:build'
  ]);

  // When sails is lifted in production
  grunt.registerTask('prod', [
    'clean:dev',
    'jst:dev',
    'less:dev',
    'copy:dev',
    'concat',
    'uglify',
    'cssmin',
    'scriptlinker:prodJs',
    'scriptlinker:prodStyles',
    'scriptlinker:devTpl',
    'scriptlinker:prodJsJADE',
    'scriptlinker:prodStylesJADE',
    'scriptlinker:devTplJADE'
  ]);

  // When API files are changed:
  // grunt.event.on('watch', function(action, filepath) {
  //   grunt.log.writeln(filepath + ' has ' + action);

  //   // Send a request to a development-only endpoint on the server
  //   // which will reuptake the file that was changed.
  //   var baseurl = grunt.option('baseurl');
  //   var gruntSignalRoute = grunt.option('signalpath');
  //   var url = baseurl + gruntSignalRoute + '?action=' + action + '&filepath=' + filepath;

  //   require('http').get(url)
  //   .on('error', function(e) {
  //     console.error(filepath + ' has ' + action + ', but could not signal the Sails.js server: ' + e.message);
  //   });
  // });
};