(function (root) {

	var fn = (function (module) {
		
/*	Copyright (c) 2014, Jesús Manuel Germade Castiñeiras <jesus@germade.es>
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

'use strict';

// var _global = (typeof window === 'undefined' ? module.exports : window);

function _instanceof (prototype) {
  	return function (o) {
  		return o instanceof prototype;
  	};
  }

  function isString (o) {
  	return typeof o === 'string';
  }
  var isFunction = _instanceof(Function),
  	isArray = _instanceof(Array),
  	isObject = _instanceof(Object);

// function globalize (varName, o) {
// 	if( o ) {
// 		_global[varName] = o;
// 	} else if(varName) {
// 		_global[varName] = definitions[varName];
// 	} else {
// 		for( varName in definitions ) {
// 			_global[varName] = definitions[varName];
// 		}
// 	}
// }

var definitions = {},
	RE_FN_ARGS = /^function[^\(]\(([^\)]*)/,
	noop = function () {},
	fnListeners = {};

/**
 * @description
 * fn function
 *
 * @param {fnName} function name
 * @param {dependencies} array of dependencies ended by function defition
 * @returns {Object} the Core
 */
function fn (deps, func, context) {
	if( isString(deps) ) {
		if( func === undefined ) {
			return definitions[deps];
		} else {
			return fn.define(deps, func, context);
		}
	} else {
		fn.run(deps, func, context);
	}
	return fn;
}

function onceFn (fnName, handler) {
	fnListeners[fnName] = fnListeners[fnName] || [];
	fnListeners[fnName].push(handler);
}

function triggerFn (fnName) {
	var definition = definitions[fnName];
	if( isArray(fnListeners[fnName]) ) {
		for( var i = 0, len = fnListeners[fnName].length; i < len; i++ ) {
			fnListeners[fnName][i](definition);
		}
	}
}

fn.waiting = {};

fn.run = function (dependencies, f, context) {

	if( isArray(dependencies) ) {
		if( f === undefined ) {
			f = dependencies.pop();
		}
	} else if( isFunction(dependencies) ) {
		context = f;
		f = dependencies;
		dependencies = f.toString().match(RE_FN_ARGS)[1].split(',') || [];
	}

	if( f instanceof Function ) {
		fn.require(dependencies, f, context);
	}

	return fn;
};

function addDefinition (fnName, definition) {
	definitions[fnName] = definition;
	// console.debug('fn defined: ', fnName);
	triggerFn(fnName);
	delete fn.waiting[fnName];
}

fn.define = function (fnName, dependencies, fnDef) {
	if( isString(fnName) ) {

		var args = [];

		if( isArray(dependencies) ) {
			if( fnDef === undefined ) {
				fnDef = dependencies.pop();
			}
		} else if( isFunction(dependencies) ) {
			fnDef = dependencies;
			dependencies = [];
			fnDef.toString().replace(RE_FN_ARGS, function(match, params) {
				params = params.replace(/\s/g,'');
				if( params ) {
					[].push.apply(dependencies, params.split(','));
				}
			});
		}

		fn.waiting[fnName] = dependencies;

		fn.require(dependencies, function () {
			var definition = fnDef.apply(definitions, arguments);
			if( definition && definition.then instanceof Function ) {
				definition.then(function (def) {
					setTimeout(function () {
						addDefinition(fnName, def);
					}, 0);
				});
			} else {
				addDefinition(fnName, definition);
			}
		});
	}

	return fn;
};

fn.require = function (dependencies, callback, context) {
	if( !isFunction(callback) ) {
		return false;
	}

	var runCallback = function () {
		for( var i = 0, len = dependencies.length, injections = []; i < len; i++ ) {
			if( dependencies[i] ) {
				injections.push(definitions[dependencies[i]]);
			}
		}
		callback.apply(context || definitions, injections);
	};

	runCallback.pending = 0;

	runCallback._try = function () {
		runCallback.pending--;
		if( !runCallback.pending ) {
			runCallback();
		}
	};

	runCallback._add = function (dependence) {
		if( !definitions[dependence] ) {
			runCallback.pending++;
			fn.defer(function () {
				if( definitions[dependence] ) {
					runCallback._try();
				} else {
					onceFn(dependence, runCallback._try);
				}
			});
		}
	};

	if( isString(dependencies) ) {
		dependencies = [dependencies];
	}

	if( isArray(dependencies) ) {

		if( dependencies.length ) {

			for( var i = 0, len = dependencies.length; i < len; i++ ) {
				if( dependencies[i] ) {
					runCallback._add(dependencies[i]);
				}
			}

			if( !runCallback.pending ) {
				runCallback();
			}

		} else {
			runCallback();
		}
	}

	return fn;
};

fn.when = function (fnName, callback, context) {
	if( isFunction(callback) ) {
		if( definitions[fnName] ) {
			callback.apply(context, definitions[fnName]);
		} else {
			onceFn(fnName, function (definition) {
				callback.apply(context, definition);
			});
		}
	}

	return fn;
};

fn.defer = function (f, time) {
	setTimeout(f, time || 0);

	return fn;
};

// fn.globalize = globalize;
//
// globalize('fn', fn);
//
// if( !_global.define ) {
// 	_global.define = fn.define;
// }
//
// if( !_global.require ) {
// 	_global.require = fn.require;
// }

if( typeof window !== 'undefined' ) {
	fn.load = window.addEventListener ? function (listener) {
		window.addEventListener('load', listener, false);
		return fn;
	} : function (listener) {
		window.attachEvent('onload', listener );
		return fn;
	};
}


fn.ready = ( typeof document === 'undefined' ) ? function (callback) {
	callback();
} :function (callback) {
	if( callback instanceof Function ) {
		if (/loaded|complete/.test(document.readyState)) {
	    callback();
	  } else {
			fn.load(callback);
		}
	}
	return fn;
};

fn.ready(function () {
	var missingDependencies = {}, dependencies, key, i, len;

	for( key in fn.waiting ) {
		dependencies = fn.waiting[key];
		missingDependencies[key] = [];
		for( i = 0, len = dependencies.length; i < len; i++ ) {
			if( !definitions[dependencies[i]] ) {
				missingDependencies[key].push(dependencies[i]);
			}
		}
	}

	// if( Object.keys(missingDependencies).length ) {
	// 	console.group('missing dependencies');
	// 	for( key in missingDependencies ) {
	// 		console.log(key, missingDependencies[key]);
	// 	}
	// 	console.groupEnd();
	// }
});

module.exports = fn;

		return module.exports;
	})({});

	root.fn = fn;
	root.define = fn.define;
	root.require = fn.require;

})(this);

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
  var jqlite = factory(root);

  if( typeof module === 'object' && typeof exports === 'object' ) {
    module.exports = jqlite;
  } else {
    if ( typeof define === 'function' ) {
      define('jqlite', function () { return jqlite; } );
    } else if( typeof angular === 'function' ) {
      angular.module('jqlite', []).constant('jqlite', jqlite );
    } else {
      root.jqlite = jqlite;
    }
    if( !root.$ ) {
      root.$ = jqlite;
    }
  }

})(this, function (root, isNodejs) {
  'use strict';

  function _isType (type) {
      return function (o) {
          return (typeof o === type);
      };
  }

  function _instanceOf (_constructor) {
      return function (o) {
          return ( o instanceof _constructor );
      };
  }

	var _isObject = _isType('object'),
			_isFunction = _isType('function'),
			_isString = _isType('string'),
			_isNumber = _isType('number'),
			_isBoolean = _isType('boolean'),
			_isArray = Array.isArray || _instanceOf(Array),
			_isDate = _instanceOf(Date),
			_isRegExp = _instanceOf(RegExp),
			_isElement = function(o) {
		    return o && o.nodeType === 1;
		  },
      _find = function (list, iteratee) {
        if( !( iteratee instanceof Function ) ) {
          var value = iteratee;
          iteratee = function (item) {
            return item === value;
          };
        }

        for( var i = 0, n = list.length ; i < n ; i++ ) {
          if( iteratee(list[i]) ) {
            return {
              index: i,
              found: list[i]
            };
          }
        }

        return {
          index: -1
        };
      };

var arrayShift = Array.prototype.shift;

  function _merge () {
    var dest = arrayShift.call(arguments),
        src = arrayShift.call(arguments),
        key;

    while( src ) {

      if( typeof dest !== typeof src ) {
        dest = _isArray(src) ? [] : ( _isObject(src) ? {} : src );
      }

      if( _isObject(src) ) {

        for( key in src ) {
          if( src[key] !== undefined ) {
            if( typeof dest[key] !== typeof src[key] ) {
                dest[key] = _merge(undefined, src[key]);
            } else if( _isArray(dest[key]) ) {
                [].push.apply(dest[key], src[key]);
            } else if( _isObject(dest[key]) ) {
                dest[key] = _merge(dest[key], src[key]);
            } else {
                dest[key] = src[key];
            }
          }
        }
      }
      src = arrayShift.call(arguments);
    }

    return dest;
  }

  function _extend () {
    var dest = arrayShift.call(arguments),
        src = arrayShift.call(arguments),
        key;

    while( src ) {
      for( key in src) {
        dest[key] = src[key];
      }
      src = arrayShift.call(arguments);
    }

    return dest;
  }

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
      noop = function noop () {},
      auxArray = [],
      auxDiv = document.createElement('div'),
      detached = document.createElement('div'),
      classListEnabled = !!auxDiv.classList;

  // Events support

  if( !auxDiv.addEventListener && !document.body.attachEvent ) {
    throw 'Browser not compatible with element events';
  }

  var _attachElementListener = auxDiv.addEventListener ? function(element, eventName, listener) {
        return element.addEventListener(eventName, listener, false);
      } : function(element, eventName, listener) {
        return element.attachEvent('on' + eventName, listener);
      },
      _detachElementListener = auxDiv.removeEventListener ? function(element, eventName, listener) {
        return element.removeEventListener(eventName, listener, false);
      } : function(element, eventName, listener) {
        return element.detachEvent('on' + eventName, listener );
      };

  function detachElementListener (element, eventName, srcListener) {

    if( srcListener === undefined ) {
      if( element.$$jqListeners && element.$$jqListeners[eventName] ) {
        for( var i = 0, n = element.$$jqListeners[eventName].length ; i < n ; i++ ) {
          _detachElementListener( element, eventName, element.$$jqListeners[eventName][i] );
        }
        element.$$jqListeners[eventName] = [];
      }
      return;
    }

    if( element.$$jqListeners && element.$$jqListeners[eventName] ) {
      var _listener = _find(element.$$jqListeners[eventName], function (l) {
        return l.srcListener === srcListener;
      });

      if( _listener.found ) {
        element.$$jqListeners[eventName].splice( _listener.index, 1 );
        _detachElementListener( element, eventName, _listener.found );
      }
    }
  }

  function attachElementListener (element, eventName, listener, once) {

    var _listener = once ? function(e) {
        listener.apply(element, [e].concat(e.args) );
        detachElementListener(element, eventName, listener);
    } : function(e){
        listener.apply(element, [e].concat(e.args) );
    };

    _listener.srcListener = listener;

    element.$$jqListeners = element.$$jqListeners || {};
    element.$$jqListeners[eventName] = element.$$jqListeners[eventName] || [];

    element.$$jqListeners[eventName].push(_listener);

    _attachElementListener( element, eventName, _listener );
  }

  // jqlite function

  function pushMatches( list, matches ) {
    for( var i = 0, len = matches.length; i < len; i++ ) {
        list[i] = matches[i];
    }
    list.length += len;
    return list;
  }

  var RE_TAG = /^[a-z-_]$/i;

  function stringMatches (selector, element) {
    var char0 = selector[0];

    if( char0 === '<') {
      auxDiv.innerHTML = selector;
      var jChildren = pushMatches( new ListDOM(), auxDiv.children );
      return jChildren;
    } else if ( selector.indexOf(' ') !== -1 || selector.indexOf(':') !== -1 ) {
      return pushMatches( new ListDOM(), element.querySelectorAll(selector) );
    } else if( char0 === '#' ) {
      var found = element.getElementById(selector.substr(1));
      if( found ) {
        var listdom = new ListDOM();
        listdom[0] = found;
        listdom.length = 1;
        return listdom;
      } else {
        return pushMatches( new ListDOM(), element.querySelectorAll(selector) );
      }
    } else if( char0 === '.' ) {
      return pushMatches( new ListDOM(), element.getElementsByClassName(selector.substr(1)) );
    } else if( RE_TAG.test(selector) ) {
      // console.log(document.getElementsByTagName(selector), element.getElementsByTagName(selector).length);
      return pushMatches( new ListDOM(), element.getElementsByTagName(selector) );
    }
    return pushMatches( new ListDOM(), element.querySelectorAll(selector) );
  }

  function initList(selector) {

    if( selector instanceof ListDOM ) {
      return selector;
    } else if( _isArray(selector) || selector instanceof NodeList || selector instanceof HTMLCollection ) {
      return pushMatches( new ListDOM(), selector );
    } else if( selector === window || selector === document || selector instanceof HTMLElement || selector instanceof Element || _isElement(selector) ) {
      var list2 = new ListDOM();
      list2[0] = selector;
      list2.length = 1;
      return list2;

    } else if( _isFunction(selector) ) {
      ready(selector);
    } else if( selector === undefined ) {
      return new ListDOM();
    }
  }

  function jqlite (selector, element){
    if( _isString(selector) ) {
      return stringMatches(selector, element || document );
    }
    return initList(selector);
  }

  jqlite.noop = noop;

  jqlite.extend = function (deep) {
    var args = [].slice.call(arguments);
    if( _isBoolean(deep) ) {
      args.shift();
    } else {
      deep = false;
    }
    if( deep ) {
      _merge.apply(null, args );
    } else {
      _extend.apply(null, args );
    }
  };

  jqlite.isObject = _isObject;
  jqlite.isFunction = _isFunction;
  jqlite.isString = _isString;
  jqlite.isNumber = _isNumber;
  jqlite.isBoolean = _isBoolean;
  jqlite.isArray = _isArray;
  jqlite.isDate = _isDate;
  jqlite.isRegExp = _isRegExp;
  jqlite.isElement = _isElement;

  var $ = jqlite;

  // document ready

  var _onLoad = window.addEventListener ? function (listener) {
    window.addEventListener('load', listener, false);
  } : function (listener) {
    window.attachEvent('onload', listener );
  };

  function ready (callback) {
    if( _isFunction(callback) ) {
      if (/loaded|complete/.test(document.readyState)) {
        callback();
      } else {
        _onLoad(callback);
      }
    }
  }

  // ListDOM

  function ListDOM(){}

  ListDOM.prototype = [];
  ListDOM.prototype.ready = ready;
  ListDOM.prototype.extend = function (deep) {
    var args = [].slice.call(arguments);
    if( _isBoolean(deep) ) {
      args.shift();
    } else {
      deep = false;
    }
    if( deep ) {
      _merge.apply(null, [ListDOM.prototype].concat(args) );
    } else {
      _extend.apply(null, [ListDOM.prototype].concat(args) );
    }
  };

  jqlite.fn = ListDOM.prototype;

  function filterDuplicated (list) {
    if( list.length <= 1 ) {
      return list;
    }

    var filteredList = list.filter(function () {
      if( this.___found___ ) {
        return false;
      }
      this.___found___ = true;
      return true;
    });

    for( var i = 0, len = filteredList.length; i < len ; i++ ) {
      delete filteredList[i].___found___;
    }
    return filteredList;
  }

  ListDOM.prototype.get = function(pos) {
      return pos ? this[pos] : this;
    };

  ListDOM.prototype.eq = function(pos) {
      if( !_isNumber(pos) ) {
        throw 'number required';
      }
      var item = ( pos < 0 ) ? this[this.length - pos] : this[pos], list = new ListDOM();

      if(item) {
        list[0] = item;
        list.length = 1;
      }
      return list;
    };

  ListDOM.prototype.first = function() {
      var list = new ListDOM();

      if( this.length ) {
        list[0] = this[0];
        list.length = 1;
      }
      return list;
    };

  ListDOM.prototype.last = function() {
      var list = new ListDOM();

      if( this.length ) {
        list[0] = this[this.length - 1];
        list.length = 1;
      }
      return list;
    };

  ListDOM.prototype.find = function(selector) {
      var list = this, elems = new ListDOM(), n = 0, i, j, len, len2, found;

      if( !selector ) {
        return list;
      }

      if( /^\s*>/.test(selector) ) {
        selector = selector.replace(/^\s*>\s*([^\s]*)\s*/, function (match, selector2) {
          list = list.children(selector2);
          return '';
        });
      }

      for( i = 0, len = list.length; i < len; i++ ) {
        found = list[i].querySelectorAll(selector);
        for( j = 0, len2 = found.length; j < len2 ; j++ ) {
          elems[n++] = found[j];
        }
      }
      elems.length = n;

      return filterDuplicated(elems);
    };


  ListDOM.prototype.$ = ListDOM.prototype.find;

  ListDOM.prototype.add = function (selector, element) {
    var el2add = jqlite(selector, element),
        i, len, n = this.length,
        elems = new ListDOM();

    for( i = 0, len = this.length ; i < len; i++ ) {
      elems[i] = this[i];
    }

    for( i = 0, len = el2add.length ; i < len; i++ ) {
      elems[n++] = el2add[i];
    }
    elems.length = n;

    return filterDuplicated(elems);
  };

  ListDOM.prototype.each = function(each) {
      if( _isFunction(each) ) {
        for( var i = 0, len = this.length, elem; i < len ; i++ ) {
          each.call(this[i], i, this[i]);
        }
      }
      return this;
    };

  ListDOM.prototype.empty = function() {
      for( var i = 0, len = this.length, elem, child; i < len ; i++ ) {
          elem = this[i];
          child = elem.firstChild;
          while( child ) {
            elem.removeChild(child);
            child = elem.firstChild;
          }
      }
      return this;
    };

  ListDOM.prototype.filter = function(selector) {
      var elems = new ListDOM(), elem, i, len;

      if( _isFunction(selector) ) {
        for( i = 0, len = this.length, elem; i < len ; i++ ) {
          elem = this[i];
          if( selector.call(elem, i, elem) ) {
            elems.push(elem);
          }
        }
      } else if( _isString(selector) ) {
        for( i = 0, len = this.length, elem; i < len ; i++ ) {
          elem = this[i];
          if( Element.prototype.matchesSelector.call(elem,selector) ) {
            elems.push(elem);
          }
        }
      }
      return elems;
    };

  var _getClosest = auxDiv.closest ? function (element, selector) {
    return element.closest(selector);
  } : function (element, selector) {
    var elem = element.parentElement;

    while( elem ) {
      if( elem.matchesSelector(selector) ) {
        return elem;
      }
      elem = elem.parentElement;
    }
    return null;
  };

  ListDOM.prototype.closest = function(selector) {
      var elems = new ListDOM(), n = 0, elem;

      if( !selector ) {
        return this;
      }

      for( var i = 0, len = this.length; i < len; i++ ) {
        elem = _getClosest(this[i], selector);
        if( elem ) {
          elems[n++] = elem;
        }
      }
      elems.length = n;

      return filterDuplicated(elems);
    };

  ListDOM.prototype.children = auxDiv.children ? function (selector){
      var elems = new ListDOM();

      for( var i = 0, len = this.length; i < len; i++ ) {
        pushMatches(elems, this[i].children);
      }

      return selector ? elems.filter(selector) : elems;

    } : function (selector) {
      var elems = new ListDOM(), elem;

      Array.prototype.forEach.call(this, function(elem){
        elem = elem.firstElementChild || elem.firstChild;
        while(elem) {
          elems[elems.length] = elem;
          elem = elem.nextElementSibling || elem.nextSibling;
        }
      });

      return selector ? elems.filter(selector) : elems;
    };

  ListDOM.prototype.parent = function (selector) {
      var list = new ListDOM(), n = 0;

      for( var i = 0, len = this.length; i < len; i++ ) {
        if( this[i].parentElement ) {
          list[n++] = this[i].parentElement;
        }
      }
        list.length = n;

      return filterDuplicated( selector ? list.filter(selector): list );
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

      return selector ? elems.filter(selector) : elems;
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
    var elems = new ListDOM(), i, len;
    deep = deep === undefined || deep;

    for( i = 0, len = this.length; i < len ; i++ ) {
      elems[i] = this[i].cloneNode(deep);

      // if(cloneEvents) {
      //   _cloneEvents(this[i], list[i]);
      // }
    }

    elems.length = len;
    return elems;
  };

  ListDOM.prototype.data = function (key, value) {
      if( !this.length ) {
        return value ? this : undefined;
      }

      if( value === undefined ) {
        var data = this[0].$$jqliteData && this[0].$$jqliteData[key];
        if( data === undefined ) {
          data = this.dataset(key);
          if( data === undefined ) {
            return undefined;
          } else if( data.charAt(0) === '{' || data.charAt(0) === '[' ) {
            return JSON.parse(data);
          } else if( /^\d+$/.test(data) ) {
            return Number(data);
          } else {
            return data;
          }
        }
        return data;
      }

      for( var i = 0, n = this.length; i < n ; i++ ) {
        this[i].$$jqliteData = this[i].$$jqliteData || {};
        this[i].$$jqliteData[key] = value;
      }
    };

  ListDOM.prototype.removeData = function (key) {
      for( var i = 0, n = this.length ; i < n ; i++ ) {
        if( this[i].$$jqliteData && this[i].$$jqliteData[key] ) {
          delete this[i].$$jqliteData[key];
        }
      }
      return this;
    };

  ListDOM.prototype.dataset = auxDiv.dataset ? function (key, value) {
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

  ListDOM.prototype.removeDataset = auxDiv.dataset ? function (key) {
      var i, len;
      if( typeof key === 'string' ) {
        for( i = 0, len = this.length; i < len ; i++ ) {
          delete this[i].dataset[key];
        }
      } else if( _isArray(key) ) {
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
      } else if( _isArray(key) ) {
        for( i = 0, len = key.length; i < len ; i++ ) {
          this.removeData(key[i]);
        }
      }
      return this;
    };

  ListDOM.prototype.attr = function (key, value) {
      var i, len;
      if( _isFunction(value) ) {
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

      if( _isFunction(value) ) {
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
      if( className.indexOf(' ') >= 0 ) {
        var _this = this;
        className.split(' ').forEach(function (cn) {
          _this.addClass(cn);
        });
      } else {
        for( var i = 0, len = this.length; i < len ; i++ ) {
            this[i].classList.add(className);
        }
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
      if( className.indexOf(' ') >= 0 ) {
        var jThis = $(this);
        className.split(' ').forEach(function (cn) {
          jThis.removeClass(cn);
        });
      } else {
        for( var i = 0, len = this.length; i < len ; i++ ) {
            this[i].classList.remove(className);
        }
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
          if( this[i].classList.contains(className) ) {
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

      if( add === undefined ) {
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
        jContent2 = ( i ? jContent.clone(true) : jContent );
        element = this[i];
        for( j = 0, len2 = jContent2.length; j < len2; j++ ) {
          element.appendChild(jContent2[j]);
        }
      }

      return this;
    };

  ListDOM.prototype.appendTo = function (target) {
      $(target).append(this);
    };

  ListDOM.prototype.prepend = function (content) {
      var jContent = $(content), jContent2, i, j, len, len2, element, previous;

      jContent.remove();

      for( i = 0, len = this.length; i < len; i++ ) {
        jContent2 = ( i ? jContent.clone(true) : jContent );
        element = this[i];
        previous = element.firstChild;

        if( previous ) {
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
        jContent2 = ( i ? jContent.clone(true) : jContent );
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

      if( !jContent.length ) {
        return this;
      }

      for( i = this.length - 1; i >= 0; i-- ) {
        jContent2 = ( i ? jContent.clone(true) : jContent );
        element = this[i];
        parent = element.parentElement;

        parent.replaceChild(jContent2[0], element);

        if( jContent2[1] ) {
          next = jContent2[0].nextElementSibling;
          if( next ) {
            for( j = 1, len2 = jContent2.length; j < len2; j++ ) {
              parent.insertBefore(jContent2[j], next);
            }
          } else {
            for( j = 1, len2 = jContent2.length; j < len2; j++ ) {
              parent.appendChild(jContent2[j]);
            }
          }
        }
      }

      return this;
    };

  ListDOM.prototype.wrap = function (content) {
    var getWrapper = _isFunction(content) ? function (i) {
      return $( content(i) );
    } : (function () {
      var jContent = $(content),
          jDolly = jContent.clone(true);

      return function (i) {
        return i ? jDolly.clone(true) : jContent;
      };
    })();

    this.each(function (i, elem) {
      var wrapper = getWrapper(i)[0],
          parent = this.parentElement,
          firstChild = wrapper;

      while( firstChild.firstElementChild ) {
        firstChild = firstChild.firstElementChild;
      }

      parent.replaceChild(wrapper, this);
      firstChild.appendChild(this);
    });

    return this;
  };

  ListDOM.prototype.wrapAll = function (content) {
    var element = $( _isFunction(content) ? content() : content )[0],
        parent = this[0].parentElement;

    parent.replaceChild(element, this[0]);

    if( element ) {
      while( element.firstElementChild ) {
        element = element.firstElementChild;
      }
    }

    for( var i = 0, len = this.length; i < len ; i++ ) {
      element.appendChild(this[i]);
    }

    return $(element);
  };

  ListDOM.prototype.unwrap = function () {

    var parents = this.parent(), parent;

    for( var i = 0, len = parents.length; i < len ; i++ ) {
      parent = parents.eq(i);
      parent.replaceWith( parent.children() );
    }

    return this;
  };

  ListDOM.prototype.next = function (selector) {
      var list = new ListDOM(), elem, n = 0;

      for( var i = 0, len = this.length; i < len; i++ ) {
        elem = this[i].nextElementSibling;
        if( elem ) {
          list[n++] = elem;
        }
      }
      list.length = n;

      return ( typeof selector === 'string' ) ? list.filter(selector): list;
    };

  ListDOM.prototype.nextAll = function (selector) {
      var list = new ListDOM(), elem, n = 0;

      for( var i = 0, len = this.length; i < len; i++ ) {
        elem = this[i].nextElementSibling;
        while( elem ) {
          list[n++] = elem;
          elem = elem.nextElementSibling;
        }
      }
      list.length = n;

      return filterDuplicated( selector ? list.filter(selector): list );
    };

  ListDOM.prototype.prev = function (selector) {
      var list = new ListDOM(), elem, n = 0;

      for( var i = 0, len = this.length; i < len; i++ ) {
        elem = this[i].previousElementSibling;
        if( elem ) {
          list[n++] = elem;
        }
      }
      list.length = n;

      return selector ? list.filter(selector): list;
    };

  function _prevAll (list, element, n) {
    if( element ) {
      if( element.previousElementSibling ) {
        n = _prevAll(list, element.previousElementSibling, n);
      }
      list[n++] = element;
    }
    return n;
  }

  ListDOM.prototype.prevAll = function (selector) {
      var list = new ListDOM(), elem, n = 0;

      for( var i = 0, len = this.length; i < len; i++ ) {
        n = _prevAll(list, this[i].previousElementSibling, n);
      }
      list.length = n;

      return filterDuplicated( selector ? list.filter(selector): list );
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

      if( value !== undefined ) {
        var i, len;
        value = ( value instanceof Function ) ? value() : ( value instanceof Number ? (value + 'px') : value );

        if( typeof value === 'string' && /^\+=|\-=/.test(value) ) {
          value = ( value.charAt(0) === '-' ) ? -parseFloat(value.substr(2)) : parseFloat(value.substr(2));

          for( i = 0, len = this.length; i < len; i++ ) {
            this[i].style[key] = parseFloat(this[i].style[key]) + value + 'px';
          }
        } else {
          for( i = 0, len = this.length; i < len; i++ ) {
            this[i].style[key] = value;
          }
        }
        return this;
      } else if( key instanceof Object ) {
        for( var k in key ) {
          this.css(k, key[k]);
        }
      } else if( this[0] ) {
        return this[0].style[key] || window.getComputedStyle(this[0])[key];
      }

      return this;
    };

  var transitionKey = auxDiv.style.webkitTransition !== undefined ? 'webkitTransition' : (
    auxDiv.style.mozTransition !== undefined ? 'mozTransition' : (
      auxDiv.style.msTransition !== undefined ? 'msTransition' : undefined
    )
  );

  function animateFade (list, show, time, timingFunction, callback) {
    if( typeof time === 'string' ) {
      time = animateFade.times[time];
    }

    timingFunction = timingFunction || 'linear';
    var opacityStart = show ? 0 : 1,
        opacityEnd = show ? 1 : 0;

    for( var i = 0, n = list.length; i < n ; i++ ) {
      list[i].style.opacity = opacityStart;
    }
    setTimeout(function () {
      for( var i = 0, n = list.length; i < n ; i++ ) {
        list[i].$$jqliteTransition = list[i].$$jqliteTransition === undefined ? ( list[i].style[transitionKey] || '' ) : list[i].$$jqliteTransition;
        list[i].style[transitionKey] = 'opacity ' + time + 'ms ' + timingFunction;
        list[i].style.opacity = opacityEnd;
      }
    }, 20);

    setTimeout(function () {
      for( var i = 0, n = list.length; i < n ; i++ ) {
        list[i].style.opacity = '';
        list[i].style[transitionKey] = list[i].$$jqliteTransition;
      }
      callback.call(list);
    }, time);

    return list;
  }

  animateFade.times = {
    slow: 600,
    normal: 400,
    fast: 200
  };

  ListDOM.prototype.show = function (time, easing, callback) {
    if( time ) {
      var list = this;
      this.show();
      return animateFade(list, true, time, easing, callback || function () {});
    }

    for( var i = 0, n = this.length; i < n ; i++ ) {
      if( this[i].style.display ) {
        this[i].style.display = '';
      }
    }
    return this;
  };

  ListDOM.prototype.hide = function (time, easing, callback) {
    if( time ) {
      return animateFade(this, false, time, easing, function () {
        this.hide();
        if( callback ) {
          callback.call(this);
        }
      });
    }

    for( var i = 0, n = this.length; i < n ; i++ ) {
      this[i].style.display = 'none';
    }
    return this;
  };

  ListDOM.prototype.position = function () {
    if( this.length ) {
      return {
        top: this[0].offsetTop,
        left: this[0].offsetLeft
      };
    }
  };

  ListDOM.prototype.offset = function (coordinates) {
    if( coordinates === undefined ) {
      var rect = this[0].getBoundingClientRect();
      return this.length && { top: rect.top + document.body.scrollTop, left: rect.left };
    }
    if( coordinates instanceof Function ) {
      coordinates = coordinates();
    }
    if( typeof coordinates === 'object' ) {
      if( coordinates.top !== undefined && coordinates.left !== undefined ) {
        for( var i = 0, len = this.length, position ; i < len ; i++ ) {
          // position = this[i].style.position || window.getComputedStyle(this[i]).position;
          this[i].style.position = 'relative';

          var p = this[i].getBoundingClientRect();

          this[i].style.top = coordinates.top - p.top + parseFloat(this[i].style.top || 0) - document.body.scrollTop + 'px';
          this[i].style.left = coordinates.left - p.left + parseFloat(this[i].style.left || 0) + 'px';
        }
        return coordinates;
      }
    }
  };

  ListDOM.prototype.width = function (value, offset) {
    var el;
    if( value === true ) {
      if( this.length ) {
        el = this[0];
        return el.offsetWidth;
      }
    } else if( value !== undefined ) {

      for( var i = 0, len = this.length; i< len ; i++ ) {
        this[i].style.width = value;
      }

    } else if( this.length ) {
      el = this[0];
      return el.offsetWidth -
        parseFloat( window.getComputedStyle(el, null).getPropertyValue('border-left-width') ) -
        parseFloat( window.getComputedStyle(el, null).getPropertyValue('padding-left') ) -
        parseFloat( window.getComputedStyle(el, null).getPropertyValue('padding-right') ) -
        parseFloat( window.getComputedStyle(el, null).getPropertyValue('border-right-width') );
    }
  };

  ListDOM.prototype.height = function (value, offset) {
    var el;
    if( value === true ) {
      if( this.length ) {
        el = this[0];
        return el.offsetHeight;
      }
    } else if( value !== undefined ) {

      for( var i = 0, len = this.length; i < len ; i++ ) {
        this[i].style.height = value;
      }

    } else if( this.length ) {
      el = this[0];
      return el.offsetHeight -
        parseFloat( window.getComputedStyle(el, null).getPropertyValue('border-top-width') ) -
        parseFloat( window.getComputedStyle(el, null).getPropertyValue('padding-top') ) -
        parseFloat( window.getComputedStyle(el, null).getPropertyValue('padding-bottom') ) -
        parseFloat( window.getComputedStyle(el, null).getPropertyValue('border-bottom-width') );
    }
  };

  ListDOM.prototype.html = function (html) {
      var i, len;
      if( html === undefined ) {
        html = '';
        for( i = 0, len = this.length; i < len; i++ ) {
          html += this[i].innerHTML;
        }
        return html;
      } else if( html === true ) {
        html = '';
        for( i = 0, len = this.length; i < len; i++ ) {
          html += this[i].outerHTML;
        }
        return html;
      }

      if( _isFunction(html) ) {
        for( i = 0, len = this.length; i < len; i++ ) {
          this[i].innerHTML = html(i, this[i].innerHTML);
        }
        return this;
      } else {
        for( i = 0, len = this.length; i < len; i++ ) {
          this[i].innerHTML = html;
        }
      }
      this.find('script').each(function(){
        if( (this.type == 'text/javascript' || !this.type) && this.textContent ) {
          try{
            runScripts('(function(){ \'use strict\';' + this.textContent + '})();');
          } catch(err) {
            throw new Error(err.message);
          }
        }
      });

      return this;
    };

  ListDOM.prototype.text = function (text) {
      var i, len;
      if( text === undefined ) {
        text = '';
        for( i = 0, len = this.length; i < len; i++ ) {
          text += this[i].textContent;
        }
        return text;
      } else if( _isFunction(text) ) {
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

  function addListListeners (list, eventName, listener, once) {
    var i, len;

    if( typeof eventName === 'string' ) {

      if( /\s/.test(eventName) ) {
        eventName = eventName.split(/\s+/g);
      } else {
        if( !_isFunction(listener) ) {
          throw 'listener needs to be a function';
        }

        for( i = 0, len = list.length; i < len; i++ ) {
          attachElementListener(list[i], eventName, listener, once);
        }
      }
    }

    if( _isArray(eventName) ) {
      for( i = 0, len = eventName.length; i < len; i++ ) {
        addListListeners(list, eventName[i], listener, once);
      }
    } else if( _isObject(eventName) ) {
      for( i in eventName ) {
        addListListeners(list, i, eventName[i], once);
      }
    }

    return list;
  }

  ListDOM.prototype.on = function (eventName, listener) {
    return addListListeners(this, eventName, listener);
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
        return this;
      };
    },
    init: function () {
      for( var i = 0, len = eventActions.list.length, name; i < len; i++ ) {
        eventActions.define(eventActions.list[i]);
      }
    }
  };
  eventActions.init();

  ListDOM.prototype.once = function (eventName, listener) {
    return addListListeners(this, eventName, listener, true);
  };
  // for jQuery compatibility
  ListDOM.prototype.one = ListDOM.prototype.once;

  ListDOM.prototype.off = function (eventName, listener) {
    var i, n;

    if( /\s/.test(eventName) ) {
      eventName = eventName.split(/\s+/g);
    }

    if( eventName instanceof Array ) {
      for( i = 0, n = this.length; i < n; i++ ) {
        this.off(eventName[i], listener);
      }
      return this;
    }

    if( eventName === undefined ) {
      var registeredEvents, registeredEvent;

      for( i = 0, n = this.length; i < n; i++ ) {
        registeredEvents = this[i].$$jqListeners || {};
        for( registeredEvent in registeredEvents ) {
          detachElementListener(this[i], registeredEvent);
          delete registeredEvents[registeredEvent];
        }
      }
    } else if( typeof eventName !== 'string' || ( !_isFunction(listener) && listener !== undefined ) ) {
      throw 'bad arguments';
    }

    for( i = 0, n = this.length; i < n; i++ ) {
      detachElementListener(this[i], eventName, listener);
    }
    return this;
  };

  ListDOM.prototype.trigger = function (eventName, args, data) {
    if( typeof eventName !== 'string' ) {
      throw 'bad arguments';
    }

    for( var i = 0, len = this.length; i < len; i++ ) {
      triggerEvent(this[i], eventName, args, data);
    }
    return this;
  };

  ListDOM.prototype.stopPropagation = function () {
    for( var i = 0, len = arguments.length; i < len; i++ ) {
      this.on(arguments[i], function (e) {
        e.stopPropagation();
      });
    }
  };

  // shorthands

  ['mouseenter', 'mouseleave'].forEach(function (eventName) {
    ListDOM.prototype[eventName] = function (handler) {
      this.on(eventName, handler);
      return this;
    };
  });

  ListDOM.prototype.hover = function (mouseIn, mouseOut) {
    return this.mouseenter(mouseIn).mouseleave(mouseOut);
  };

  // finally

  jqlite.noConflict = function () {
    if( root.$ === jqlite ) {
      delete root.$;
    }
    return jqlite;
  };

  return jqlite;

});
/*
 * jq-plugin
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


(function (root) {

  if( !root.$ ) {
    return;
  }

  var jq = root.$,
      jDoc = jq(document)
      noop = function (value) { return value; },
      pluginCache = {},
      pluginsAre = {},
      pluginsFilterCache = {};

  function pluginSelectorFilter (pluginSelector) {
    if( !pluginsFilterCache[pluginSelector] ) {
      pluginsFilterCache[pluginSelector] = function (el) {

        if( el.__found__ ) {
          return false;
        }
        el.__found__ = true;

        el.$$plugins = el.$$plugins || {};
        if( !el.$$plugins[pluginSelector] ) {
          el.$$plugins[pluginSelector] = true;
          return true;
        }
      };
    }
    return pluginsFilterCache[pluginSelector];
  }

  function findElements (jBase, pluginSelector) {
    var matches = [], n = 0, i, j, len, len2, filtered,
        pluginFilter = pluginSelectorFilter(pluginSelector);

    for( i = 0, len = jBase.length ; i < len ; i++ ) {
      filtered = [].filter.call( jBase[i].querySelectorAll(pluginSelector), pluginFilter );
      for( j = 0, len2 = filtered.length ; j < len2 ; j++ ) {
        matches[n++] = filtered[j];
      }
    }

    for( i = 0 ; i < n ; i++ ) {
      delete matches[i].__found__;
    }

    return jq(matches);
  }

  function runPlugin (jBase, pluginSelector) {
    var handler = pluginCache[pluginSelector],
        elements = findElements(jBase, pluginSelector);

    if( handler && elements.length ) {
      if( handler._collection ) {
        handler( elements );
      } else {
        elements.each(handler);
      }
    }
  }

  function initPlugin () {
    pluginsAre.loading = true;
    jq(function () {
      for( var pluginSelector in pluginCache ) {
        runPlugin(jDoc, pluginSelector);
      }

      jq(document.body).on('DOMSubtreeModified', function (e) {
        var jTarget = jq(event.target);

        for( var pluginSelector in pluginCache ) {
          runPlugin(jTarget, pluginSelector);
        }
      });

      delete pluginsAre.loading;
      pluginsAre.running = true;
    });
  }

  jq.plugin = function (selector, handler, collection) {
    if( typeof selector !== 'string' || !(handler instanceof Function) ) {
      throw new Error('required selector (string) and handler (function)');
      return;
    }

    pluginCache[selector] = handler;
    pluginCache[selector]._collection = !!collection;

    if( pluginsAre.loading ) {
      return;
    }

    if( pluginsAre.running ) {
      runPlugin(jDoc, selector);
    } else {
      initPlugin();
    }
  };

  // widgets

  var widgets = {},
      widgetsAre = {};

  function initWidget () {
    widgetsAre.loading = true;
    jq(function () {
      jq.plugin('[data-widget]', function () {
        ( widgets[this.getAttribute('data-widget')] || noop ).call(this);
      });
      delete widgetsAre.loading;
      widgetsAre.running = true;
    });
  };

  jq.widget = function (widgetName, handler) {
    if( typeof widgetName === 'string' && handler instanceof Function ) {

      widgets[widgetName] = handler;

      if( !widgetsAre.loading ) {
        return;
      }

      if( widgetsAre.running ) {
        jq('[data-widget="' + widgetName + '"]').each(handler);
      } else {
        initWidget();
      }
    }
  };

})(this);
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var arrayShift = [].shift;

module.exports = function extend () {
  var dest = arrayShift.call(arguments),
      src = arrayShift.call(arguments),
      key;

  while( src ) {
    for( key in src) {
      dest[key] = src[key];
    }
    src = arrayShift.call(arguments);
  }

  return dest;
};

},{}],2:[function(require,module,exports){

var RE_$$ = /^\$\$/,
    arrayShift = [].shift,
    _ = require('./kit-type');

function _merge () {
    var dest = arrayShift.call(arguments),
        src = arrayShift.call(arguments),
        key;

    while( src ) {

        if( typeof dest !== typeof src ) {
            dest = _.isArray(src) ? [] : ( _.isObject(src) ? {} : src );
        }

        if( _.isObject(src) ) {

            for( key in src ) {
                if( src[key] !== undefined ) {
                    if( typeof dest[key] !== typeof src[key] ) {
                        dest[key] = _merge(undefined, src[key]);
                    } else if( _.isArray(dest[key]) ) {
                        [].push.apply(dest[key], src[key]);
                    } else if( _.isObject(dest[key]) ) {
                        dest[key] = _merge(dest[key], src[key]);
                    } else {
                        dest[key] = src[key];
                    }
                }
            }
        }
        src = arrayShift.call(arguments);
    }

    return dest;
}

module.exports = {
  extend: require('./extend'),
  merge: _merge,
  copy: function (o) {
      return _merge(undefined, o);
  }
};

},{"./extend":1,"./kit-type":3}],3:[function(require,module,exports){
'use strict';

function _isType (type) {
    return function (o) {
        return (typeof o === type);
    };
}

function _instanceOf (_constructor) {
    return function (o) {
        return ( o instanceof _constructor );
    };
}

module.exports = {
  isType: function (type, value) {
    if( value === undefined ) {
      return _isType(type);
    }
    return _isType(type)(value);
  },
  instanceOf: function (Proto, value) {
    if( value === undefined ) {
      return _instanceOf(Proto);
    }
    return _instanceOf(Proto)(value);
  },
  isObject: _isType('object'),
	isFunction: _isType('function'),
	isString: _isType('string'),
	isNumber: _isType('number'),
	isArray: Array.isArray || _instanceOf(Array),
	isDate: _instanceOf(Date),
	isRegExp: _instanceOf(RegExp),
	isElement: function(o) {
    return o && o.nodeType === 1;
  },
  isUndefined: function (value) {
    return value === undefined;
  }
};

},{}],4:[function(require,module,exports){

function stepResult (step, value, type) {
  if( value && value.then ) {
    value.then(function (result) {
      step.deferred.resolve(result);
    }, function (reason) {
      step.deferred.reject(reason);
    });
  } else {
    step.deferred[type](value);
  }
}

function processQueue(promise) {
  if( promise.$$fulfilled === undefined ) {
    return;
  }

  var len = promise.$$queue.length,
      step = promise.$$queue.shift(),
      type = promise.$$fulfilled ? 'resolve' : 'reject',
      uncough = !promise.$$fulfilled && promise.$$uncought++;

  while( step ) {

    if( step[type] ) {
      uncough = false;

      try {
        stepResult(step, step[type](promise.$$value), 'resolve');
      } catch (reason) {
        stepResult(step, reason, 'reject');
      }

    } else {
      stepResult(step, promise.$$value, type);
    }

    step = promise.$$queue.shift();
  }

  if( uncough ) {
    setTimeout(function () {
      if( promise.$$uncough === uncough ) {
        throw new Error('Uncaught (in promise)');
      }
    }, 0);
  }
}

function Promise (executor) {
  if( !( executor instanceof Function ) ) {
    throw new TypeError('Promise resolver undefined is not a function');
  }

  var p = this;
  this.$$queue = [];
  this.$$uncough = 0;

  executor(function (result) {
    p.$$fulfilled = true;
    p.$$value = result;
    processQueue(p);
  }, function (reason) {
    p.$$fulfilled = false;
    p.$$value = reason;
    processQueue(p);
  });
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  var _this = this,
      _promise = new Promise(function (resolve, reject) {
        _this.$$queue.push({ resolve: onFulfilled, reject: onRejected, deferred: { resolve: resolve, reject: reject } });
      });

  processQueue(this);

  return _promise;
};

Promise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected);
};

Promise.all = function (iterable) {
  return new Promise(function (resolve, reject) {
    var pending = iterable.length,
        results = [];
    iterable.forEach(function (_promise, i) {

      ( _promise.then ? _promise : Promise.resolve(_promise) ).then(function (result) {
        results[i] = result;
        if( --pending === 0 ) {
          resolve(results);
        }
      }, function (reason) {
        if( pending !== -1 ) {
          pending === -1;
          reject(reason);
        }
      });
    });
  });
};

Promise.race = function (iterable) {
  return new Promise(function (resolve, reject) {
    var done = false;

    iterable.forEach(function (_promise, i) {
      if( done ) {
        return;
      }
      ( _promise.then ? _promise : Promise.resolve(_promise) ).then(function (result) {
        if( !done ) {
          done = true;
          resolve(result);
        }
      }, function (reason) {
        if( !done ) {
          done = true;
          reject(reason);
        }
      });
    });
  });
};

Promise.resolve = function (result) {
  return new Promise(function (resolve, reject) { resolve(result); });
};

Promise.reject = function (reason) {
  return new Promise(function (resolve, reject) { reject(reason); });
};

module.exports = Promise;

},{}],5:[function(require,module,exports){
(function (global){

module.exports = require('./promise-qizer')( global.Promise || require('./promise-polyfill') );

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./promise-polyfill":4,"./promise-qizer":6}],6:[function(require,module,exports){

module.exports = function (Promise) {

  function q (executor) {
    return new Promise(executor);
  }

  ['resolve', 'reject', 'all', 'race'].forEach(function (fName) {
    q[fName] = Promise[fName];
  });

  q.when = function (p) { return ( p && p.then ) ? p : Promise.resolve(p); };

  return q;

};

},{}],7:[function(require,module,exports){
(function (global){

if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['$http'], function () {
      return require('./http');
    });
} else {
    // Browser globals
    global.$http = require('./http');
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./http":8}],8:[function(require,module,exports){

// factory http

var $q = require('promise-q'),
    _ = require('nitro-tools/lib/kit-extend');

function resolveFunctions (o, thisArg, args) {
  for( var key in o ) {
    if( o[key] instanceof Function ) {
      o[key] = o[key].apply(thisArg, args || []);
    } else if( typeof o[key] === 'string' ) {
      o[key] = resolveFunctions(o[key], thisArg, args);
    }
  }
  return o;
}

function headerToTitleSlug(text) {
  console.log('headerToTitleSlug', text);
  var key = text.replace(/([a-z])([A-Z])/g, function (match, lower, upper) {
      return lower + '-' + upper;
  });
  key = key[0].toUpperCase() + key.substr(1);

  return key;
}

function headerToCamelCase(text) {
  var key = text[0].toLowerCase() + text.substr(1);
  return key.replace(/([a-z])-([A-Z])/g, function (match, lower, upper) {
    return lower + upper;
  });
}

var RE_contentType = /([^\/]+)\/([^+]+\+)?(.*)/;
function parseContentType(contentType, text, xml) {
  var matches = contentType && contentType.match(RE_contentType);
  return matches && ( matches[3] === 'json' ? JSON.parse(text) : ( matches[3] === 'xml' ? xml : text ) );
}

function _getHeaders (request) {
  var headers = {};
  request.getAllResponseHeaders().replace(/\s*([^\:]+)\s*\:\s*([^\;\n]+)/g, function (match, key, value) {
      headers[headerToCamelCase(key)] = value.trim();
  });

  return headers;
}

function http (url, config) {

  if( config === undefined ) {
    http.url(url);
  }

  config = resolveFunctions( _.copy(config || {}) );
  config.headers = config.headers || {};
  config.url = url;

  return $q(function (resolve, reject) {

    var request = null;

    try { // Firefox, Opera 8.0+, Safari
        request = new XMLHttpRequest();
    } catch (e) { // Internet Explorer
        try { request = new ActiveXObject('Msxml2.XMLHTTP'); }  // jshint ignore:line
        catch (er) { request = new ActiveXObject('Microsoft.XMLHTTP'); }  // jshint ignore:line
    }
    if( request === null ) { throw 'Browser does not support HTTP Request'; }

    if( config.params ) {
      var i = 0;
      for( var param in config.params ) {
        url += ( i++ ? '&' : ( /\?/.test(url) ? '&' : '?' ) ) + param + '=' + encodeURIComponent(config.params[param]);
      }
    }

    request.open( ( config.method || 'get').toUpperCase(), url );

    if( config.withCredentials ) {
      request.withCredentials = true;
    }

    for( var key in config.headers ) {
        request.setRequestHeader( headerToTitleSlug(key), config.headers[key] );
    }

    request.onreadystatechange = function(){
      if( request.readyState === 'complete' || request.readyState === 4 ) {
        var response = {
          config: request.config,
          data: parseContentType(request.getResponseHeader('content-type'), request.responseText, request.responseXML),
          status: request.status,
          headers: (function () {
            var headersCache;
            return function () {
              if( !headersCache ) {
                headersCache = _getHeaders(request);
              }
              return headersCache;
            };
          })(),
          xhr: request
        };
        if( request.status >= 200 && request.status < 300 ) {
          resolve( response );
        } else {
          reject( response );
        }
      }
    };

    request.config = config;

    if( typeof config.data !== 'string'  ) {}

    if( config.contentType ) {
      request.setRequestHeader( 'Content-Type', config.contentType );

      if( config.contentType === 'application/json' && typeof config.data !== 'string' ) {
        config.data = JSON.stringify(config.data);
      }

    } else {
      if( typeof config.data === 'string' ) {
        config.contentType = 'text/html';
      } else {
        config.contentType = 'application/json';
        config.data = JSON.stringify(config.data);
      }
    }

    request.send( config.data );

  });
}

http.noCache = function (url, config) {
  url += ( /\?/.test(url) ? '&' : '?' ) + 't=' + new Date().getTime();
  return http(url, config);
};

http.plainResponse = function (response) {
  return {
    config: response.config,
    data: response.data,
    status: response.status,
    headers: response.headers()
  };
};

['get', 'delete'].forEach(function (method) {
  http[method] = function (url, config) {
    config = _.copy(config || {});
    config.method = method;
    return http(config);
  };
});

['post', 'put'].forEach(function (method) {
  http[method] = function (url, data, config) {
    config = _.copy(config || {});
    config.data = data || {};
    config.method = method;
    return http(config);
  };
});

http.url = function (url) {
  var urlFn = function () {
    return http.get.apply(null, [url].concat( [].slice.call(arguments) ) );
  };
  ['get', 'post', 'put', 'delete'].forEach(function (method) {
    return http[method].apply(null, [url].concat( [].slice.call(arguments) ) );
  });
};

module.exports = http;

},{"nitro-tools/lib/kit-extend":2,"promise-q":5}],9:[function(require,module,exports){
(function (global){

if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['$q'], function () {
      return require('./q');
    });
} else {
    // Browser globals
    global.$q = require('./q');
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./q":11}],10:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],11:[function(require,module,exports){
(function (global){

module.exports = require('./qizer')( global.Promise || require('./promise-polyfill') );

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./promise-polyfill":10,"./qizer":12}],12:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}]},{},[7,9]);
