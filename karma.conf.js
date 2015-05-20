module.exports = function(config) {

  var configuration = {
    frameworks: ['jasmine'],
    plugins: [ 'karma-jasmine', 'karma-chrome-launcher', 'karma-firefox-launcher' ],
    files: [
    	'jEngine.js',
     	'.tests/{,**/}jengine-fn/{,**/}*.js',
     	'.tests/{,**/}*.js'
    ],
    browsers: [ 'Chrome', 'Firefox' ],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    singleRun: true
  };

  if(process.env.TRAVIS){
    configuration.browsers = [ 'Chrome_travis_ci', 'Firefox' ];
  }

  config.set(configuration);
};
