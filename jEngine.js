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

(function ($) {

  if ( typeof window === 'undefined' ) {
    if ( typeof module !== 'undefined' ) {
      module.exports = $;
    }
  } else {
    if ( window.fn ) {
      fn.define('$', $)
    } else if( !window.$ ) {
      window.$ = $;
    }
  }

})(function () {
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
  
  function triggerEvent (element,name,data){
    var event; // The custom event that will be created
    
    if (document.createEvent) {
      event = document.createEvent("HTMLEvents");
      event.data = data;
      event.initEvent(name, true, true);
    } else {
      event = document.createEventObject();
      event.data = data;
    }
    
    if(document.createEvent) element.dispatchEvent(event);
    else element.fireEvent("on" + event.eventType, event);
    
    return event;
  }

  var RE_HAS_SPACES = /\s/,
      RE_ONLY_LETTERS = /^[a-zA-Z]+$/,
      RE_IS_ID = /^\#.+/,
      RE_IS_CLASS = /^\..+/
      ready = function (arg) {
        if( callback instanceof Function ) {
          if( ready.ready ) {
            callback.call(document);
          } else {
            ready.onceListeners.push(callback);
          }
        } else if ( callback === undefined ) {
          return ready.isReady;
        }
      };

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
      document.addEventListener( "DOMContentLoaded", function(){
        document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
        ready.ready();
      }, false );
  } else if ( document.attachEvent ) {
    document.attachEvent("onreadystatechange", function(){
      if ( document.readyState === "complete" ) {
        document.detachEvent( "onreadystatechange", arguments.callee );
        ready.ready();
      }
    });
  }

  // List of elements
    
  function listDOM(elems){
      if( typeof elems === 'string' ) {
        if( RE_HAS_SPACES.test(elems) ) [].push.apply(this,document.querySelectorAll(elems));
        else {
          if( RE_ONLY_LETTERS.test(elems) ) [].push.apply(this,document.getElementsByTagName(elems));
          else if( RE_IS_ID.test(elems) ) [].push.call(this,document.getElementById(elems.substr(1)));
          else if( RE_IS_CLASS.test(elems) ) [].push.apply(this,document.getElementsByClassName(elems.substr(1)));
          else [].push.apply(this,document.querySelectorAll(elems));
        }
      }
      else if( elems instanceof Array ) [].push.apply(this,elems);
      else if( elems instanceof NodeList ) [].push.apply(this,elems);
      else if( elems instanceof HTMLCollection ) [].push.apply(this,elems);
      else if( elems instanceof Element ) [].push.call(this,elems);
      else if( elems instanceof Function ) ready(elems);
      else if( elems === document ) [].push.call(this,elems);
  }
  
  listDOM.prototype = new Array();
  
  listDOM.fn = function(name,elementDo,collectionDo) {
      if( typeof name === 'string' ) {
          if( elementDo instanceof Function ) {
              if( !Element.prototype[name] ) Element.prototype[name] = elementDo;
          }
          if( collectionDo instanceof Function ) {
            listDOM.prototype[name] = collectionDo;
            NodeList.prototype[name] = collectionDo;
          }
      } else if( name instanceof Object && arguments.length == 1 ) {
          for( var key in name ) {
            listDOM.fn(key,name[key].element,name[key].collection);
          }
      }
  };
  
  listDOM.fn({
     'get': {
          element: function(){ return this; },
          collection: function(pos){ return this[pos]; }
     },
     'find': {
          element: function(selector){
              return new listDOM( Element.prototype.querySelectorAll.apply(this,arguments) );
          },
          collection: function(selector,test){
              var elems = new listDOM(), found, list_found = {};
              
              for( var i = 0, len = this.length; i < len; i++ ) {
                  found = this[i].querySelectorAll(selector);
                  for( var j = 0, len2 = found.length; j < len2 ; j++ ) {
                      if( !found.item(j).__found ) {
                          elems.push(found.item(j));
                          found.item(j).__found = true;
                      }
                  }
              }
              for( var i = 0, len = elems.length; i < len ; i++ ) delete elems[i].__found;
              
              return elems;
          }
     },
     'each': {
          element: function(each){
              if( each instanceof Function ) each.call(this,this);
              return this;
          },
          collection: function(each){
              if( each instanceof Function ) {
                for( var i = 0, len = this.length, elem; i < len ; i++ ) {
                    each.call(this[i], this[i]);
                }
              }
              return this;
          }
     },
     'filter': {
          element: function(selector){
              return Element.prototype.matchesSelector.call(this,selector) ? this : false;
          },
          collection: function(selector){
              var elems = [];
              
              if( selector instanceof Function ) {
                for( var i = 0, len = this.length, elem; i < len ; i++ ) {
                    elem = this[i];
                    if( selector.apply(elem,[elem]) ) elems.push(elem);
                }
                  
                return new listDOM(elems);
                  
              } else if( typeof selector === 'string' ) {
                  for( var i = 0, len = this.length, elem; i < len ; i++ ) {
                    elem = this[i];
                    if( Element.prototype.matchesSelector.call(elem,selector) ) elems.push(elem);
                  }
                  
                  return new listDOM(elems);
              }
              return false;
          }
     },
     'children': {
        element: false,
        collection: function(selector,args){
          var elems = [], elem;
          
          if( document.body.children ) {
            
            elems = new listDOM();
            
            Array.prototype.forEach.call(this,function(elem){
              [].push.apply(elems,elem.children);
            });
              
            if( selector ) {
              if( isString(selector) ) {
                elems = elems.filter(selector);
              } else if( isFunction(selector) ) elems.each(selector);
            }
            
            return elems;
            
          } else if( isString(selector) ) {
            Array.prototype.forEach.call(this,function(elem){
              elem = elem.firstElementChild || elem.firstChild;
              
              while(elem) {
                        if( elem && Element.prototype.matchesSelector.call(elem,selector) ) elems.push(elem);
                        elem = elem.nextElementSibling;
              }
            });
          } else if( isFunction(selector) ) {
            Array.prototype.forEach.call(this,function(elem){
              elem = elem.firstElementChild || elem.firstChild;
              while(elem) {
                elems.push(elem);
                selector.apply(elem,args);
                elem = elem.nextElementSibling;
              }
            });
          } else {
            Array.prototype.forEach.call(this,function(elem){
              elem = elem.firstElementChild || elem.firstChild;
              while(elem) {
                elems.push(elem);
                elem = elem.nextElementSibling;
              }
            });
          }
          return new listDOM(elems);
        }
     },
     'data': {
          element: function (key,value) {
              if( isString(key) ) {
                  if( isString(value) ) {
                      
                      if( this.getAttribute('data-'+key) != null ) this.setAttribute('data-'+key,value);
                      else {
                          if( this.dataset !== undefined ) this.dataset[key] = value;
                          else this.setAttribute('data-'+key,value);
                      }
                      return this;
                      
                  } else return this.getAttribute('data-'+key) || ( this.dataset ? this.dataset[key] : false );
              }
              return this;
          },
          collection: function (key,value) {
              var elem;
              
              if( isString(key) ) {
              
                  if( !isString(value) ) return this[0].data(key);
                  else {
                    for( var i = 0, len = this.length; i < len ; i++ ) {
                        this[i].data(key,value);
                    }
                    return this;
                  }
              }
              return this;
          }
     },
     'attr': {
          element: function (key,value) {
              if( isString(key) ) {
                  if( value !== undefined ) {
                      this.setAttribute(key,value);
                      return this;
                  } else return this.getAttribute(key);
              }
              return this;
          },
          collection: function (key,value) {
              var elem;
              
              if( isString(key) ) {
              
                  if( !isString(value) ) return this[0].getAttribute(key);
                  else {
                    for( var i = 0, len = this.length; i < len ; i++ ) {
                        this[i].setAttribute(key,value);
                    }
                    return this;
                  }
              }
              return this;
          }
     },
     'addClass': {
         element: document.createElement('div').classList ? function (className) {
            this.classList.add(className);
            return this;
          } : function(className){
              if(!this.className) this.className = '';
              var patt = new RegExp('\\b'+className+'\\b','');
              if(!patt.test(this.className)) this.className += ' '+className;
              return this;
         },
         collection: function (className) {
            for( var i = 0, len = this.length; i < len ; i++ ) {
                this[i].addClass(className);
            }
            return this;
        }
     },
     'removeClass': {
        element: document.createElement('div').classList ? function (className) {
            this.classList.remove(className);
            return this;
        } : function(className){
            if(this.className) {
                var patt = new RegExp('(\\b|\\s+)'+className+'\\b','g');
                this.className = this.className.replace(patt,'');
            }
            return this;
        },
        collection: function (className) {
            for( var i = 0, len = this.length; i < len ; i++ ) {
                this[i].removeClass(className);
            }
            return this;
        }
     },
     'hasClass': {
        element: document.createElement('div').classList ? function (className) {
            return this.classList.item(className);
        } : function(className){
            if(!this.className) return false;
            patt = new RegExp('\\b'+className+'\\b','');
            return patt.test(this.className);
        },
        collection: function (className) {
            for( var i = 0, len = this.length; i < len ; i++ ) {
                if( element.hasClass(className) ) {
                    return true;
                }
            }
            return false;
        }
     },
     'parent': {
         element: function () {
              if( this == document.body ) return false;
              return this.parentElement || this.parentNode;
         },
         collection: function () {
            var items = new listDOM(), parent;
            
            for( var i = 0, len = this.length; i < len ; i++ ) {
                parent = this[i].parent();
                if(parent) items.push(parent);
            }
            
            return items;
         }
     },
     'render': {
         element: function (html) {
              this.innerHTML = html;
              this.find('script').each(function(script){
                if( script.type == 'text/javascript' ) {
                  try{ eval('(function(){ \'use strict\';'+script.textContent+'})();'); }catch(err){ console.log(err.message); }
                } else if( /^text\/coffee(script)/.test(script.type) && isObject(window.CoffeeScript) ) {
                  if( CoffeeScript.compile instanceof Function ) {
                    try{ eval(CoffeeScript.compile(script.textContent)); }catch(err){ console.log(err.message); }
                  }
                }
              });
              
              return this;
         },
         collection: function (html) {
            for( var i = 0, len = this.length; i < len ; i++ ) {
              this[i].render(html);
            }
            return this;
         }
      },
      'text': {
        element: function (text) {
          if( text === undefined ) {
            return this.textContent;
          } else {
            this.textContent = text;
            return this;
          }
        },
        collection: function (text) {
            if( text === undefined ) {
                text = '';
                for( var i = 0, len = this.length; i < len ; i++ ) {
                  text += this[i].textContent;
                }
                return text;
            } else {
                for( var i = 0, len = this.length; i < len ; i++ ) {
                  this[i].textContent = text;
                }
            }
            return this;
        }
      },
      'on':{
          element: function (event,handler) {
              var elem = this;
              if( isString(event) ) {
                  if(isFunction(handler)) {
                      var originalHandler = handler;
                      handler = function(e){
                          originalHandler.apply(e.target,[e].concat(e.data));
                      }
                      
                      if (elem.addEventListener)  { // W3C DOM
                          elem.addEventListener(event,handler,false);
                      } else if (elem.attachEvent) { // IE DOM
                          elem.attachEvent("on"+event, handler);
                      } else throw 'No es posible añadir evento';
                      
                      if(!elem.listeners) elem.listeners = {};
                      if( !elem.listeners[event] ) elem.listeners[event] = [];
                      
                      elem.listeners[event].push(handler);
                  } else if( handler === false ) {
                      if(elem.listeners) {
                          if( elem.listeners[event] ) {
                              var handlers = elem.listeners[event];
                              while( handler = handlers.pop() ) {
                                  if (elem.removeEventListener) elem.removeEventListener (event, handler, false);  // all browsers except IE before version 9
                                  else if (elem.detachEvent) elem.detachEvent ('on'+event, handler);   // IE before version 9
                              }
                          }
                      }
                  }
              }
              
              return this;
          },
          collection: function (event,handler) {
              Array.prototype.forEach.call(this,function(elem){
                  elem.on(event,handler);
              });
              
              return this;
          }
      },
      'off': {
          element: function (event) { this.on(event,false); },
          collection: function (event) { this.on(event,false); }
      },
      'trigger': {
          element: function (event,data) {
              triggerEvent(this, event, data);
          },
          collection: function (event,data){
              Array.prototype.forEach.call(this,function(elem){
                  triggerEvent(elem, event, data);
              });
          }
      },
      ready: {
        element: ready,
        collection: ready
      }
  });
  
  return function $ (selector){
    if( /^\<\w+.*\>$/.test(selector) ) {
      var el = document.createElement('div');
      el.innerHTML = selector;
      return new listDOM(el.children);
    }
    return new listDOM(selector);
  };
  
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