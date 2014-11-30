'use strict';

var grunt = require('grunt'),
    path = require('path');

function jstool2Tmp (filepath) {
  if( filepath instanceof Array ) {
    for( var i = 0, len = filepath.length; i++ ) {
      jstool2Tmp(filepath[i]);
    }
  } else if( typeof filepath === 'string' ) {
    grunt.file.copy(
      path.join( process.cwd, 'node_modules', filepath ),
      path.join( process.cwd, '.tmp', filepath )
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

    pkg: pkg

  });

  grunt.registerTask('default', function () {
    console.log('dependencies', pkg.devDependencies);

    var dependencePkg;

    for( var dependence in pkg.devDependencies ) {
      dependencePkg = grunt.file.readJSON('node_modules/' + dependence + '/package.json');

      if( dependencePkg.jstool ) {
        console.log(dependence, dependencePkg.jstool );
        jstool2Tmp(dependencePkg.jstool);
      }
    }
  });

};