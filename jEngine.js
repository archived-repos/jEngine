/*
 * jengine - A Powerful javascript framework to build your website/application

 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Jesús Manuel Germade Castiñeiras <jesus@germade.es>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */



/*  ----------------------------------------------------------------------------------------- */

/*
 * jstool-core - JS global object (fn) to define modules

 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Jesús Manuel Germade Castiñeiras <jesus@germade.es>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */
;(function (){
	'use strict';

	if (!Object.keys) {
	  Object.keys = function(obj) {
	    var keys = [];

	    for (var i in obj) {
	      if (obj.hasOwnProperty(i)) {
	        keys.push(i);
	      }
	    }

	    return keys;
	  };
	}

	// Add ECMA262-5 method binding if not supported natively
	//
	if (!('bind' in Function.prototype)) {
	    Function.prototype.bind= function(owner) {
	        var that= this;
	        if (arguments.length<=1) {
	            return function() {
	                return that.apply(owner, arguments);
	            };
	        } else {
	            var args= Array.prototype.slice.call(arguments, 1);
	            return function() {
	                return that.apply(owner, arguments.length===0? args : args.concat(Array.prototype.slice.call(arguments)));
	            };
	        }
	    };
	}

	// Add ECMA262-5 string trim if not supported natively
	//
	if (!('trim' in String.prototype)) {
	    String.prototype.trim= function() {
	        return this.replace(/^\s+/, '').replace(/\s+$/, '');
	    };
	}

	// Add ECMA262-5 Array methods if not supported natively
	//
	if (!('indexOf' in Array.prototype)) {
	    Array.prototype.indexOf= function(find, i /*opt*/) {
	        if (i===undefined) i= 0;
	        if (i<0) i+= this.length;
	        if (i<0) i= 0;
	        for (var n= this.length; i<n; i++)
	            if (i in this && this[i]===find)
	                return i;
	        return -1;
	    };
	}
	if (!('lastIndexOf' in Array.prototype)) {
	    Array.prototype.lastIndexOf= function(find, i /*opt*/) {
	        if (i===undefined) i= this.length-1;
	        if (i<0) i+= this.length;
	        if (i>this.length-1) i= this.length-1;
	        for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
	            if (i in this && this[i]===find)
	                return i;
	        return -1;
	    };
	}
	if (!('forEach' in Array.prototype)) {
	    Array.prototype.forEach= function(action, that /*opt*/) {
	        for (var i= 0, n= this.length; i<n; i++)
	            if (i in this)
	                action.call(that, this[i], i, this);
	    };
	}
	if (!('map' in Array.prototype)) {
	    Array.prototype.map= function(mapper, that /*opt*/) {
	        var other= new Array(this.length);
	        for (var i= 0, n= this.length; i<n; i++)
	            if (i in this)
	                other[i]= mapper.call(that, this[i], i, this);
	        return other;
	    };
	}
	if (!('filter' in Array.prototype)) {
	    Array.prototype.filter= function(filter, that /*opt*/) {
	        var other= [], v;
	        for (var i=0, n= this.length; i<n; i++)
	            if (i in this && filter.call(that, v= this[i], i, this))
	                other.push(v);
	        return other;
	    };
	}
	if (!('every' in Array.prototype)) {
	    Array.prototype.every= function(tester, that /*opt*/) {
	        for (var i= 0, n= this.length; i<n; i++)
	            if (i in this && !tester.call(that, this[i], i, this))
	                return false;
	        return true;
	    };
	}
	if (!('some' in Array.prototype)) {
	    Array.prototype.some= function(tester, that /*opt*/) {
	        for (var i= 0, n= this.length; i<n; i++)
	            if (i in this && tester.call(that, this[i], i, this))
	                return true;
	        return false;
	    };
	}
})();;(function () {
	'use strict';

	var _consoleLog = function (type, args) {
	        window.console[type].apply( window.console, args );
	    },
	    noop = function () {},
	    consoleLog = noop;

	var log = function() {
	        consoleLog('log', Array.prototype.slice.call(arguments));
	    };

	['info', 'warn', 'debug', 'error'].forEach(function (type) {
	    log[type] = (window.console !== undefined) ? function () {
	        consoleLog(type, Array.prototype.slice.call(arguments));
	    } : noop;
	});

	log.enable = function (enableLog) {
	    enableLog = (enableLog === undefined) ? true : enableLog;
	    if( enableLog ) {
	        consoleLog = (window.console !== undefined ) ? _consoleLog : noop;
	    } else {
	        consoleLog = noop;
	    }
	    log('log is enabled');
	};

	log.clear = function() {
	    log.history = [];
	    if (window.console) console.clear();
	};

	if( window.enableLog ) {
		log.enable();
	}

	window.log = log;

})();;/*	Copyright (c) 2014, Jesús Manuel Germade Castiñeiras <jesus@germade.es>
 * 
 *	Permission to use, copy, modify, and/or distribute this software for any purpose
 *	with or without fee is hereby granted, provided that the above copyright notice
 *	and this permission notice appear in all copies.
 * 
 *	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 *	FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT,
 *	OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
 *	DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS
 *	ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

(function () {
	'use strict';

	var _ = {
		isFunction: function (fn) {
			return (fn instanceof Function);
		},
		isArray: function (list) {
			return (list instanceof Array);
		},
		isString: function (str) {
			return ( typeof str === 'string' );
		},
		isNumber: function (n) {
			return (n instanceof Number);
		},
		isObject: function(myVar,type){ if( myVar instanceof Object ) return ( type === 'any' ) ? true : ( typeof myVar === (type || 'object') ); else return false; },
		key: function(o,full_key,value){
    		if(! o instanceof Object) return false;
    		var keys = full_key.split('.'), in_keys = o || {};
    		if(value !== undefined) {
    			if(keys.length) {
    				var key = keys.shift(), next_key;
    				while( next_key = keys.shift() ) {
    					if( !o[key] ) o[key] = {};
    					o = o[key];
    					key = next_key;
    				}
    				o[key] = value;
    			}
    			return value;
    		} else {
    		    var key;
    			for(var k=0, len = keys.length;k<len;k++) {
    			    key = keys[k];
    			    if( key in in_keys ) in_keys = in_keys[keys[k]] || {};
    				else return false;
    			}
    			return in_keys;
    		}
    	},
    	keys: Object.keys,
    	globalize: function (varName, o) {
    		if( o ) {
    			(typeof window === 'undefined' ? module.exports : window)[varName] = o;
    		} else {
    			(typeof window === 'undefined' ? module.exports : window)[varName] = definitions[varName];
    		}
    	}
	};

	var definitions = { '_': _ },
		RE_FN_ARGS = /^function[^\(]\(([^\)]*)/,
		noop = function () {},
		tryDone = function (waitFor, callback) {
			if( !Object.keys(waitFor).length && _.isFunction(callback) ) {
				callback();
				return true;
			}
			return false;
		},
		fnListeners = {};

	/**
	 * @description
	 * fn function
	 *
	 * @param {fnName} function name
	 * @param {dependencies} array of dependencies ended by function defition
	 * @returns {Object} the Core
	 */
	function fn (f, dependencies) {
		if( dependencies ) {
			fn.define(f, dependencies);
		} else if( _.isArray(f) ) {
			return definitions[f];
		} else if( _.isString(f) ) {
			return definitions[f];
		} else {
			fn.run(f);
		}
	}

	function onceFn (fnName, handler) {
		fnListeners[fnName] = fnListeners[fnName] || [];
		fnListeners[fnName].push(handler);
	}

	function triggerFn (fnName) {
		if( _.isArray(fnListeners[fnName]) ) {
			for( var i = 0, len = fnListeners[fnName].length; i < len; i++ ) {
				fnListeners[fnName][i]();
			}
		}
	}

	fn.run = function (dependencies) {
		var f;

		if( _.isArray(dependencies) ) {
			f = dependencies.pop();
		} else if( _.isFunction(dependencies) ) {
			f = dependencies;
			dependencies = f.toString().match(RE_FN_ARGS)[1].split(',');
		}

		if( f instanceof Function ) {
			fn.require(dependencies, function () {
				f.apply(definitions, this.injections);
			});
		}
	};

	fn.define = function (fnName, dependencies) {
		if( _.isString(fnName) ) {

			var fnDef, args = [];

			if( _.isArray(dependencies) ) {
				fnDef = dependencies.pop();
			} else if( _.isFunction(dependencies) ) {
				fnDef = dependencies;
				dependencies = [];
				fnDef.toString().replace(RE_FN_ARGS, function(match, params) {
					params = params.replace(/\s/g,'');
					if( params ) {
						params.replace(/([^,]+),?/, function (match, param) {
							dependencies.push(param);
						});
					}
				});
				// dependencies = fnDef.toString().replace(/\s/g,'').match(RE_FN_ARGS)[1].split(',');
			}

			// log('fn.define', fnName, fnDef, dependencies);
			fn.require(dependencies, function () {
				definitions[fnName] = fnDef.apply(definitions, this.injections);
				log('fn defined: ', fnName);
				triggerFn(fnName);
			});
		}
	};

	fn.require = function (dependencies, callback) {
		if( !_.isFunction(callback) ) return false;

		var runCallback = function () {
			var injections = [];
			for( var i = 0, len = dependencies.length; i < len; i++ ) {
				injections.push(definitions[dependencies[i]]);
			}
			callback.call({ injections: injections });
		};

		if( _.isArray(dependencies) ) {

			if( dependencies.length ) {
				var waitFor = {};

				for( var i = 0, len = dependencies.length; i < len; i++ ) {
					if( !definitions[dependencies[i]] ) {
						waitFor[dependencies[i]] = true;
					}
				}

				if( !tryDone(waitFor, runCallback) ) {
					dependencies.forEach(function (dependence) {
						fn.when(dependence, function () {
							delete waitFor[dependence];
							tryDone(waitFor, runCallback);
						});
					});
				}

			} else runCallback();
		} else if( _.isString(dependencies) ) {
			fn.when(dependencies, runCallback);
		}
	};

	fn.when = function (fnName, callback) {
		if( _.isFunction(callback) ) {
			if( definitions[fnName] ) callback();
			else onceFn(fnName, callback);
		}
	};

	fn.defer = function (f) {
		if( _.isFunction(f) ) {
			setTimeout(f, 0);
		}	
	};

	fn.globalize = _.globalize;

	_.globalize('fn', fn);

})();

