'use strict';

var grunt = require('grunt'),
    path = require('path');

function jstool2Tmp (dependenceName, filepath) {
  if( filepath instanceof Array ) {
    for( var i = 0, len = filepath.length; i < len; i++ ) {
      jstool2Tmp(dependenceName, filepath[i]);
    }
  } else if( typeof filepath === 'string' ) {
    grunt.file.copy(
      path.join( process.cwd(), 'node_modules', dependenceName, filepath ),
      path.join( process.cwd(), '.tmp', dependenceName, filepath )
      ,{
        encoding: 'utf8'
      });

    console.log('file2Tmp', process.cwd() );
  }
}

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
      tmp: {
        src: [".tmp"]
      }
    },

    concat: {
      options: {
        separator: '\n\n/*  ----------------------------------------------------------------------------------------- */\n\n'
      },
      main: {
        src: [
          '.tmp/license.js',
          '.tmp/jstool-core/**/fix-ie.js',
          '.tmp/jstool-core/**/log.js',
          '.tmp/jstool-core/**/fn.js',
          '.tmp/jstool-core/**/*.js',
          '.tmp/**/*.js'
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
    }

  });

  grunt.registerTask('process-jstools', function () {
    var dependencePkg, license = grunt.file.read('LICENSE');

    grunt.file.write('.tmp/license.js', grunt.template.process('/*\n * <%= pkg.name %> - <%= pkg.description %>\n\n') + license.replace(/(.*)\n?/g, ' * $1\n') + ' */\n\n' );

    pkg.jstools.forEach(function (dependenceName) {
      jstool2Tmp(dependenceName, grunt.file.readJSON('node_modules/' + dependenceName + '/package.json').main);
    });

    // for( var dependenceName in pkg.devDependencies ) {
    //   dependencePkg = grunt.file.readJSON('node_modules/' + dependenceName + '/package.json');

    //   if( dependencePkg.jstool ) {
    //     jstool2Tmp(dependenceName, dependencePkg.jstool);
    //   }
    // }
  });

  grunt.registerTask('build', [ 'clean:tmp', 'process-jstools', 'concat:main', 'uglify:min' ]);

  grunt.registerTask('git:push-version', [ 'shell:git-add', 'shell:git-commit-version', 'shell:git-push' ]);

  grunt.registerTask('publish', [ 'build', 'increase-version', 'git:push-version', 'shell:npm-publish' ]);

};