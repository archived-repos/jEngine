
require('nitro')(function (nitro) {

  var _ = nitro.tools,
      file = nitro.file,
      template = nitro.template,
      libs = 'node_modules',
      $q = require('q-promise'),
      browserify = function (filepath, src) {
        return $q(function (resolve, reject) {
          var b = require('browserify')();

          if( filepath instanceof Array ) {
            for( var i = 0, n = filepath.length ; i < n ; i++ ) {
              b.add(filepath[i]);
            }
          } else {
            b.add(filepath);
          }

          b.bundle(function (err, code) {
              if(err) {
                reject(err);
              } else {
                resolve( src ? (src + code) : code );
              }
            });
        });
      };

  var fnWrapper = nitro.template(file.read('node_modules/fn-sandbox/lib/global-wrapper.js'));

  $q.when( fnWrapper({ src: file.read('node_modules/fn-sandbox/lib/fn.js') }) )

    .then(function (src) {
      return src +
             file.read(`node_modules/jqlite/jqlite.js`) +
             file.read(`node_modules/jq-plugin/jq-plugin.js`);
    })

    .then(function (src) {
      return browserify([
        'node_modules/jstools-http/src/http-browser.js',
        'node_modules/q-promise/lib/promise-browser.js'
      ], src);
    })

    .then(function (src) {
      file.write('jEngine.js', src);

      try {
        file.write('jEngine.min.js',
          require('uglify-js').minify( src, { fromString: true }).code
        );
      } catch (err) {
        console.log('error minifying', err.message, err);
      }
    });

});