/*  ----------------------------------------------------------------------------------------- */


/*
 * jqlite - JavaScript library to query and manipulate DOM 

 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Jesús Manuel Germade Castiñeiras <jesus@germade.es>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */

(function (root, factory) {

  if ( typeof window === 'undefined' ) {
    if ( typeof module !== 'undefined' ) {
      module.exports = factory();
    }
  } else {
    if ( typeof fn === 'function' ) {
      fn.define('$', factory );
    } else if( typeof angular === 'function' ) {
      angular.module('jqlite', []).constant('jqlite', factory());
    } else if ( typeof define === 'function' && define.amd ) {
      define(['$'], factory);
    } else {
      root.jqlite = factory();
      if( !root.$ ) {
        root.$ = root.jqlite;
      }
    }
  }

})(this, function () {
  'use strict';

  if( !Element.prototype.matchesSelector ) {
    Element.prototype.matchesSelector = (
      Element.prototype.webkitMatchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector
    );
  }

  function stopEvent (e) {
    if(e) e.stopped = true;
    if (e &&e.preventDefault) e.preventDefault();
    else if (window.event && window.event.returnValue) window.eventReturnValue = false;
  }

  var triggerEvent = document.createEvent ? function (element, eventName, args, data) {
      var event = document.createEvent("HTMLEvents");
      event.data = data;
      event.args = args;
      event.initEvent(eventName, true, true);
      element.dispatchEvent(event);
      return event;
    } : function (element, eventName, args, data) {
      var event = document.createEventObject();
      event.data = data;
      event.args = args;
      element.fireEvent("on" + eventName, event);
      return event;
    };

  var RE_HAS_SPACES = /\s/,
      RE_ONLY_LETTERS = /^[a-zA-Z]+$/,
      RE_IS_ID = /^\#[^\.\[]/,
      RE_IS_CLASS = /^\.[^#\[]/,
      runScripts = eval,
      noop = function () {},
      auxArray = [],
      auxDiv = document.createElement('div'),
      detached = document.createElement('div'),
      classListEnabled = !!auxDiv.classList;

  // Events support

  var attachElementListener = noop, detachElementListener = noop;

  if( auxDiv.addEventListener )  { // W3C DOM

    attachElementListener = function (element, eventName, listener) {
      listener.$listener = function(e){
          listener.apply(e.target,[e].concat(e.args));
      };

      element.addEventListener(eventName, listener.$listener,false);
    };

    detachElementListener = function (element, eventName, listener) {
      element.removeEventListener(eventName, listener.$listener || listener, false);
    };


  } else if(document.body.attachEvent) { // IE DOM

    attachElementListener = function (element, eventName, listener) {
      listener.$listener = function(e){
          listener.apply(e.target,[e].concat(e.args));
      };

      element.attachEvent("on" + eventName, listener.$listener, false);
    };

    detachElementListener = function (element, eventName, listener) {
      element.detachEvent('on' + eventName, listener.$listener || listener );
    };

  } else {
    throw 'Browser not compatible with element events';
  }

  // jqlite function

  function pushMatches( list, matches ) {
    for( var i = 0, len = matches.length; i < len; i++ ) {
        list[i] = matches[i];
    }
    list.length += len;
    return list;
  }

  function stringMatches (selector) {
    switch ( selector[0] ) {
      case '#':
        var found = document.querySelector(selector);
        if( found ) {
          var listdom = new ListDOM();
          listdom[0] = found;
          listdom.length = 1;
          return listdom;
        } else return pushMatches( new ListDOM(), document.querySelectorAll(selector) );
        break;
      case '<':
        auxDiv.innerHTML = selector;
        var jChildren = pushMatches( new ListDOM(), auxDiv.children );
        jqlite.plugin.init(jChildren);
        return jChildren;
      default:
        return pushMatches( new ListDOM(), document.querySelectorAll(selector) );
    }
  }

  function initList(selector) {

    if( selector instanceof Array || selector instanceof NodeList || selector instanceof HTMLCollection ) {
      return pushMatches( new ListDOM(), selector );
    }

    if( selector === document || selector instanceof HTMLElement || selector instanceof Element ) {
      var list2 = new ListDOM();
      list2[0] = selector;
      list2.length = 1;
      return list2;
    }

    if( selector instanceof Function ) ready(selector);
  }
  
  function jqlite (selector){
    if( typeof selector === 'string' ) {
      return stringMatches(selector);
    }
    return initList(selector);
  }

  jqlite.fn = ListDOM.prototype;

  jqlite.noop = noop;

  // document ready

  function ready (callback) {
    if( callback instanceof Function ) {
      if( ready.ready ) {
        callback.call(document);
      } else {
        ready.onceListeners.push(callback);
      }
    } else if ( callback === undefined ) {
      return ready.isReady;
    }
  }

  ready.isReady = false;
  ready.ready = function () {
    ready.isReady = true;
    for( var i = 0, len = ready.onceListeners.length; i < len; i++) {
      ready.onceListeners[i].call(document);
    }
    ready.onceListeners.splice(0, len);
  };
  ready.onceListeners = [];

  if ( document.addEventListener ) {
    ready._listener = function () {
      document.removeEventListener( "DOMContentLoaded", ready._listener, false );
      ready.ready();
    };
    document.addEventListener( "DOMContentLoaded", ready._listener, false );
  } else if ( document.attachEvent ) {
    ready._listener = function () {
      if ( document.readyState === "complete" ) {
        var args = arguments;
        document.detachEvent( "onreadystatechange", ready._listener );
        ready.ready();
      }
    };
    document.attachEvent("onreadystatechange", ready._listener);
  }

  // ListDOM
    
  function ListDOM(){}
  
  ListDOM.prototype = [];
  ListDOM.prototype.ready = ready;

  ListDOM.prototype.get = function(pos) {
      return pos ? this[pos] : this;
    };

  ListDOM.prototype.eq = function(pos) {
      var item = ( pos < 0 ) ? this[this.length - pos] : this[pos], list = new ListDOM();

      if(item) {
        list[0] = item;
      }
      return list; 
    };

  ListDOM.prototype.find = function(selector) {
      var elems = new ListDOM(), found, i, len;

      if( this.length === 1 ) {
        found = this[0].querySelectorAll(selector);
        for( i = 0, len = found.length; i < len; i++ ) {
          elems[i] = found[i];
        }
        elems.length = len;
      } else if( this.length > 1 ) {
        var j, len2;
        for( i = 0, len = this.length; i < len; i++ ) {
            found = this[i].querySelectorAll(selector);
            for( j = 0, len2 = found.length; j < len2 ; j++ ) {
                if( !found.item(j).___found___ ) {
                    elems[elems.length] = found.item(j);
                    elems.length++;
                    found.item(j).___found___ = true;
                }
            }
        }
        for( i = 0, len = elems.length; i < len ; i++ ) {
          delete elems[i].___found___;
        }
      }

      return elems;
    };
  ListDOM.prototype.$ = ListDOM.prototype.find;

  ListDOM.prototype.each = function(each) {
      if( each instanceof Function ) {
        for( var i = 0, len = this.length, elem; i < len ; i++ ) {
            each.call(this[i], i, this[i]);
        }
      }
      return this;
    };

  ListDOM.prototype.empty = function(each) {
      if( each instanceof Function ) {
        for( var i = 0, len = this.length, elem, child; i < len ; i++ ) {
            elem = this[i];
            child = elem.firstChild;
            while( child ) {
              elem.removeChild(child);
              child = elem.firstChild;
            }
        }
      }
      return this;
    };

  ListDOM.prototype.filter = function(selector) {
      var elems = new ListDOM(), elem, i, len;
      
      if( selector instanceof Function ) {
        for( i = 0, len = this.length, elem; i < len ; i++ ) {
          elem = this[i];
          if( selector.apply(elem,[elem]) ) {
            elems.push(elem);
          }
        } 
      } else if( typeof selector === 'string' ) {
          for( i = 0, len = this.length, elem; i < len ; i++ ) {
            elem = this[i];
            if( Element.prototype.matchesSelector.call(elem,selector) ) {
              elems.push(elem);
            }
          }
      }
      return elems;
    };

  ListDOM.prototype.closest = function(selector) {
      var elems = new ListDOM(), i, len, elem;

      if( !selector ) {
        return this;
      }

      if( this.length === 1 ) {
        
        elem = this[0].parentElement;

        while( elem ) {
          if( elem.matchesSelector(selector) ) {
            elems.push(elem);
            break;
          }
          elem = elem.parentElement;
        }

      } else if( this.length > 1 ) {

        var j, len2;

        for( i = 0, len = this.length; i < len; i++ ) {

          elem = this[i].parentElement;
          while( elem ) {
            if( elem.matchesSelector(selector) ) {
              if( !elem.___found___ ) {
                elem.___found___ = true;
                elems.push(elem);
              }
              break;
            }
            elem = elem.parentElement;
          }
        }
        for( i = 0, len = elems.length; i < len ; i++ ) {
          delete elems[i].___found___;
        }
      }

      return elems;
    };

  ListDOM.prototype.children = auxDiv.children ? function (selector){
      var elems = new ListDOM();
      
      for( var i = 0, len = this.length; i < len; i++ ) {
        pushMatches(elems, this[i].children);
      }
        
      if( selector ) {
        return elems.filter(selector);
      }
      return elems;

    } : function (selector) {
      var elems = new ListDOM(), elem;

      Array.prototype.forEach.call(this,function(elem){
        elem = elem.firstElementChild || elem.firstChild;
        while(elem) {
          elems[elems.length] = elem;
          elem = elem.nextElementSibling || elem.nextSibling;
        }
      });

      if( selector ) {
        return elems.filter(selector);
      }
      return elems;
    };

  ListDOM.prototype.contents = function (selector) {
      var elems = new ListDOM(), elem;

      Array.prototype.forEach.call(this,function(elem){
        elem = elem.firstChild;
        while(elem) {
          elems[elems.length] = elem;
          elem = elem.nextSibling;
        }
      });

      if( selector ) {
        return elems.filter(selector);
      }
      return elems;
    };

    // function _cloneEvents(nodeSrc, nodeDest) {
    //   console.log('getEventListeners', getEventListeners);
    //   var events = getEventListeners(nodeSrc),
    //       e, i, len;

    //   for( e in events ) {
    //     for( i = 0, len = events[e].length; i < len ; i++ ) {
    //       nodeDest.addEventListener(e, events[e][i].listener, events[e][i].useCapture);
    //     }
    //   }
    // }

  ListDOM.prototype.clone = function (deep, cloneEvents) {
    var list = new ListDOM(), i, len;

    if( deep === undefined ) {
      deep = true;
    }

    for( i = 0, len = this.length; i < len ; i++ ) {
      list[i] = this[i].cloneNode(deep);

      // if(cloneEvents) {
      //   _cloneEvents(this[i], list[i]);
      // }
    }

    list.length = len;

    return list;
  };

  ListDOM.prototype.data = auxDiv.dataset ? function (key, value) {
      var i, len;

      if( value === undefined ) {
        if( key === undefined ) {
          return this[0] ? this[0].dataset : {};
        } else {
          return ( this[0] || {} ).dataset[key];
        }
      } else {
        for( i = 0, len = this.length; i < len ; i++ ) {
          this[i].dataset[key] = value;
        }
        return this;
      }
    } : function (key, value) {
      var i, len;
      if( value === undefined ) {
        var values = [];
        for( i = 0, len = this.length; i < len ; i++ ) {
          values.push( this[i].getAttribute('data-' + key) );
        }
        return ( this[0] || { getAttribute: function() { return false; } } ).getAttribute(key);
      } else {
        for( i = 0, len = this.length; i < len ; i++ ) {
          this[i].setAttribute('data-' + key, value);
        }
      }
    };

  ListDOM.prototype.removeData = auxDiv.dataset ? function (key) {
      var i, len;
      if( typeof key === 'string' ) {
        for( i = 0, len = this.length; i < len ; i++ ) {
          delete this[i].dataset[key];
        }
      } else if( key instanceof Array ) {
        for( i = 0, len = key.length; i < len ; i++ ) {
          this.removeData(key[i]);
        }
      }
      return this;
    } : function (key) {
      var i, len;
      if( typeof key === 'string' ) {
        for( i = 0, len = this.length; i < len ; i++ ) {
          this[i].removeAttribute('data-' + key);
        }
      } else if( key instanceof Array ) {
        for( i = 0, len = key.length; i < len ; i++ ) {
          this.removeData(key[i]);
        }
      }
      return this;
    };

  ListDOM.prototype.attr = function (key, value) {
      var i, len;
      if( value instanceof Function ) {
        for( i = 0, len = this.length; i < len ; i++ ) {
          this[i].setAttribute( key, value(i, this[i].getAttribute(key) ) );
        }
      } else if( value !== undefined ) {
        for( i = 0, len = this.length; i < len ; i++ ) {
          this[i].setAttribute(key,value);
        }
      } else if( this[0] ) {
        return this[0].getAttribute( key );
      }
      return this;
    };

  ListDOM.prototype.removeAttr = function (key) {
      for( var i = 0, len = this.length; i < len ; i++ ) {
        this[i].removeAttribute(key);
      }
      return this;
    };

  ListDOM.prototype.prop = function (key, value) {
      var i, len;

      if( value instanceof Function ) {
        for( i = 0, len = this.length; i < len ; i++ ) {
          this[i][key] = value( i, this[i][key] );
        }
      } else if( value !== undefined ) {
        for( i = 0, len = this.length; i < len ; i++ ) {
          this[i][key] = value;
        }
      } else if( this[0] ) {
        return this[0][key];
      }
      return this;
    };

  ListDOM.prototype.val = function (value) {
      var element;
      if( value === undefined ) {
        element = this[0];
        if( element.nodeName === 'select' ) {
          return element.options[element.selectedIndex].value;
        } else {
          return ( this[0].value || this[0].getAttribute('value') );
        }
      } else {
        for( var i = 0, len = this.length; i < len ; i++ ) {
          if( this[i].nodeName === 'select' ) {
            element = this[i];
            for( var j = 0, len2 = element.options.length; j < len2 ; j++ ) {
              if( element.options[j].value === value ) {
                element.options[j].selected = true;
                break;
              }
            }
          } else if (this[i].value !== undefined) {
            this[i].value = value;
          } else {
            this[i].setAttribute('value', value);
          }
        }
      }
      return this;
    };

  ListDOM.prototype.addClass = classListEnabled ? function (className) {
      for( var i = 0, len = this.length; i < len ; i++ ) {
          this[i].classList.add(className);
      }
      return this;
    } : function (className) {
      var RE_CLEANCLASS = new RegExp('\\b' + (className || '') + '\\b','');

      for( var i = 0, len = this.length; i < len ; i++ ) {
          this[i].className = this[i].className.replace(RE_CLEANCLASS,'') + ' ' + className;
      }
      return this;
    };

  ListDOM.prototype.removeClass = classListEnabled ? function (className) {
      for( var i = 0, len = this.length; i < len ; i++ ) {
          this[i].classList.remove(className);
      }
      return this;
    } : function (className) {
      var RE_REMOVECLASS = new RegExp('(\\b|\\s+)'+className+'\\b','g');

      for( var i = 0, len = this.length; i < len ; i++ ) {
          this[i].className = this[i].className.replace(RE_REMOVECLASS,'');
      }
      return this;
    };

  ListDOM.prototype.hasClass = classListEnabled ? function (className) {
      for( var i = 0, len = this.length; i < len ; i++ ) {
          if( this[i].classList.item(className) ) {
              return true;
          }
      }
      return false;
    } : function (className) {
      var RE_HASCLASS = new RegExp('\\b' + (className || '') + '\\b','');

      for( var i = 0, len = this.length; i < len ; i++ ) {
          if( RE_HASCLASS.test(this[i].className) ) {
              return true;
          }
      }
      return false;
    };

  ListDOM.prototype.toggleClass = classListEnabled ? function (className, add) {
      var i, len;

      if( className === undefined ) {
        for( i = 0, len = this.length; i < len ; i++ ) {
          if ( this[i].classList.item(className) ) {
            this[i].classList.remove(className);
          } else {
            this[i].classList.add(className);
          }
        }
      } else if( add ) {
        for( i = 0, len = this.length; i < len ; i++ ) {
          this[i].classList.add(className);
        }
      } else {
        for( i = 0, len = this.length; i < len ; i++ ) {
          this[i].classList.remove(className);
        }
      }
      return this;
    } : function (className, add) {
      var i, len,
          RE_HASCLASS = new RegExp('\\b' + (className || '') + '\\b',''),
          RE_CLEANCLASS = new RegExp('\\b' + (className || '') + '\\b',''),
          RE_REMOVECLASS = new RegExp('(\\b|\\s+)'+className+'\\b','g');

      if( className === undefined ) {
        for( i = 0, len = this.length; i < len ; i++ ) {
          if ( RE_HASCLASS.test(this[i].className) ) {
            this[i].className = this[i].className.replace(RE_REMOVECLASS, '');
          } else {
            this[i].className = this[i].className.replace(RE_CLEANCLASS, '') + ' ' + className;
          }
        }
      } else if( add ) {
        for( i = 0, len = this.length; i < len ; i++ ) {
          this[i].className = this[i].className.replace(RE_CLEANCLASS, '') + ' ' + className;
        }
      } else {
        for( i = 0, len = this.length; i < len ; i++ ) {
          this[i].className = this[i].className.replace(RE_REMOVECLASS, '');
        }
      }
      return this;
    };

  ListDOM.prototype.append = function (content) {
      var jContent = $(content), jContent2, i, j, len, len2, element;

      jContent.remove();

      for( i = 0, len = this.length; i < len; i++ ) {
        jContent2 = jContent.clone(true);
        element = this[i];
        for( j = 0, len2 = jContent2.length; j < len2; j++ ) {
          element.appendChild(jContent2[j]);
        }
      }

      return this;
    };

  ListDOM.prototype.prepend = function (content) {
      var jContent = $(content), jContent2, i, j, len, len2, element, previous;

      jContent.remove();

      for( i = 0, len = this.length; i < len; i++ ) {
        jContent2 = jContent.clone(true);
        element = this[i];
        previous = element.firstChild;

        if( previous ) {
          console.log(jContent2);
          for( j = 0, len2 = jContent2.length; j < len2; j++ ) {
            element.insertBefore(jContent2[j], previous);
          }
        } else {
          for( j = 0, len2 = jContent2.length; j < len2; j++ ) {
            element.appendChild(jContent2[j]);
          }
        }

      }

      return this;
    };

  ListDOM.prototype.after = function (content) {
      var jContent = $(content), jContent2, i, j, len, len2, element, parent;

      jContent.remove();

      for( i = 0, len = this.length; i < len; i++ ) {
        jContent2 = jContent.clone(true);
        parent = this[i].parentElement || this[i].parentNode;
        element = this[i].nextElementSibling || this[i].nextSibling;
        if( element ) {
          for( j = 0, len2 = jContent2.length; j < len2; j++ ) {
            parent.insertBefore(jContent2[j], element);
            element = jContent2[j];
          }
        } else {
          for( j = 0, len2 = jContent2.length; j < len2; j++ ) {
            parent.appendChild(jContent2[j]);
          }
        }
      }

      return this;
    };

  ListDOM.prototype.replaceWith = function (content) {
      var jContent = $(content), jContent2, i, j, len, len2, element, parent, next;

      jContent.remove();

      for( i = 0, len = this.length; i < len; i++ ) {
        jContent2 = jContent.clone(true);
        element = this[i];
        parent = element.parentElement || parentNode;

        parent.replaceChild(jContent2[0], element);

        if( jContent2[1] ) {
          next = jContent2[0];
          for( j = 1, len2 = jContent2.length; j < len2; j++ ) {
            parent.insertBefore(jContent2[j], next);
          }
        }

      }

      return this;
    };

  ListDOM.prototype.wrap = function (content) {
      var jContent = $(content), jContent2, i, j, len, len2, element, parent;

      jContent.remove();

      for( i = 0, len = this.length; i < len; i++ ) {
        jContent2 = jContent.clone(true);
        parent = this[i].parentElement || this[i].parentNode;
        element = this[i].nextElementSibling || this[i].nextSibling;
        if( element ) {
          for( j = 0, len2 = jContent2.length; j < len2; j++ ) {
            parent.insertBefore(jContent2[j], element);
            element = jContent2[j];
          }
        } else {
          for( j = 0, len2 = jContent2.length; j < len2; j++ ) {
            parent.appendChild(jContent2[j]);
          }
        }

        if( jContent2[0] ) {
          element = jContent2[0];
          while( element.firstElementChild ) {
            element = element.firstElementChild;
          }
          element.appendChild(this[i]);
        }
      }

      return this;
    };

  ListDOM.prototype.next = function (selector) {
      var list = new ListDOM(), elem;

      for( var i = 0, len = this.length; i < len; i++ ) {
        elem = this.nextElementSibling || this.nextSibling;
        if( elem ) {
          list.push(this[i]);
        }
      }

      return ( typeof selector === 'string' ) ? list.filter(selector): list;
    };

  ListDOM.prototype.parent = function (selector) {
      var list = new ListDOM(), elem;

      for( var i = 0, len = this.length; i < len; i++ ) {
        elem = this.parentElement || this.parentNode;
        if( elem ) {
          list.push(this[i]);
        }
      }

      return ( typeof selector === 'string' ) ? list.filter(selector): list;
    };

  ListDOM.prototype.remove = function (selector) {
      var list = selector ? this.filter(selector) : this, parent;

      for( var i = 0, len = list.length; i < len; i++ ) {
        parent = list[i].parentElement || list[i].parentNode;
        if( parent ) {
          parent.removeChild(list[i]);
        }
      }

      return this;
    };

  ListDOM.prototype.detach = function (selector) {
      var list = selector ? this.filter(selector) : this,
          elems = new ListDOM();

      for( var i = 0, len = list.length; i < len; i++ ) {
        detached.appendChild(list[i]);
        elems.push(list[i]);
      }

      return elems;
    };

  ListDOM.prototype.css = function (key, value) {

      if( value ) {
        for( var i = 0, len = this.length; i < len; i++ ) {
          this[i].style[key] = value;
        }
        return this;
      } else if( this[0] ) {
        return this[0].style[key] || window.getComputedStyle(this[0])[key];
      }

      return '';
    }; 

  ListDOM.prototype.html = function (html) {
      var i, len;
      if( html === undefined ) {
        html = '';
        for( i = 0, len = this.length; i < len; i++ ) {
          text += this[i].innerHTML;
        }
        return this;
      } else if( html === true ) {
        html = '';
        for( i = 0, len = this.length; i < len; i++ ) {
          text += this[i].outerHTML;
        }
        return this;
      } else {
        if( html instanceof Function ) {
          for( i = 0, len = this.length; i < len; i++ ) {
            this[i].innerHTML = html(i, this[i].innerHTML);
          }
          return this;
        } else {
          for( i = 0, len = this.length; i < len; i++ ) {
            this[i].innerHTML = html;
          }
        }
        this.find('script').each(function(script){
          if( script.type == 'text/javascript' ) {
            try{ runScripts('(function(){ \'use strict\';' + script.textContent + '})();'); }catch(err){ throw err.message; }
          }
        });
        jqlite.plugin.init(this);
      }
      return this;
    };

    jqlite.$doc = jqlite(document);

    jqlite.plugin = function (selector, handler, collection) {
      if( typeof selector === 'string' && handler instanceof Function ) {
        jqlite.plugin.cache[selector] = handler;
        jqlite.plugin.cache[selector]._collection = !!collection;
      }

      if( ready() ) {
        jqlite.plugin.init(jqlite.$doc);
      } else {
        ready(function () {
          jqlite.plugin.init(jqlite.$doc);
        });
      }
    };
    jqlite.plugin.cache = {};

    jqlite.plugin.init = function (jBase) {
      var pluginsCache = jqlite.plugin.cache, pluginSelector, handler, elements;

      for( pluginSelector in pluginsCache ) {

        handler = pluginsCache[pluginSelector];
        elements = jBase.find(pluginSelector);

        if( elements.length ) {
          if( handler._collection ) {
            handler( elements );
          } else {
            elements.each(handler);
          }
        }
      }

    };
    jqlite.widget = function (widgetName, handler, collection) {
      jqlite.plugin('[data-widget="' + widgetName + '"]', handler, collection);
    };

  ListDOM.prototype.text = function (text) {
      var i, len;
      if( text === undefined ) {
        text = '';
        for( i = 0, len = this.length; i < len; i++ ) {
          text += this[i].textContent;
        }
        return this;
      } else if( text instanceof Function ) {
        for( i = 0, len = this.length; i < len; i++ ) {
          this[i].textContent = text(i, this[i].textContent);
        }
        return this;
      } else {
        for( i = 0, len = this.length; i < len; i++ ) {
          this[i].textContent = text;
        }
        return this;
      }
    };

  ListDOM.prototype.on = function (eventName, listener) {
    if( typeof eventName !== 'string' || !(listener instanceof Function) ) {
      throw 'bad arguments';
    }

    for( var i = 0, len = this.length; i < len; i++ ) {
      attachElementListener(this[i], eventName, listener);
    }
  };

  var eventActions = {
    list: ['click', 'focus', 'blur', 'submit'],
    define: function (name) {
      ListDOM.prototype[name] = function (listener) {
        if( listener ) {
          this.on(name, listener);
        } else {
          for( var i = 0, len = this.length; i < len; i++ ) {
            this[i][name]();
          }
        }
      };
    },
    init: function () {
      for( var i = 0, len = eventActions.list.length, name; i < len; i++ ) {
        eventActions.define(eventActions.list[i]);
      }
    }
  };
  eventActions.init();

  function autoDestroyListener (element, eventName, listener) {
    var _listener = function () {
      detachElementListener(element, eventName, _listener);
      listener();
    };

    return _listener;
  }

  ListDOM.prototype.one = function (eventName, listener) {
    if( typeof eventName !== 'string' || !(listener instanceof Function) ) {
      throw 'bad arguments';
    }

    var element;

    for( var i = 0, len = this.length; i < len; i++ ) {
      element = this[i];
      attachElementListener(element, eventName, autoDestroyListener(element, eventName, listener) );
    }
  };
  ListDOM.prototype.once = ListDOM.prototype.one;

  ListDOM.prototype.off = function (eventName, listener) {
    if( typeof eventName !== 'string' || !(listener instanceof Function) ) {
      throw 'bad arguments';
    }

    for( var i = 0, len = this.length; i < len; i++ ) {
      detachElementListener(this[i], eventName, listener);
    }
  };

  ListDOM.prototype.trigger = function (eventName, args, data) {
    if( typeof eventName !== 'string' ) {
      throw 'bad arguments';
    }

    for( var i = 0, len = this.length; i < len; i++ ) {
      triggerEvent(this[i], eventName, args, data);
    }
  };

  ListDOM.prototype.stopPropagation = function () {
    for( var i = 0, len = arguments.length; i < len; i++ ) {
      this.on(arguments[i], function (e) {
        e.stopPropagation();
      });
    }
  };

  // finally

  return jqlite;
  
});

/*  ----------------------------------------------------------------------------------------- */


// cookies.js library from https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
// adapted to be used with jstools-core

(function (cookie) {

  if ( typeof window === 'undefined' ) {
    if ( typeof module !== 'undefined' ) {
      module.exports = cookie;
    }
  } else {
    if ( window.fn ) {
      fn.define('cookie', cookie)
    } else if( !window.cookie ) {
      window.cookie = cookie;
    }
  }

})(function(){
    'use strict';

    function cookie (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if( sValue ) {
            cookie.set(sKey, sValue, vEnd, sPath, sDomain, bSecure);
        } else {
            return cookie.get(sKey);
        }
    }

    cookie.get = function (sKey) {
        if (!sKey) { return null; }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    };

    cookie.set = function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                break;
                case String:
                    sExpires = "; expires=" + vEnd;
                break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    };

    cookie.remove = function (sKey, sPath, sDomain) {
        if (!cookie.hasKey(sKey)) { return false; }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true;
    };

    cookie.hasKey = function (sKey) {
        if (!sKey) { return false; }
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    };

    cookie.keys = function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
        return aKeys;
    }

    return cookie;
});

