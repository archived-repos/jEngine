'use strict';

var grunt = require('grunt'),
    path = require('path');

// function jstool2Tmp (dependenceName, filepath) {
//   if( filepath instanceof Array ) {
//     for( var i = 0, len = filepath.length; i < len; i++ ) {
//       jstool2Tmp(dependenceName, filepath[i]);
//     }
//   } else if( typeof filepath === 'string' ) {
//     grunt.file.copy( path.join( process.cwd(), 'node_modules', dependenceName, filepath ),
//         path.join( process.cwd(), '.tmp', dependenceName, filepath )
//     {
//       encoding: 'utf8'
//     });
//   }
// }

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  grunt.initConfig({

    pkg: pkg,

    clean: {
      tests: {
        src: [".tests"]
      }
    },

    concat: {
      options: {
        separator: '\n\n/*  ----------------------------------------------------------------------------------------- */\n\n'
      },
      main: {
        src: [
          '.tmp/{,**/}fn.js',
          '.tmp/{,**/}jqlite.js',
          '.tmp/{,**/}jq-plugin.js',
          '.tmp/{,**/}*.js'
        ],
        dest: '<%= pkg.main %>',
      },
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      min: {
        src: [
          '<%= pkg.main %>'
        ],
        dest: '<%= pkg.main.replace(/\.js$/, \'.min.js\') %>'
      }
    },

    shell: {
      options: {
        stderr: false
      },
      'git-add': {
        command: 'git add --all'
      },
      'git-commit-version': {
        command: 'git commit -m "increasing version"'
      },
      'git-push': {
        command: 'git push origin master'
      },
      'npm-publish': {
        command: 'npm publish'
      }
    },

    'increase-version': {
      bower: {
        options: {
        },
        files: {
          src: [ 'bower.json' ]
        }
      }
    },

    jshint: {
      gruntfile: [ 'Gruntfile.js' ],
      main: [ '<%= pkg.main %>' ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    }

  });

  grunt.registerTask('jengine-build', function () {
    var manager = require('package-manager')('npm'),
        jEngineSrc = '';

    manager.find();

    var expandedList = grunt.file.expand(manager.fileList);

    expandedList.forEach(function (filePath) {
      jEngineSrc += grunt.file.read(filePath);
    });

    jEngineSrc += grunt.file.read('globalize.js');
    
    console.log('expandedList', expandedList);

    grunt.file.write('jEngine.js', jEngineSrc);
  });

  grunt.registerTask('copy-tests', function () {
    var testsPaths;

    grunt.file.delete('./.tests');

    for( var dependence in pkg.dependencies ) {

      /*jshint loopfunc: true */
      grunt.file.expand(['node_modules/' + dependence + '/tests/{,**/}*.js'])
        .forEach(function (testPath) {
          grunt.file.write( '.tests/' + dependence + '/' + testPath.split('/').slice(3).join('/'), grunt.file.read(testPath) );
          console.log('testPath', testPath, '.tests/' + dependence + '/' + testPath.split('/').slice(3).join('/') );
        });
    }
  });

  grunt.registerTask('test', ['jengine-build', 'copy-tests', 'karma']);

  grunt.registerTask('git:push-version', [ 'shell:git-add', 'shell:git-commit-version', 'shell:git-push' ]);

  grunt.registerTask('build', [ 'jengine-build', 'uglify:min' ]);

  grunt.registerTask('publish', [ 'build', 'increase-version', 'git:push-version', 'shell:npm-publish' ]);

};
