
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

(function () {
	'use strict';

	var _global = (typeof window === 'undefined' ? module.exports : window);

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

	function globalize (varName, o) {
		if( o ) {
			_global[varName] = o;
		} else if(varName) {
			_global[varName] = definitions[varName];
		} else {
			for( varName in definitions ) {
				_global[varName] = definitions[varName];
			}
		}
	}

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
		console.debug('fn defined: ', fnName);
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
						params.replace(/([^,]+),?/, function (match, param) {
							dependencies.push(param);
						});
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

	fn.globalize = globalize;

	globalize('fn', fn);

	if( !_global.define ) {
		_global.define = fn.define;
	}

	if( typeof window !== 'undefined' ) {
		fn.load = window.addEventListener ? function (listener) {
			window.addEventListener('load', listener, false);
			return fn;
		} : function (listener) {
			window.attachEvent('onload', listener );
			return fn;
		};
	}


	fn.ready = function (callback) {
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

		if( Object.keys(missingDependencies).length ) {
			console.group('missing dependencies');
			for( key in missingDependencies ) {
				console.log(key, missingDependencies[key]);
			}
			console.groupEnd();
		}
	});

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
    var jqlite = factory();
    if ( typeof fn === 'function' ) {
      fn.define('jqlite', function () { return jqlite; } );
    } else if( typeof angular === 'function' ) {
      angular.module('jqlite', []).constant('jqlite', jqlite );
    } else if ( typeof define === 'function' && define.amd ) {
      define(['jqlite'], function () { return jqlite; });
    } else {
      root.jqlite = jqlite;
    }
    if( !root.$ ) {
      root.$ = jqlite;
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
      noop = function noop () {},
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
        return jChildren;
      default:
        return pushMatches( new ListDOM(), document.querySelectorAll(selector) );
    }
  }

  function initList(selector) {

    if( selector instanceof Array || selector instanceof NodeList || selector instanceof HTMLCollection ) {
      return pushMatches( new ListDOM(), selector );
    } else if( selector === document || selector instanceof HTMLElement || selector instanceof Element ) {
      var list2 = new ListDOM();
      list2[0] = selector;
      list2.length = 1;
      return list2;

    } else if( selector instanceof Function ) {
      ready(selector);
    } else if( selector === undefined ) {
      return new ListDOM();
    }
  }

  function jqlite (selector){
    if( typeof selector === 'string' ) {
      return stringMatches(selector);
    }
    return initList(selector);
  }

  jqlite.noop = noop;

  // document ready

  var _onLoad = window.addEventListener ? function (listener) {
    window.addEventListener('load', listener, false);
  } : function (listener) {
    window.attachEvent('onload', listener );
  };

  function ready (callback) {
    if( callback instanceof Function ) {
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

  jqlite.fn = ListDOM.prototype;

  ListDOM.prototype.get = function(pos) {
      return pos ? this[pos] : this;
    };

  ListDOM.prototype.eq = function(pos) {
      if( !pos instanceof Number ) {
        throw 'number required';
      }
      var item = ( pos < 0 ) ? this[this.length - pos] : this[pos], list = new ListDOM();

      if(item) {
        list[0] = item;
        list.length = 1;
      }
      return list;
    };

  ListDOM.prototype.find = function(selector) {
      var list = this, elems = new ListDOM(), found, i, len;

      if( /^\s*>/.test(selector) ) {
        selector = selector.replace(/^\s*>\s*([^\s]*)\s*/, function (match, selector2) {
          list = list.children(selector2);
          return '';
        });

        if( !selector ) {
          return list;
        }
      }

      if( list.length === 1 ) {
        found = list[0].querySelectorAll(selector);
        for( i = 0, len = found.length; i < len; i++ ) {
          elems[i] = found[i];
        }
        elems.length = len;
      } else if( list.length > 1 ) {
        var j, len2;
        for( i = 0, len = list.length; i < len; i++ ) {
            found = list[i].querySelectorAll(selector);
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
      if( className.indexOf(' ') >= 0 ) {
        var jThis = $(this);
        className.split(' ').forEach(function (cn) {
          jThis.addClass(cn);
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
        jContent2 = ( i ? jContent.clone(true) : jContent );
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

      jContent.remove();

      for( i = 0, len = this.length; i < len; i++ ) {
        jContent2 = ( i ? jContent.clone(true) : jContent );
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
      }
      return this;
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
    var i, len;

    if( typeof eventName === 'string' ) {
      if( !(listener instanceof Function) ) {
        throw 'listener needs to be a function';
      }

      for( i = 0, len = this.length; i < len; i++ ) {
        attachElementListener(this[i], eventName, listener);
      }
    } else if( eventName instanceof Array ) {
      for( i = 0, len = eventName.length; i < len; i++ ) {
        this.on(eventName[i], listener);
      }
    } else if( eventName instanceof Object ) {
      for( i in eventName ) {
        this.on(i, eventName[i]);
      }
    }

    return this;
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

  function autoDestroyListener (element, eventName, listener) {
    var _listener = function () {
      detachElementListener(element, eventName, _listener);
      listener.apply(null, arguments);
    };

    return _listener;
  }

  ListDOM.prototype.once = function (eventName, listener) {

    var i, len;

    if( typeof eventName === 'string' ) {
      if( !(listener instanceof Function) ) {
        throw 'listener needs to be a function';
      }

      var element;

      for( i = 0, len = this.length; i < len; i++ ) {
        element = this[i];
        attachElementListener(element, eventName, autoDestroyListener(element, eventName, listener) );
      }
    } else if( eventName instanceof Array ) {
      for( i = 0, len = eventName.length; i < len; i++ ) {
        this.once(eventName[i], listener);
      }
    } else if( eventName instanceof Object ) {
      for( i in eventName ) {
        this.once(i, eventName[i]);
      }
    }

    return this;
  };
  // for jQuery compatibility
  ListDOM.prototype.one = ListDOM.prototype.once;

  ListDOM.prototype.off = function (eventName, listener) {
    if( typeof eventName !== 'string' || !(listener instanceof Function) ) {
      throw 'bad arguments';
    }

    for( var i = 0, len = this.length; i < len; i++ ) {
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

  // finally

  return jqlite;

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


(function (root) {

  if( !root.$ ) {
    return;
  }

  var jq = root.$,
      $doc = jq(document);

  jq.plugin = function (selector, handler, collection) {
    if( typeof selector === 'string' && handler instanceof Function ) {
      jq.plugin.cache[selector] = handler;
      jq.plugin.cache[selector]._collection = !!collection;
    }

    if( !jq.plugin.ready ) {
      $.plugin.run($doc, selector);
    } else if( jq.plugin.running ) {
      jq.plugin.running = true;
      jq.plugin.init($doc);
    }
  };
  jq.plugin.running = false;
  jq.plugin.cache = {};
  jq.plugin.run = function (jBase, pluginSelector) {

    var handler = jq.plugin.cache[pluginSelector],
        elements = jBase.find(pluginSelector);

    if( elements.length ) {
      if( handler._collection ) {
        handler( elements );
      } else {
        elements.each(handler);
      }
    }
  };

  jq.plugin.init = function (jBase) {
    $(function () {
      for( var pluginSelector in jq.plugin.cache ) {
        jq.plugin.run(jBase, pluginSelector);
      }
      jq.plugin.ready = true;
    });
  };

  function jqWidget (widgetName, handler) {
    if( typeof widgetName === 'string' && handler instanceof Function ) {

      jqWidget.widgets[widgetName] = handler;

      if( jqWidget.enabled ) {
        console.log('running widget directly', widgetName);
        $('[data-widget="' + widgetName + '"]').each(handler);
      } else if( !jqWidget.loading ) {
        jqWidget.loading = true;
        jqWidget.init();
      }
    }
  }

  jqWidget.init = function () {
    $(function () {
      jq.plugin('[data-widget]', function () {
        var widgetName = this.getAttribute('data-widget');

        console.log('running widget', widgetName);

        if( jqWidget.widgets[widgetName] ) {
          jqWidget.widgets[widgetName].call(this);
        }
      });
      jqWidget.enabled = true;
      jqWidget.loading = false;
    });
  };
  jqWidget.widgets = {};

  jq.widget = jqWidget;

  var jqHtml = jq.fn.html;

  jq.fn.html = function (html) {
    jqHtml.apply(this, arguments);

    if(html) {
      jq.plugin.init(this);
    }
  };

})(this);


/*  ----------------------------------------------------------------------------------------- */

/*
 * compile.js
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


(function (root, factory) {
    'use strict';

    if ( typeof root === 'undefined' ) {
        if ( typeof module !== 'undefined' ) {
            module.exports = factory();
        }
    } else {
    	if ( root.define !== undefined ) {
            root.define('compile', factory );
        } else if ( root.fn !== undefined ) {
            root.fn.define('compile', factory );
        } else if( !root.compile ) {
            root.compile = factory();
        }
    }

})(this, function () {
    'use strict';

    function noop () {}

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

    // ----------------------------

    function parseExpression (expression) {
        /* jshint ignore:start */
        return (new Function('model', 'try{ with(model) { return (' + expression + ') }; } catch(err) { return \'\'; }'));
        /* jshint ignore:end */
    }

    function _each(o, handler) {

      if( !isFunction(handler) ) {
        throw 'handler should be a function';
      }

      if( isArray(o) ) {
        o.forEach(handler);
      } else if( isObject(o) ) {
        for( var key in o ) {
          handler.apply(null, [o[key], key]);
        }
      }
    }

    function _extend (dest, src) {
      for( var key in src ) {
        dest[key] = src[key];
      }
    }

    function Scope (data) {
        if( data instanceof Object ) {
            _extend(this, data);
        }
    }

    Scope.prototype.$new = function(data) {
        var S = function (data) {
            if( data instanceof Object ) {
                _extend(this, data);
            }
        };
        S.prototype = this;
        return new S(data);
    };

    Scope.prototype.$extend = function(data) {
        return _extend(this, data);
    };

    Scope.prototype.$eval = function ( expression ) {
        return parseExpression(expression)(this);
    };

    // ----------------------------

    var splitRex = /\$[\w\?]*{[^\}]+}|{[\$\/]}|{\:}/,
        matchRex = /(\$([\w\?]*){([^\}]+)})|({[\$\/]})|({\:})/g;

    function _compile(tmpl){

        if( !isString(tmpl) ) {
            throw 'template should be a string';
        }

        var texts = tmpl.split(splitRex),
            list = [texts.shift()];

        tmpl.replace(matchRex,function(match, match2, cmd, expression, closer, colon){
            list.push( closer ?
            			{ cmd: '', expression: '/' } :
            			( colon ?
            				{ cmd: '', expression: 'else' } :
            				{ cmd: cmd, expression: expression }
            			)
            		);
            list.push(texts.shift());
        });

        var compiled = raiseList(list, 'root');

        return compiled;
    }

    function raiseList(tokens, cmd, expression) {
        cmd = (cmd || '').trim();
        expression = expression || '';

        var options = { content: [] },
            currentOption = 'content',
            nextOption = function (optionName) {
                options[optionName] = [];
                currentOption = optionName;
            };

        var token = tokens.shift();

        while( token !== undefined ){

            if( typeof token === 'string' ) {
            	options[currentOption].push(token);
            } else if( isObject(token) ) {
                if( token.cmd ) {

                    if( _cmd[token.cmd] && _cmd[token.cmd].standalone ) {
                      options[currentOption].push(new ModelScript(token.cmd,token.expression.replace(/\/$/,'')));
                    } else {
                      switch(token.cmd) {
                          case 'case':
                          case 'when':
                              nextOption(token.expression);
                              break;
                          default: // cmd is like a helper
                              if( token.expression.substr(-1) === '/' ) {
                              	options[currentOption].push(new ModelScript(token.cmd, token.expression.replace(/\/$/,'') ));
                              } else {
                              	options[currentOption].push(raiseList(tokens, token.cmd, token.expression));
                              }
                              break;
                      }
                    }

                } else switch( token.expression ) {
                    case 'else':
                    case 'otherwise': nextOption('otherwise'); break;
                    case '/':
                        return new ModelScript(cmd, expression, options); // base case
                    default:
                        options[currentOption].push( new ModelScript('var', token.expression ) );
                        break;
                }
            }
            token = tokens.shift();
        }
        return new ModelScript(cmd, expression, options);
    }

    function _evalContent(scope, content) {
        var result = '';

        if( isFunction(content) ) {
          return content(scope);
        } else if( isArray(content) ) {

          // console.warn('_evalContent', scope, content);
          content.forEach(function(token){
              if( isString(token) ) {
              	result += token;
              } else if( token instanceof ModelScript ) {
              	result += token.render(scope);
              } else if( isArray(token) ) {
              	result += _evalContent(scope, content);
              }
          });

          return result;
        } else {
          return content;
        }
    }



    var _cmd = {
          root: function(scope){
            return this.content(scope);
          },
          var: function(scope, expression){
            return scope.$eval(expression);
          },
          if: function(scope, condition){
            return scope.$eval(condition) ? this.content(scope) : this.otherwise(scope);
          }
        };
    _cmd['?'] = _cmd.if;

    function _optionEvaluator (content) {
      return function (scope) {
        return _evalContent(scope, content );
      };
    }

    function ModelScript(cmd, expression, options){
        this.cmd = cmd;
        this.expression = expression;
        this.options = { content: noop, otherwise: noop };

        for( var key in options ) {
          this.options[key] = _optionEvaluator(options[key]);
        }
    }

    ModelScript.prototype.render = function (data) {

        if( !isFunction(_cmd[this.cmd]) ) {
          return '[command ' + this.cmd+' not found]';
        }

        var scope = ( data instanceof Scope ) ? data : new Scope(data),
            content = _cmd[this.cmd].apply(
                          this.options,
                          [scope, this.expression]
                      );

        return '' + _evalContent(scope, content);
    };

    function compile (template) {
        var compiled = _compile(template),
            renderer = function (scope) {
                return compiled.render(scope);
            };

        renderer.compiled = compiled;

        return renderer;
    }


    // compile.cmd

    compile.cmd = function(cmdName, handler, standalone){
        if( isString(cmdName) && isFunction(handler) ) {
            handler.standalone = standalone;
            _cmd[cmdName] = handler;
        }
    };


    // each as compile.cmd example

    var RE_EACH_INDEX = /^(.*)(\,(.*))in(.*)$/,
        RE_EACH = /^(.*)\bin\b(.*)$/,
        _cmdEach = function (scope, listExp, itemExp, indexExp) {

          var _this = this,
              result = '',
              list = scope.$eval(listExp),
              indexKey;

          if( isArray(list) ) {
            indexKey = '$index';
          } else if( isObject(list) ) {
            indexKey = '$key';
          } else {
            console.warn('can not list', list);
            return '';
          }

          _each(list, function (item, index) {
            var o = {};
            o[itemExp] = item;
            o[indexKey] = index;
            if( indexExp ) {
              o[indexExp] = index;
            }
            result += _this.content( scope.$new(o) );
          });

          return result;
        };

    compile.cmd('each', function (scope, expression) {
          var _this = this, match;

          match = expression.match(RE_EACH_INDEX);
          if( match ) {
            return _cmdEach.call(this, scope, match[4], match[1].trim(), match[3].trim());
          }

          match = expression.match(RE_EACH);
          if ( match ) {
            return _cmdEach.call(this, scope, match[2], match[1].trim());
          }

          throw expression + ' malformed each expression';
        });

    // partials

    var _partials = {};

    compile.partial = function (key, value) {
      if( !key ) {
        return '';
      }

      if( value ) {
        _partials[key] = compile(value);
      }
      return  _partials[key];
    };

    compile.cmd('include', function (scope, expression) {
      var partial = _partials[expression.trim()];
      if( partial ) {
        return partial(scope);
      }
      partial = _partials[scope.$eval(expression)];
      if( partial ) {
        return partial(scope);
      }

      throw 'partial' + expression + 'not found';
    });

    // --------------------------

    return compile;
});


/*  ----------------------------------------------------------------------------------------- */


// cookies.js library from https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
// adapted to be used with jstools-core

(function (definition) {

  if ( typeof window === 'undefined' ) {
    if ( typeof module !== 'undefined' ) {
      module.exports = definition();
    }
  } else {
    if ( window.fn ) {
      fn.define('cookie', definition)
    } else if( !window.cookie ) {
      window.cookie = definition();
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

    function _triggerEvent (handlers, attrs, caller) {
        if( handlers ) {
            for( var i = 0, len = handlers.length; i < len; i++ ) {
                handlers[i].handler.apply(caller, attrs);
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

        target.trigger = function (eventName, attrs, caller) {
            _triggerEvent(listeners[eventName], attrs, caller);

            var len = _triggerEvent(listenersOnce[eventName], attrs, caller);
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
            fn.define('http', definition);
        } else if( !window.http ) {
            window.http = definition();
        }
    }

})(function () {
    'use strict';

    function extend () {
        var auxArray = [],
            dest = auxArray.shift.call(arguments),
            src = auxArray.shift.call(arguments),
            key;

        while( src ) {
            for( key in src ) {
                if( dest[key] instanceof Object && src[key] instanceof Object ) {
                    dest[key] = extend({}, src[key]);
                } else {
                    dest[key] = src[key];
                }
            }
            src = auxArray.shift.call(arguments);
        }

        return dest;
    }

    function joinPath () {
        var path = (arguments[0] || '').replace(/\/$/, '');

        for( var i = 1, len = arguments.length - 1 ; i < len ; i++ ) {
            path += '/' + arguments[len].replace(/^\/|\/$/, '');
        }
        if( len ) {
            path += arguments[len] ? ( '/' + arguments[len].replace(/^\//, '') ) : '';
        }

        return path;
    }

    function serializeParams (params, prefix, notFirst) {
        if( params ) {

            prefix = prefix || '';
            notFirst = notFirst || 0;

            if( params instanceof Function ) {
                return ( notFirst ? '&' : '' ) + encodeURIComponent(prefix) + '=' + encodeURIComponent( params() );
            } else if( params instanceof Object ) {
                var paramsStr = '';

                for( var key in params ) {
                    paramsStr += serializeParams( params[key], ( prefix ? (prefix + '.') : '' ) + key, notFirst++ );
                }

                return paramsStr;

            } else {
                return ( notFirst ? '&' : '' ) + encodeURIComponent(prefix) + '=' + encodeURIComponent(params);
            }

        } else return '';
    }

    function toTitleSlug(text) {
        var key = text[0].toUpperCase() + text.substr(1);
        return key.replace(/([a-z])([A-Z])/, function (match, lower, upper) {
            return lower + '-' + upper;
        });
    }

    function toCamelCase(text) {
        var key = text[0].toLowerCase() + text.substr(1);
        return key.replace(/([a-z])-([A-Z])/, function (match, lower, upper) {
            return lower + upper;
        });
    }

    function processQueue (request, queue, data, resolved) {
        var step = queue.shift(),
            newData = undefined;


        if( !step ) {
            step = queue.$finally.shift();
        }

        if( step instanceof Function ) {

            step(data, request.status, request);

        } else if( step instanceof Object ) {

            if( resolved && step.resolve ) {
                newData = step.resolve(data, request.status, request);
            }

            if( !resolved && step.reject ) {
                newData = step.reject(data, request.status, request);
            }

            if( newData && newData.then ) {
                queue.forEach(function (step) {
                    newData.then(step.resolve, step.reject);
                });

                if( newData.finally ) {
                    queue.$finally.forEach(function (step) {
                        newData.finally(step.resolve, step.reject);
                    });
                } else if( queue.$finally.length ) {
                    throw 'received promise not implements finally';
                }

                step = false;
            }

        }

        if( step ) {
            processQueue(request, queue, (newData === undefined) ? data : newData, resolved);
        }
    }

    function processResponse (request, handlersQueue, catchCodes) {
        request.headers = {};
        request.getAllResponseHeaders().replace(/\s*([^\:]+)\s*\:\s*([^\;\n]+)/g, function (match, key, value) {
            request.headers[toCamelCase(key)] = value.trim();
        });

        var data = request.responseText;
        if( request.headers.contentType === 'application/json' ) {
            data = JSON.parse(data);
        } else if( request.headers.contentType === 'application/xml' ) {
            data = (new DOMParser()).parseFromString(data, 'text/xml');
        }

        if( catchCodes[request.status] ) {
            catchCodes[request.status].apply(request, [ data, function (data) {
                processQueue(request, handlersQueue, data, true);
            }, function (reason) {
                processQueue(request, handlersQueue, reason, true);
            } ]);
        } else if( request.status >= 200 && request.status < 300 ) {
            request.$resolved = true;
            processQueue(request, handlersQueue, data, true);
        } else {
            processQueue(request, handlersQueue, data, false);
        }
    }

    function HttpUrl (url) {
        this.url = url;
    }

    ['get', 'head', 'options', 'post', 'put', 'delete', 'patch'].forEach(function (method) {
        HttpUrl.prototype[method] = function () {
            var args = [this.url];

            [].push.apply(args, arguments);

            return http[method].apply(null, args);
        };
    });

    function http (url, _options){

        url = ( url instanceof Array ) ? joinPath.apply(null, url) : url;

        if( url instanceof Object ) {
            _options = url;
            url = _options.url;
        }

        if( _options === undefined ) {
            return new HttpUrl(url);
        }

        var options = extend({}, http.defaults),
            key,
            catchCodes = {},
            handlersQueue = [];

        for( key in _options ) {
            if( _options[key] instanceof Function ) {
                _options[key] = _options[key]();
            }
            if( options[key] instanceof Function ) {
                options[key] = options[key]();
            }
            if( key !== 'data' && _options[key] instanceof Object ) {
                extend(options[key], _options[key])
            } else {
                options[key] = _options[key];
            }
        }

        if( !url ) {
            throw 'url missing';
            return false;
        }

        if( /^get$/.test(options.method) && options.data instanceof Object && Object.keys(options.data).length ) {
            console.log('options.data', options.data);
            url += '?' + serializeParams(options.data);
            options.data = null;
        }
        
        var request = null;
        try { // Firefox, Opera 8.0+, Safari
            request = new XMLHttpRequest();
        } catch (e) { // Internet Explorer
            try { request = new ActiveXObject("Msxml2.XMLHTTP"); }
            catch (e) { request = new ActiveXObject("Microsoft.XMLHTTP"); }
        }
        if (request===null) { throw "Browser does not support HTTP Request"; }

        request.open( options.method.toUpperCase(), url, (options.async === undefined) ? true : options.async );

        for( key in options.headers ) {
            request.setRequestHeader( toTitleSlug(key), options.headers[key]);
        }

        request.onreadystatechange=function(){
            if( request.readyState === 'complete' || request.readyState === 4 ) {
                processResponse(request, handlersQueue, catchCodes);
            }
        }

        if( options.data !== undefined && typeof options.data !== 'string' ) {
            options.data = JSON.stringify(options.data);
        }
        
        request.send( options.data );

        request.then = function (onFulfilled, onRejected) {
            if( onFulfilled instanceof Function ) {
                handlersQueue.push({ resolve: onFulfilled, reject: onRejected });
            }
            return request;
        };

        request.catch = function (onRejected) {
            if( onRejected instanceof Function ) {
                handlersQueue.push({ resolve: null, reject: onRejected });
            }
            return request;
        };

        handlersQueue.$finally = [];

        request.finally = function (onAlways) {
            handlersQueue.$finally.push(onAlways);
            return request;
        };

        return request;
    }

    http.defaults = {
        method: 'get',
        headers: {
            contentType: 'application/json'
        }
    };

    ['get', 'head', 'options', 'post', 'put', 'delete'].forEach(function (method) {
        http[method] = function (url, data, _options){

            url = ( url instanceof Array ) ? joinPath.apply(null, url) : url;

            if( url instanceof Object ) {
                _options = url;
                url = _options.url;
            }
            _options = _options || {};
            _options.data = data;
            _options.method = method;

            return http(url, _options);
        }
    });

    http.patch = function (url, data, options) {

        url = ( url instanceof Array ) ? joinPath.apply(null, url) : url;

        if( url instanceof Object ) {
            url.method = 'patch';
            return http(url);
        } else if( typeof url === 'string' ) {
            options = options instanceof Object ? options : {};

            if( data ) {
                return http(url, extend(options, {
                    method: 'patch',
                    data: data
                }) );
            } else {
                var patchOps = [],
                    addOp = function (patchOp) {
                        patchOps.push(patchOp);
                        return patchHandler;
                    },
                    patchHandler = {
                        add: function (path, value) {
                            return addOp({ op: 'add', path: path, value: value });
                        },
                        test: function (path, value) {
                            return addOp({ op: 'test', path: path, value: value });
                        },
                        replace: function (path, value) {
                            return addOp({ op: 'replace', path: path, value: value });
                        },
                        move: function (from, path) {
                            return addOp({ op: 'move', from: from, path: path });
                        },
                        copy: function (from, path) {
                            return addOp({ op: 'copy', from: from, path: path });
                        },
                        remove: function (path) {
                            return addOp({ op: 'remove', path: path });
                        },

                        flush: function () {
                            patchOps.splice(0, patchOps.length);
                            return patchHandler;
                        },

                        submit: function (data) {

                            data = data || patchOps;

                            return http(url, extend(options, {
                                method: 'patch',
                                data: data
                            }) );
                        }
                    };

                return patchHandler;
            }

        }
    };

    return http;
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

(function (definition, root) {

  if ( typeof window === 'undefined' ) {
    if ( typeof module !== 'undefined' ) {
      module.exports = definition();
    }
  } else {
    if ( root.fn ) {
      fn.define('qPromise', function () { return definition(root); } );
    } else if( !root.qPromise ) {
      root.qPromise = definition(root);
    }
  }

})(function (root) {

	function processPromise (promise, handler) {
		if( handler instanceof Function ) {
			setTimeout(function () {
				handler.apply(promise, [function (result) {
					promise.resolve(result);
				}, function (result) {
					promise.reject(result);
				}]);
			}, 0);
		}
	}

	function getStep(queue, action) {
		var step = queue.shift();

		while( queue.length ) {
			if( step[action] ) {
				return step;
			}
			step = queue.shift();
		}

		return (step && step[action]) ? step : false;
	}

	var actionByStatus = {
		fulfilled: 'then',
		rejected: 'catch'
	};

	function processResult (promise, status, value) {

		var action = actionByStatus[ status ],
			step = getStep(promise.queue, action);

		if( step ) {
			promise['[[PromiseStatus]]'] = status;
			if( value !== undefined ) {
				promise['[[PromiseValue]]'] = value;
			}
		} else if( promise['[[PromiseStatus]]'] === 'rejected' ) {
			throw new Error('unhandled promise');
		} else {
			step = promise.queue.finally.shift();

			while( step ) {
				step(value);
				step = promise.queue.finally.shift();
			}

			step = false;
		}

		if( step && step[action] ) {

			try {
				var newValue = step[action].call(promise, value);
				promise['[[PromiseStatus]]'] = 'fulfilled';
			} catch(err) {
				promise['[[PromiseStatus]]'] = 'rejected';
				promise['[[PromiseValue]]'] = err;
				newValue = err;
			}

			if( newValue && newValue.then instanceof Function ) {

				newValue.then(function (result) {
					promise.resolve( result );
					return result;
				}, function (reason) {
					promise.reject( reason );
					throw reason;
				});

			} else {

				switch ( promise['[[PromiseStatus]]'] ) {
					case 'fulfilled':
						promise.resolve( ( newValue === undefined ) ? value : newValue );
						break;
					case 'rejected':
						promise.reject( ( newValue === undefined ) ? value : newValue );
						break;
				}
			}

		}

		return promise;
	}

	function initPromise(promise, handler) {
		promise.queue = [];
		promise.queue.finally = [];

		/*jshint validthis: true */
		promise['[[PromiseStatus]]'] = 'pending';
		promise['[[PromiseValue]]'] = undefined;

		processPromise(promise, handler);
	}

	function P(handler) {

		/*jshint validthis: true */
		if( this === undefined || this === root ) {
			return new P(handler);
		} else {
			initPromise(this, handler);
		}
	}

	P.prototype.then = function (onFulfilled, onRejected) {
		this.queue.push({
			then: ( onFulfilled instanceof Function ) ? onFulfilled : false,
			catch: ( onRejected instanceof Function ) ? onRejected : false
		});

		return this;
	};

	P.prototype.catch = function (onRejected) {
		this.then(undefined, onRejected);

		return this;
	};

	P.prototype.finally = function (onFulfilled) {
		if( onFulfilled instanceof Function ) {
			this.queue.finally.push(onFulfilled);
		}

		return this;
	};

	P.prototype.resolve = function (value) {
		return processResult(this, 'fulfilled', value);
	};

	P.prototype.reject = function (value) {
		return processResult(this, 'rejected', value);
	};

	P.defer = function () {
		var deferred = new P();
		deferred.promise = deferred;
		return deferred;
	};

	P.when = function (promise) {
		var whenPromise = new P(function (resolve, reject) {
			if( promise && promise.then ) {
				promise.then(resolve, reject);
			} else {
				resolve(whenPromise, promise);
			}
		});
		return whenPromise;
	};

	P.all = function (promisesList) {

		promisesList = ( promisesList instanceof Array ) ? promisesList : [];

    var pending = promisesList.length, promisesResult = [];
    promisesResult.length = promisesList.length;

		return new P(function (resolve, reject) {

			if( !pending ) {
				resolve([]);
				return;
			}

			promisesList.forEach(function (promise, index) {
				if( promise instanceof Object && promise.then ) {

          if( promise['[[PromiseStatus]]'] === 'fulfilled' ) {
            promisesResult[index] = promise['[[PromiseValue]]'];
            pending--;

            if( !pending ) {
                resolve(promisesResult);
            }
      		} else if( promise['[[PromiseStatus]]'] === 'reject' ) {
            reject(promise['[[PromiseValue]]']);
      		} else {
  					promise.then(function (result) {

  						promisesResult[index] = result;
              pending--;

  						if( !pending ) {
              		resolve(promisesResult);
  						}

  					}, reject);
          }

				} else {
					throw { promise: promise, error: 'is not a promise' };
				}
			});
		});

	};

	return P;

}, this);


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


(function (definition) {
	'use strict';
	
	if ( typeof window === 'undefined' ) {
		if ( typeof module !== 'undefined' ) {
			module.exports = definition();
		}
	} else {
		if ( window.fn ) {
			fn.define('Scope', definition );
		} else if( !window.Scope ) {
			window.Scope = definition();
		}
	}

})(function () {
	'use strict';

    function parseExpression (expression) {
        /* jshint ignore:start */
        return (new Function('model', 'try{ with(model) { return (' + expression + ') }; } catch(err) { return \'\'; }'));
        /* jshint ignore:end */
    }

    var Scope = function (data) {
        if( data instanceof Object ) {
            this.$$extend(data);
        }
    };

    Scope.prototype.$$new = function(data) {
        var S = function () {
            this.$$extend(data);
        };
        S.prototype = this;
        return new S(data);
    };

    Scope.prototype.$$extend = function(data) {
        for( var key in data ) {
            this[key] = data[key];
        }
        return this;
    };

    Scope.prototype.$$eval = function ( expression ) {
        return parseExpression(expression)(this);
    };

    return Scope;
});


/*  ----------------------------------------------------------------------------------------- */

/*
 * utils.js
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

(function (definition, root) {
	'use strict';
	
	if ( typeof root === 'undefined' ) {
		if ( typeof module !== 'undefined' ) {
			module.exports = definition();
		}
	} else {
		if ( root.fn ) {
			fn.define('_', definition );
		} else if( !root._ ) {
			root._ = definition();
		}
	}

})(function () {
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

    function _key (o, fullKey, value){
        if(! o instanceof Object) return false;
        var oKey, keys = fullKey.split('.');
        if(value !== undefined) {
            if(keys.length) {
                oKey = keys.shift();
                var nextKey = keys.shift();
                while( nextKey ) {
                    if( !o[oKey] ) o[oKey] = {};
                    o = o[oKey];
                    oKey = nextKey;
                    nextKey = keys.shift();
                }
                o[oKey] = value;
                return value;
            }
            return false;
        } else {
            for(var k = 0, len = keys.length, inKeys = o || {}; k < len ; k++ ) {
                oKey = keys[k];
                if( oKey in inKeys ) inKeys = inKeys[keys[k]] || {};
                else return false;
            }
            return inKeys;
        }
    }

    var RE_$$ = /^\$\$/,
        arrayShift = [].shift;

        function _merge () {
            var dest = arrayShift.call(arguments),
                src = arrayShift.call(arguments),
                key;

            while( src ) {

                if( typeof dest !== typeof src ) {
                    dest = ( src instanceof Array ) ? [] : ( src instanceof Object ? {} : src );
                }

                if( src instanceof Object ) {

                    for( key in src ) {
                        if( src[key] !== undefined ) {
                            if( typeof dest[key] !== typeof src[key] ) {
                                dest[key] = _merge(undefined, src[key]);
                            } else if( dest[key] instanceof Array ) {
                                [].push.apply(dest[key], src[key]);
                            } else if( dest[key] instanceof Object ) {
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
                    if( typeof dest[key] !== typeof src[key] ) {
                        dest[key] = src[key];
                    } else {
                        dest[key] = src[key];
                    }
                }
                src = arrayShift.call(arguments);
            }

            return dest;
        }

        function _copy (o) {
            return _merge(undefined, o);
        }


    function joinPath () {
        var path = (arguments[0] || '').replace(/\/$/, '');

        for( var i = 1, len = arguments.length - 1 ; i < len ; i++ ) {
            path += '/' + arguments[len].replace(/^\/|\/$/, '');
        }
        if( len ) {
            path += arguments[len] ? ( '/' + arguments[len].replace(/^\//, '') ) : '';
        }

        return path;
    }

    function _proccessPipe (pipe, args) {
        var result = pipe[0].apply(null, args);

        for( var i = 1, len = pipe.length; i < len; i++ ) {
            result = pipe[i](result);
        }

        return result;
    }

    function _addToPipe (pipe, args) {
        for( var i = 0, len = args.length; i < len; i++ ) {
            if( !args[i] instanceof Function ) {
                throw 'only Functions are allowed as pipe arguments';
            } else {
                pipe.push(args[i]);
            }
        }
    }

    function _eachInList( list, iteratee, thisArg ) {
        for( var i = 0, len = list.length; i < len ; i++ ) {
            iteratee.apply(thisArg, [ list[i], i ]);
        }
    }

    function _eachInObject( o, iteratee, thisArg ) {
        for( var key in o ) {
            iteratee.call(thisArg, [o[key], key]);
        }
    }

    function each (o, iteratee, thisArg) {
        if( o instanceof Array ) {
            _eachInList(o, iteratee, thisArg);
        } else if( o instanceof Object ) {
            _eachInObject(o, iteratee, thisArg);
        }
    }

    function indexOf (list, comparator) {
        
        if( comparator instanceof Function ) {
            for( var i = 0, len = list.length; i < len; i++ ) {
                if( comparator(list[i]) ) {
                    return i;
                }
            }
        } else return list.indexOf(comparator);

        return -1;
    }

    function remove (list, comparator) {

        var i, len;
        
        if( comparator instanceof Function ) {
            for( i = 0, len = list.length; i < len; i++ ) {
                if( comparator(list[i]) ) {
                    list.splice(i, 1);
                    i--;
                }
            }
        } else {
            for( i = 0, len = list.length; i < len; i++ ) {
                if( list[i] === comparator ) {
                    list.splice(i, 1);
                    i--;
                }
            }
        }
    }

    function matchAll (o, filters) {
        for( var key in filters ) {
            if( o[key] !== filters[key] ) {
                return false;
            }
        }
        return true;
    }

    function matchAny (o, filters) {
        for( var key in filters ) {
            if( o[key] === filters[key] ) {
                return true;
            }
        }
        return false;
    }

    function find (list, filters) {
        for( var i = 0, len = list.length ; i < len ; i++ ) {
            if( matchAll(list[i], filters) ) {
                return list[i];
            }
        }

        return false;
    }

    function filter (list, filters) {
        var newList = [];

        for( var i = 0, len = list.length ; i < len ; i++ ) {
            if( matchAll(list[i], filters) ) {
                newList.push(list[i]);
            }
        }

        return newList;
    }

    var _Funcs = {
		isFunction: _isType('function'),
        isString: _isType('string'),
        isNumber: _isType('number'),
        isArray: _instanceOf(Array),
        isDate: _instanceOf(Date),
        isRegExp: _instanceOf(RegExp),
		isObject: function (myVar,type){ if( myVar instanceof Object ) return ( type === 'any' ) ? true : ( typeof myVar === (type || 'object') ); else return false; },

		key: _key,
    	keys: Object.keys,

        extend: _extend,
    	merge: _merge,
        copy: _copy,

        matchAll: matchAll,
        matchAny: matchAny,
        find: find,
        filter: filter,

        joinPath: joinPath,

        // sanitize: sanitize,

        each: each,
        indexOf: indexOf,
        remove: remove,

        pipe: function () {
            var pipe = [];

            _addToPipe(pipe, arguments);

            var pipeFn = function () {
                return _proccessPipe(pipe, arguments);
            };

            pipeFn.pipe = function () {
                _addToPipe(pipe, arguments);
                return pipeFn;
            };

            return pipeFn;
        },
        chain: function (value) {
            return new Chain(value);
        }
	};

    function Chain (value) {
        this.value = value;
    }

    _eachInList(['key', 'keys', 'each', 'indexOf', 'remove'], function (nameFn) {
        Chain.prototype[nameFn] = function () {
            [].unshift.call(arguments, this.value);
            _[nameFn].apply(null, arguments);
        };
    });

    function _ (value) {
        return new Chain(value);
    }

    _extend(_, _Funcs);

	return _;

}, this);


/*  ----------------------------------------------------------------------------------------- */

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