/*  ----------------------------------------------------------------------------------------- */

/*
 * events.js - Single library to handle generic events

 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Jesús Manuel Germade Castiñeiras <jesus@germade.es>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */

(function (definition) {

  if ( typeof window === 'undefined' ) {
    if ( typeof module !== 'undefined' ) {
      module.exports = definition();
    }
  } else {
    if ( window.fn ) {
      fn.define('Events', definition );
    } else if( !window.Events ) {
      window.Events = definition();
    }
  }

})(function () {
	'use strict';

	function _addListener (handlers, handler, context) {
        if( ! handler instanceof Function ) {
            return false;
        }
        handlers.push({ handler: handler, context: context });
    }

    function _triggerEvent (handlers, data, caller) {
        if( handlers ) {
            for( var i = 0, len = handlers.length; i < len; i++ ) {
                handlers[i].handler.call(caller, data);
            }
            return len;
        }
    }

    function _emptyListener (handlers) {
        if( handlers ) {
            handlers.splice(0, handlers.length);
        }
    }

    function _removeListener (handlers, handler) {
        if( handlers ) {
            for( var i = 0, len = handlers.length; i < len; ) {
                if( handlers[i].handler === handler ) {
                    handlers.splice(i, 1);
                    len--;
                } else {
                    i++;
                }
            }
        }
    }

    function Events (target) {
        target = target || this;
        var listeners = {};
        var listenersOnce = {};

        target.on = function (eventName, handler, context) {
            listeners[eventName] = listeners[eventName] || [];
            _addListener(listeners[eventName], handler, context);
        };

        target.once = function (eventName, handler, context) {
            listenersOnce[eventName] = listenersOnce[eventName] || [];
            _addListener(listenersOnce[eventName], handler, context);
        };

        target.trigger = function (eventName, data, caller) {
            _triggerEvent(listeners[eventName], data, caller);

            var len = _triggerEvent(listenersOnce[eventName], data, caller);
            if( len ) {
                listenersOnce[eventName].splice(0, len);
            }
        };

        target.off = function (eventName, handler) {
            if( handler === undefined ) {
                _emptyListener(listeners[eventName]);
                _emptyListener(listenersOnce[eventName]);
            } else {
                _removeListener(listeners[eventName], handler);
                _removeListener(listenersOnce[eventName], handler);
            }
        };
    }

    return Events;
});

