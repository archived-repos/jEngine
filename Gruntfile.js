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

    concat: {
      options: {
        separator: ';',
      },
      main: {
        cwd: '.tmp',
        src: [
          'jstool-core/**/fix-ie.js',
          'jstool-core/**/log.js',
          'jstool-core/**/fn.js',
          'jstool-core/**/*.js',
          '**/*.js'
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
    }

  });

  grunt.registerTask('copy-tmp', function () {
    console.log('dependencies', pkg.devDependencies);

    var dependencePkg;

    for( var dependenceName in pkg.devDependencies ) {
      dependencePkg = grunt.file.readJSON('node_modules/' + dependenceName + '/package.json');

      if( dependencePkg.jstool ) {
        console.log(dependenceName, dependencePkg.jstool );
        jstool2Tmp(dependenceName, dependencePkg.jstool);
      }
    }
  });

  grunt.registerTask('build', [ 'copy-tmp', 'concat:main', 'uglify:min' ]);

};