/*  ----------------------------------------------------------------------------------------- */


(function (definition) {
	'use strict';
	
	if ( typeof window !== 'undefined' ) {
		if ( window.fn ) {
			fn.define('http', [ 'Promise', definition ]);
		} else if( typeof Promise !== 'undefined' ) {
			window.http = definition(Promise);
		} else {
			throw 'Promise is required for http to be defined';
		}
	}

})(function (Promise) {
	'use strict';

	function ajax(url, args){

        if( !args ) args = ( url instanceof Object ) ? url : {};
        if( args.url ) url = args.url;
        if( !url ) return false;
        
        if( !args.method ) args.method = 'GET';
        
        if( !args.contentType ) {
            if( /^json$/i.test(args.mode) ) args.contentType = 'application/json';
            else args.contentType = 'application/x-www-form-urlencoded';
        }
        
        if( /^json$/i.test(args.mode) && isObject(args.data) ) args.data = JSON.stringify(args.data);
        
        var request = null;
        try	{ // Firefox, Opera 8.0+, Safari
            request = new XMLHttpRequest();
        } catch (e) { // Internet Explorer
            try { request = new ActiveXObject("Msxml2.XMLHTTP"); }
            catch (e) { request = new ActiveXObject("Microsoft.XMLHTTP"); }
        }
        if (request===null) { throw "Browser does not support HTTP Request"; }
	        
		var p = new Promise(function (resolve, reject) {

	        request.open(args.method,url,(args.async === undefined) ? true : args.async);
	        request.onreadystatechange=function(){
	            if( request.readyState == 'complete' || request.readyState == 4 ) {
	                if( request.status >= 200 && request.status <300 ) {
	                	var data = /^json$/i.test(args.mode) ? JSON.parse(request.responseText) : ( /^xml$/i.test(args.mode) ? request.responseXML : request.responseText );
	                	resolve(data, request.status, request);
	                } else {
	                    var data = /^json$/i.test(args.mode) ? JSON.parse(request.responseText) : ( /^xml$/i.test(args.mode) ? request.responseXML : request.responseText );
	                    reject(data, request.status, request);
	                }
	            }
	        }
	        
	        request.setRequestHeader('Content-Type',args.contentType);
	        request.setRequestHeader('X-Requested-With','XMLHttpRequest');
	        
	        if( args.headers ) {
	        	for( var header in args.headers ) {
	                request.setRequestHeader(header,args.headers[header]);
	        	}
	        }
	        
	        request.send(args.data);
		});

		p.request = request;

		return p;
    }

    return ajax;
});

/*  ----------------------------------------------------------------------------------------- */

/*
 * css.js
 *
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Jesús Manuel Germade Castiñeiras <jesus@germade.es>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */

(function () {

	function addWhen (Promise) {
		if( !Promise.when ) {
			Promise.when = function (p) {
				p = p || {};
	            return new Promise(function (resolve, reject) {
	                if( p ) {
	                    if( typeof p.then === 'function' ) {
	                        p.then(resolve, reject);
	                    } else {
	                        setTimeout(function () {
	                            resolve();
	                        }, 0);
	                    }
	                } else {
	                    setTimeout(function () {
	                        reject();
	                    }, 0);
	                }
	            });
	        };
		}
	}

	if( typeof window === 'undefined' ) {
		var Promise = require('promise-es6').Promise;
		addWhen(Promise);
		if ( typeof module !== 'undefined' ) {
			module.exports = Promise;
		}
	} else {
		if( typeof window.Promise === 'undefined' ) {
			throw 'Promise not found';
		} else {
			addWhen(window.Promise);

			if( typeof fn !== 'undefined' ) {
				fn.define('Promise', function () { return Promise; });
			}
		}
	}

})();