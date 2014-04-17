//	jPower - This script enhances jQuery providing useful common methods.
//	Copyright (C) 2014  Jesús Manuel Germade Castiñeiras
//	
//	This program is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published by
//	the Free Software Foundation, either version 3 of the License.

window.benchmark = function(task,loops){
    loops = loops || 100000
  if( task instanceof Function ) {
    var start = (new Date()).getTime();
    for(var i=0; i < loops ; i++ ) task();
    var end = (new Date()).getTime();
    return end-start;
  }
  return false;
};

window.log = function(){
  log.history = log.history || [];
  log.history.push(arguments);
  if(this.console){
    console.log( Array.prototype.slice.call(arguments) );
  }
};

(function(){
    function ajax(url,args){
        if( !args ) args = {};
        
        var on = { done: [], fail: [], always: [] };
        
        if( isFunction(args.done) ) on.done.push(args.done);
        if( isFunction(args.fail) ) on.fail.push(args.fail);
        if( isFunction(args.always) ) on.always.push(args.always);
        
        
        if( !args.method ) args.method = 'GET';
        
        if( !args.contentType ) {
            if( /^json$/i.test(args.mode) ) args.contentType = 'application/json';
            else args.contentType = 'application/x-www-form-urlencoded';
        }
        
        if( /^json$/i.test(args.mode) && isObject(args.data) ) args.data = JSON.stringify(args.data);
        
        var xhr = null;
        try	{ // Firefox, Opera 8.0+, Safari
            xhr = new XMLHttpRequest();
        } catch (e) { // Internet Explorer
            try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); }
            catch (e) { xhr = new ActiveXObject("Microsoft.XMLHTTP"); }
        }
        if (xhr===null) { alert ("Browser does not support HTTP Request"); }
        
        xhr.open(args.method,url,(args.async === undefined) ? true : args.async);
        xhr.onreadystatechange=function(){
            if( xhr.readyState == 'complete' || xhr.readyState == 4 ) {
                if( xhr.status == 200 ) {
                	var data = /^json$/i.test(args.mode) ? JSON.parse(xhr.responseText) : ( /^xml$/i.test(args.mode) ? xhr.responseXML : xhr.responseText );
                    on.done.forEach(function(action){ action.apply(xhr,[data]) });
                } else {
                    var data = /^json$/i.test(args.mode) ? JSON.parse(xhr.responseText) : ( /^xml$/i.test(args.mode) ? xhr.responseXML : xhr.responseText );
                    on.fail.forEach(function(action){ action.apply(xhr,[data]) });
                }
                on.always.forEach(function(action){ action.apply(xhr,[xhr]) });
            }
        }
        
        xhr.done = function(action){ if( isFunction(action) ) on.done.push(action); return xhr; };
        xhr.fail = function(action){ if( isFunction(action) ) on.fail.push(action); return xhr; };
        xhr.always = function(action){ if( isFunction(action) ) on.always.push(action); return xhr; };
        
        
        xhr.setRequestHeader('Content-Type',args.contentType);
        xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
        
        if( isObject(args.headers) ) {
            Object.keys(args.headers).forEach(function(header){
                xhr.setRequestHeader(header,args.headers[header]);
            });
        }
        
        xhr.send(args.data);
        
        return xhr;
    }
    
    window.$ajax = function(){ return ajax.apply(this,arguments); };
    
    window.$ajax.getJSON = function(url,args){ args = args || {}; args.mode = args.mode || 'json'; args.method = 'GET'; return ajax.apply(ajax,[url,args]); }
    window.$ajax.postJSON = function(url,args){ args = args || {}; args.mode = args.mode || 'json'; args.method = 'POST'; return ajax.apply(ajax,[url,args]); }
    window.$ajax.putJSON = function(url,args){ args = args || {}; args.mode = args.mode || 'json'; args.method = 'PUT'; return ajax.apply(ajax,[url,args]); }
    window.$ajax.deleteJSON = function(url,args){ args = args || {}; args.mode = args.mode || 'json'; args.method = 'DELETE'; return ajax.apply(ajax,[url,args]); }
    
})();

// ------------------------------------
// NATIVE PROTOTYPE FUNCIONS
// ------------------------------------

function stopEvent(e) {
    if(e) e.stopped = true;
    if (e &&e.preventDefault) e.preventDefault();
    else if (window.event && window.event.returnValue) window.eventReturnValue = false;
}

function triggerEvent(element,name,args,data){
  var event; // The custom event that will be created

  if (document.createEvent) {
    event = document.createEvent("HTMLEvents");
    event.data = data;
    event.initEvent(name, true, true);
  } else {
    event = document.createEventObject();
    event.data = data;
  }

  event.eventName = name;
  if( isObject(args) ) {
      Object.keys(args).forEach(function(key){ event[key] = args[key]; });
  }

  if(document.createEvent) {
    element.dispatchEvent(event);
  } else {
    element.fireEvent("on" + event.eventType, event);
  }
  
  return event;
}


Event = Event || window.Event;


function varType(obj){
    if( obj === undefined || obj === null ) return 'undefined';
    if( typeof(obj) == 'object' ) {
        if( obj.jquery ) return 'jquery';
        
        var match = (''+obj.constructor).match(/^\s*function\s*(.*)\(/);
        if( match ) return match[1].toLowerCase();
        
        match = (''+obj.constructor).match(/^\[object\s(.*)\]$/)
        if( match ) return match[1].toLowerCase();
        
        alert('unknown object '+obj.constructor);
    } else return typeof(obj);
}


function isObject(myVar,type){ if( typeof(myVar) == 'object' ) return ( type == 'any' ) ? true : ( varType(myVar) == (type || 'object') ); else return false; }
function isString(myVar){ return varType(myVar) == 'string'; }
function isFunction(myVar){ return myVar instanceof Function; }
function isArray(myVar){ return myVar instanceof Array; }
function isNumber(myVar){ return varType(myVar) == 'number'; }



if (!Array.prototype.clone) {
	Array.prototype.clone = function(){
		var dolly = [];
		Array.prototype.push.apply(dolly,this);
		//this.forEach(function(o){ if(isFunction( (o || {}).clone ) ) dolly.push(o.clone()); else dolly.push(o); });
		return dolly;
	};
}

/*
    sortArray.sort(function(a,b) {
        if ( a.region < b.region )
            return -1;
        if ( a.region > b.region )
            return 1;
        return 0;
    } );
*/

if (!Array.prototype.sortBy) {
	Array.prototype.sortBy = function(){
        if( arguments.length ) {
            var prefs = arguments;
            if( isArray(arguments[0]) ) prefs = arguments[0];
            this.sort(function(a,b){
                var level = 0;
                
                while( key = prefs[level++] ) {
                    if ( Object.key(a,key) < Object.key(b,key) )
                        return -1;
                    if ( Object.key(a,key) > Object.key(b,key) )
                        return 1;
                }
                if( a < b ) return -1;
                if( a > b ) return 1;
                return 0;
            });
        }
        return this;
	};
}

if (!Object.clone) {
	Object.clone = function(o){
		var dolly = {};
		if( o === undefined ) return o;
		if( isArray(o) ) return o.clone();
		if( o.cloneNode ) return o.cloneNode();
		for( var key in o ) dolly[key] = isFunction( (o[key] || {}).clone ) ? o[key].clone() : o[key];
		return dolly;
	};
}

if (!Object.key) {
	Object.key = function(o,full_key,value){
		var keys = full_key.split('.'), in_keys = o;
		if(value) {
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
            for(var k=0, len = keys.length;k<len;k++) {
               if(in_keys[keys[k]] === undefined) return false;
               in_keys = in_keys[keys[k]];
            }
            return in_keys;
		}
	};
}

// function String.replaceKeys(item)
// return: replaced '{key1} some text {key2.level2}' with item: { key1: 'value1', key2: { level2: 'value2' } }
if (!String.prototype.replaceKeys) {
 String.prototype.replaceKeys = function(keys,args) {
    var value, aux;
    if( !args ) args = {};
    if(!keys) return this;
    
    var str = this.replace(/\$\{\s*(.*)\s*\?\s*(.+)\s*\:\s*(.+)\s*\}/, function(match, condition, if_true, if_false) {
        var cond = Object.key(keys,condition);
        if( isFunction(cond) ) {
            if( cond.apply(keys) ) return '${'+if_true+'}';
            else return '${'+if_false+'}';
        } else {
            return '${'+(cond ? if_true : if_false)+'}';
        }
	});
    
    return str.replace(/\${\s*([\w\-\_\.\']+)\s*}/g, function(match, key) {
        aux = key.trim().match(/^\'(.*)\'$/);
        if( aux && aux[1] !== undefined ) {
            return aux[1];
        } else if(/\./.test(key)) {
            value = Object.key(keys,key);
            if( isFunction(value) ) return value.apply(keys);
            else return ( value === false ) ? (args.clean?'':match) : value;
       } else {
            value = keys[key];
            if( isFunction(value) ) return value.apply(keys);
            else return (value === undefined)?(args.clean?'':match):value;
       }
	});
 };
}

if (!String.prototype.clearKeys) {
 String.prototype.clearKeys = function() {
    return this.replace(/\${\s*([\w\-\_\.]+)\s*}/g, function(match, key) { return ''; });
 };
}

// function String.is('some text')
if (!String.prototype.is) { String.prototype.is = function(other) { return this == other; }; }

// function String.formatText(arg1,args2,...)
// return: replaced '%n' by arg[n] string
/*if (!String.prototype.formatText) {
 String.prototype.formatText = function() {
   var args = arguments;
   return this.replace(/{(\d+)}/g, function(match, number) { 
     return typeof args[number] != 'undefined' ? args[number] : match ;
   });
 };
}*/

// function String.serialized2JSON()
// return: { key1: 'value1', key2: 'value2' } from 'key1=value1&key2=value2'
if (!String.prototype.serialized2JSON) {
 String.prototype.serialized2JSON = function(decode_uri) {
    var aux, tokens = this.split('&');
    var item = {};
    tokens.forEach(function(token){
        aux = token.split('=');
        if(decode_uri) item[aux[0]] = decodeURIComponent(aux[1]);
        else item[aux[0]] = aux[1];
    });
    return item;
 };
}

if (!String.prototype.capitalize) {
    String.prototype.capitalize = function(each_word) {
        if(each_word) {
            var words = this.toLowerCase().split(' ');
            var result = false;
            words.forEach(function(word){
                if(result) result += ' '+word.capitalize();
                else result = word.capitalize();
            });
            return result;
        } else return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
    };
}

if (!String.prototype.toDate) {
    String.prototype.toDate = function(milisecs){
        var token = false;
        if( /^\d{1,2}\/\d{1,2}\/\d{1,4}$/.test(this) ) {
            token = this.split('/');
            var year = token[2], month = (token[1]-1), day = token[0];
        } else if( /^\d{1,2}\-\d{1,2}\-\d{1,4}$/.test(this) ) {
            token = this.split('-');
            var year = token[2], month = (token[0]-1), day = token[1];
        }
        if(token) {
            var d = new Date(year,month,day);
            if( d && d.getMonth() == Number(month) && d.getDate() == Number(day) ) return d;
        }
        return false;
    }
}


function compareDates(date1,date2){
    if( isString(date1) && isString(date2) ) {
        var date1 = date1.toDate();
        var date2 = date2.toDate();
        if( date1 && date2 ) {
            if( (date1 - date2) == 0 ) return 0;
            else if( date1 > date2 ) return 1;
            else if( date1 < date2 ) return -1;
        }
    }
    return false;
}

function listField(array,field) {
    var list = [];
    var key;
    
    array.forEach(function(item){
        if(item[field]) list.push(item[field]);
    });
    return list;
}

function serializeKeys(keys,encoded){
    var serialized = false;
    for( key in keys ) {
        
        if( keys[key].forEach ) {
            keys[key].forEach(function(value){
                if( serialized ) serialized += '&';
                else serialized = '';
                if(encoded) serialized += key+'='+encodeURIComponent(value); 
                else serialized += key+'='+value;
            });
        } else {
            if( serialized ) serialized += '&';
            else serialized = '';
            serialized += encoded ? ( key+'='+encodeURIComponent(keys[key]) ) : ( key+'='+keys[key] );
        }
    }
    return serialized;
}


var $cookies = new (function(){
    this.get = function(name){
        var nameEQ = name + "=";
    	var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
    };
    this.set = function(name,value,args){
        if( !args ) args = {};
        if( args.days == undefined ) args.days = 0;
        if( !isString(args.path) ) args.path = '/';
        if(args.days) {
    		var date = new Date();
			date.setTime(date.getTime()+(args.days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		} else var expires = "";
		document.cookie = name+"="+value+expires+"; path="+args.path;
    };
    this['delete'] = function(name){
        createCookie(name,"",-1);
    }; 
})();

// images cache
    
(function(){
    window.imgCache = function(images,callback) {
        var loaded = {};
        
        if( isArray(images) ) {
            images.forEach(function(image){
                console.log('caching: '+image);
                var imgCache = document.createElement('img');
                imgCache.src = image;
            });
        } else if( isString(images) ) {
            if( loaded[images] ) {
                if( isFunction(callback) ) callback.apply(false);
            } else {
                var imgCache = document.createElement('img');
                imgCache.src = images;
                imgCache.onload = callback;
            }
        }
    }
})();


// ------------------------------------------------------
//      Third party crypt functions
// ------------------------------------------------------

	//	About base64.js (window.base64)
	//	-	Copyright Vassilis Petroulias [DRDigit]
	//	-	Licensed under the Apache License, Version 2.0 (the "License");
	window.B64={alphabet:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",lookup:null,ie:/MSIE /.test(navigator.userAgent),ieo:/MSIE [67]/.test(navigator.userAgent),encode:function(e){var t=B64.toUtf8(e),n=-1,r=t.length,i,s,o,u=[,,,];if(B64.ie){var a=[];while(++n<r){i=t[n];s=t[++n];u[0]=i>>2;u[1]=(i&3)<<4|s>>4;if(isNaN(s))u[2]=u[3]=64;else{o=t[++n];u[2]=(s&15)<<2|o>>6;u[3]=isNaN(o)?64:o&63}a.push(B64.alphabet.charAt(u[0]),B64.alphabet.charAt(u[1]),B64.alphabet.charAt(u[2]),B64.alphabet.charAt(u[3]))}return a.join("")}else{var a="";while(++n<r){i=t[n];s=t[++n];u[0]=i>>2;u[1]=(i&3)<<4|s>>4;if(isNaN(s))u[2]=u[3]=64;else{o=t[++n];u[2]=(s&15)<<2|o>>6;u[3]=isNaN(o)?64:o&63}a+=B64.alphabet[u[0]]+B64.alphabet[u[1]]+B64.alphabet[u[2]]+B64.alphabet[u[3]]}return a}},decode:function(e){if(e.length%4)throw new Error("InvalidCharacterError: 'B64.decode' failed: The string to be decoded is not correctly encoded.");var t=B64.fromUtf8(e),n=0,r=t.length;if(B64.ieo){var i=[];while(n<r){if(t[n]<128)i.push(String.fromCharCode(t[n++]));else if(t[n]>191&&t[n]<224)i.push(String.fromCharCode((t[n++]&31)<<6|t[n++]&63));else i.push(String.fromCharCode((t[n++]&15)<<12|(t[n++]&63)<<6|t[n++]&63))}return i.join("")}else{var i="";while(n<r){if(t[n]<128)i+=String.fromCharCode(t[n++]);else if(t[n]>191&&t[n]<224)i+=String.fromCharCode((t[n++]&31)<<6|t[n++]&63);else i+=String.fromCharCode((t[n++]&15)<<12|(t[n++]&63)<<6|t[n++]&63)}return i}},toUtf8:function(e){var t=-1,n=e.length,r,i=[];if(/^[\x00-\x7f]*$/.test(e))while(++t<n)i.push(e.charCodeAt(t));else while(++t<n){r=e.charCodeAt(t);if(r<128)i.push(r);else if(r<2048)i.push(r>>6|192,r&63|128);else i.push(r>>12|224,r>>6&63|128,r&63|128)}return i},fromUtf8:function(e){var t=-1,n,r=[],i=[,,,];if(!B64.lookup){n=B64.alphabet.length;B64.lookup={};while(++t<n)B64.lookup[B64.alphabet.charAt(t)]=t;t=-1}n=e.length;while(++t<n){i[0]=B64.lookup[e.charAt(t)];i[1]=B64.lookup[e.charAt(++t)];r.push(i[0]<<2|i[1]>>4);i[2]=B64.lookup[e.charAt(++t)];if(i[2]==64)break;r.push((i[1]&15)<<4|i[2]>>2);i[3]=B64.lookup[e.charAt(++t)];if(i[3]==64)break;r.push((i[2]&3)<<6|i[3])}return r}};
	
	//	About base32.js (window.B32)
	//  -   Copyright (C) 2011 by Isaac Wolkerstorfer
	(function(){function r(){var t=0;var n=0;this.output="";this.readByte=function(r){if(typeof r=="string")r=r.charCodeAt(0);if(t<0){n|=r>>-t}else{n=r<<t&248}if(t>3){t-=8;return 1}if(t<4){this.output+=e[n>>3];t+=5}return 0};this.finish=function(r){var i=this.output+(t<0?e[n>>3]:"")+(r?"$":"");this.output="";return i}}function i(){var t=0;var r=0;this.output="";this.readChar=function(e){if(typeof e!="string"){if(typeof e=="number"){e=String.fromCharCode(e)}}e=e.toLowerCase();var i=n()[e];if(typeof i=="undefined"){return}i<<=3;r|=i>>>t;t+=5;if(t>=8){this.output+=String.fromCharCode(r);t-=8;if(t>0)r=i<<5-t&255;else r=0}};this.finish=function(n){var r=this.output+(t<0?e[bits>>3]:"")+(n?"$":"");this.output="";return r}}function s(e){var t=new r;var n=t.update(e,true);return n}function o(e){var t=new i;var n=t.update(e,true);return n}function f(e,t){if(typeof u=="undefined")u=require("crypto");var n=u.createHash("sha1");n.digest=function(e){return function(){return s(e.call(this,"binary"))}}(n.digest);if(t){if(typeof e=="string"||Buffer.isBuffer(e)){try{return t(null,f(e))}catch(r){return t(r,null)}}if(!typeof e.on=="function")return t({message:"Not a stream!"});e.on("data",function(e){n.update(e)});e.on("end",function(){t(null,n.digest())});return}if(e){return n.update(e).digest()}return n}var e="0123456789abcdefghjkmnpqrtuvwxyz";var t={o:0,i:1,l:1,s:5};var n=function(){var r={};for(var i=0;i<e.length;i++){r[e[i]]=i}for(var s in t){if(!t.hasOwnProperty(s))continue;r[s]=r[""+t[s]]}n=function(){return r};return r};r.prototype.update=function(e,t){for(var n=0;n<e.length;){n+=this.readByte(e[n])}var r=this.output;this.output="";if(t){r+=this.finish()}return r};i.prototype.update=function(e,t){for(var n=0;n<e.length;n++){this.readChar(e[n])}var r=this.output;this.output="";if(t){r+=this.finish()}return r};var u,a;f.file=function(e,t){if(e=="-"){process.stdin.resume();return f(process.stdin,t)}if(typeof a=="undefined")a=require("fs");return a.stat(e,function(n,r){if(n)return t(n,null);if(r.isDirectory())return t({dir:true,message:"Is a directory"});return f(require("fs").createReadStream(e),t)})};var l={Decoder:i,Encoder:r,encode:s,decode:o,sha1:f};if(typeof window!=="undefined"){window.B32=l}if(typeof module!=="undefined"&&module.exports){module.exports=l}})();

	//	About CryptoJS.SHA512()
	//	-	Copyright (c) 2009-2013 Jeff Mott
	//	-	The license used is the MIT license.
	var CryptoJS=CryptoJS||function(a,m){var r={},f=r.lib={},g=function(){},l=f.Base={extend:function(a){g.prototype=this;var b=new g;a&&b.mixIn(a);b.hasOwnProperty("init")||(b.init=function(){b.$super.init.apply(this,arguments)});b.init.prototype=b;b.$super=this;return b},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var b in a)a.hasOwnProperty(b)&&(this[b]=a[b]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},p=f.WordArray=l.extend({init:function(a,b){a=this.words=a||[];this.sigBytes=b!=m?b:4*a.length},toString:function(a){return(a||q).stringify(this)},concat:function(a){var b=this.words,d=a.words,c=this.sigBytes;a=a.sigBytes;this.clamp();if(c%4)for(var j=0;j<a;j++)b[c+j>>>2]|=(d[j>>>2]>>>24-8*(j%4)&255)<<24-8*((c+j)%4);else if(65535<d.length)for(j=0;j<a;j+=4)b[c+j>>>2]=d[j>>>2];else b.push.apply(b,d);this.sigBytes+=a;return this},clamp:function(){var n=this.words,b=this.sigBytes;n[b>>>2]&=4294967295<<32-8*(b%4);n.length=a.ceil(b/4)},clone:function(){var a=l.clone.call(this);a.words=this.words.slice(0);return a},random:function(n){for(var b=[],d=0;d<n;d+=4)b.push(4294967296*a.random()|0);return new p.init(b,n)}}),y=r.enc={},q=y.Hex={stringify:function(a){var b=a.words;a=a.sigBytes;for(var d=[],c=0;c<a;c++){var j=b[c>>>2]>>>24-8*(c%4)&255;d.push((j>>>4).toString(16));d.push((j&15).toString(16))}return d.join("")},parse:function(a){for(var b=a.length,d=[],c=0;c<b;c+=2)d[c>>>3]|=parseInt(a.substr(c,2),16)<<24-4*(c%8);return new p.init(d,b/2)}},G=y.Latin1={stringify:function(a){var b=a.words;a=a.sigBytes;for(var d=[],c=0;c<a;c++)d.push(String.fromCharCode(b[c>>>2]>>>24-8*(c%4)&255));return d.join("")},parse:function(a){for(var b=a.length,d=[],c=0;c<b;c++)d[c>>>2]|=(a.charCodeAt(c)&255)<<24-8*(c%4);return new p.init(d,b)}},fa=y.Utf8={stringify:function(a){try{return decodeURIComponent(escape(G.stringify(a)))}catch(b){throw Error("Malformed UTF-8 data");}},parse:function(a){return G.parse(unescape(encodeURIComponent(a)))}},h=f.BufferedBlockAlgorithm=l.extend({reset:function(){this._data=new p.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=fa.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(n){var b=this._data,d=b.words,c=b.sigBytes,j=this.blockSize,l=c/(4*j),l=n?a.ceil(l):a.max((l|0)-this._minBufferSize,0);n=l*j;c=a.min(4*n,c);if(n){for(var h=0;h<n;h+=j)this._doProcessBlock(d,h);h=d.splice(0,n);b.sigBytes-=c}return new p.init(h,c)},clone:function(){var a=l.clone.call(this);a._data=this._data.clone();return a},_minBufferSize:0});f.Hasher=h.extend({cfg:l.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){h.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,d){return(new a.init(d)).finalize(b)}},_createHmacHelper:function(a){return function(b,d){return(new ga.HMAC.init(a,d)).finalize(b)}}});var ga=r.algo={};return r}(Math);(function(a){var m=CryptoJS,r=m.lib,f=r.Base,g=r.WordArray,m=m.x64={};m.Word=f.extend({init:function(a,p){this.high=a;this.low=p}});m.WordArray=f.extend({init:function(l,p){l=this.words=l||[];this.sigBytes=p!=a?p:8*l.length},toX32:function(){for(var a=this.words,p=a.length,f=[],q=0;q<p;q++){var G=a[q];f.push(G.high);f.push(G.low)}return g.create(f,this.sigBytes)},clone:function(){for(var a=f.clone.call(this),p=a.words=this.words.slice(0),g=p.length,q=0;q<g;q++)p[q]=p[q].clone();return a}})})();(function(){function a(){return g.create.apply(g,arguments)}for(var m=CryptoJS,r=m.lib.Hasher,f=m.x64,g=f.Word,l=f.WordArray,f=m.algo,p=[a(1116352408,3609767458),a(1899447441,602891725),a(3049323471,3964484399),a(3921009573,2173295548),a(961987163,4081628472),a(1508970993,3053834265),a(2453635748,2937671579),a(2870763221,3664609560),a(3624381080,2734883394),a(310598401,1164996542),a(607225278,1323610764),a(1426881987,3590304994),a(1925078388,4068182383),a(2162078206,991336113),a(2614888103,633803317),a(3248222580,3479774868),a(3835390401,2666613458),a(4022224774,944711139),a(264347078,2341262773),a(604807628,2007800933),a(770255983,1495990901),a(1249150122,1856431235),a(1555081692,3175218132),a(1996064986,2198950837),a(2554220882,3999719339),a(2821834349,766784016),a(2952996808,2566594879),a(3210313671,3203337956),a(3336571891,1034457026),a(3584528711,2466948901),a(113926993,3758326383),a(338241895,168717936),a(666307205,1188179964),a(773529912,1546045734),a(1294757372,1522805485),a(1396182291,2643833823),a(1695183700,2343527390),a(1986661051,1014477480),a(2177026350,1206759142),a(2456956037,344077627),a(2730485921,1290863460),a(2820302411,3158454273),a(3259730800,3505952657),a(3345764771,106217008),a(3516065817,3606008344),a(3600352804,1432725776),a(4094571909,1467031594),a(275423344,851169720),a(430227734,3100823752),a(506948616,1363258195),a(659060556,3750685593),a(883997877,3785050280),a(958139571,3318307427),a(1322822218,3812723403),a(1537002063,2003034995),a(1747873779,3602036899),a(1955562222,1575990012),a(2024104815,1125592928),a(2227730452,2716904306),a(2361852424,442776044),a(2428436474,593698344),a(2756734187,3733110249),a(3204031479,2999351573),a(3329325298,3815920427),a(3391569614,3928383900),a(3515267271,566280711),a(3940187606,3454069534),a(4118630271,4000239992),a(116418474,1914138554),a(174292421,2731055270),a(289380356,3203993006),a(460393269,320620315),a(685471733,587496836),a(852142971,1086792851),a(1017036298,365543100),a(1126000580,2618297676),a(1288033470,3409855158),a(1501505948,4234509866),a(1607167915,987167468),a(1816402316,1246189591)],y=[],q=0;80>q;q++)y[q]=a();f=f.SHA512=r.extend({_doReset:function(){this._hash=new l.init([new g.init(1779033703,4089235720),new g.init(3144134277,2227873595),new g.init(1013904242,4271175723),new g.init(2773480762,1595750129),new g.init(1359893119,2917565137),new g.init(2600822924,725511199),new g.init(528734635,4215389547),new g.init(1541459225,327033209)])},_doProcessBlock:function(a,f){for(var h=this._hash.words,g=h[0],n=h[1],b=h[2],d=h[3],c=h[4],j=h[5],l=h[6],h=h[7],q=g.high,m=g.low,r=n.high,N=n.low,Z=b.high,O=b.low,$=d.high,P=d.low,aa=c.high,Q=c.low,ba=j.high,R=j.low,ca=l.high,S=l.low,da=h.high,T=h.low,v=q,s=m,H=r,E=N,I=Z,F=O,W=$,J=P,w=aa,t=Q,U=ba,K=R,V=ca,L=S,X=da,M=T,x=0;80>x;x++){var B=y[x];if(16>x)var u=B.high=a[f+2*x]|0,e=B.low=a[f+2*x+1]|0;else{var u=y[x-15],e=u.high,z=u.low,u=(e>>>1|z<<31)^(e>>>8|z<<24)^e>>>7,z=(z>>>1|e<<31)^(z>>>8|e<<24)^(z>>>7|e<<25),D=y[x-2],e=D.high,k=D.low,D=(e>>>19|k<<13)^(e<<3|k>>>29)^e>>>6,k=(k>>>19|e<<13)^(k<<3|e>>>29)^(k>>>6|e<<26),e=y[x-7],Y=e.high,C=y[x-16],A=C.high,C=C.low,e=z+e.low,u=u+Y+(e>>>0<z>>>0?1:0),e=e+k,u=u+D+(e>>>0<k>>>0?1:0),e=e+C,u=u+A+(e>>>0<C>>>0?1:0);B.high=u;B.low=e}var Y=w&U^~w&V,C=t&K^~t&L,B=v&H^v&I^H&I,ha=s&E^s&F^E&F,z=(v>>>28|s<<4)^(v<<30|s>>>2)^(v<<25|s>>>7),D=(s>>>28|v<<4)^(s<<30|v>>>2)^(s<<25|v>>>7),k=p[x],ia=k.high,ea=k.low,k=M+((t>>>14|w<<18)^(t>>>18|w<<14)^(t<<23|w>>>9)),A=X+((w>>>14|t<<18)^(w>>>18|t<<14)^(w<<23|t>>>9))+(k>>>0<M>>>0?1:0),k=k+C,A=A+Y+(k>>>0<C>>>0?1:0),k=k+ea,A=A+ia+(k>>>0<ea>>>0?1:0),k=k+e,A=A+u+(k>>>0<e>>>0?1:0),e=D+ha,B=z+B+(e>>>0<D>>>0?1:0),X=V,M=L,V=U,L=K,U=w,K=t,t=J+k|0,w=W+A+(t>>>0<J>>>0?1:0)|0,W=I,J=F,I=H,F=E,H=v,E=s,s=k+e|0,v=A+B+(s>>>0<k>>>0?1:0)|0}m=g.low=m+s;g.high=q+v+(m>>>0<s>>>0?1:0);N=n.low=N+E;n.high=r+H+(N>>>0<E>>>0?1:0);O=b.low=O+F;b.high=Z+I+(O>>>0<F>>>0?1:0);P=d.low=P+J;d.high=$+W+(P>>>0<J>>>0?1:0);Q=c.low=Q+t;c.high=aa+w+(Q>>>0<t>>>0?1:0);R=j.low=R+K;j.high=ba+U+(R>>>0<K>>>0?1:0);S=l.low=S+L;l.high=ca+V+(S>>>0<L>>>0?1:0);T=h.low=T+M;h.high=da+X+(T>>>0<M>>>0?1:0)},_doFinalize:function(){var a=this._data,f=a.words,h=8*this._nDataBytes,g=8*a.sigBytes;f[g>>>5]|=128<<24-g%32;f[(g+128>>>10<<5)+30]=Math.floor(h/4294967296);f[(g+128>>>10<<5)+31]=h;a.sigBytes=4*f.length;this._process();return this._hash.toX32()},clone:function(){var a=r.clone.call(this);a._hash=this._hash.clone();return a},blockSize:32});m.SHA512=r._createHelper(f);m.HmacSHA512=r._createHmacHelper(f)})();


// ------------------------------------------------------
//      $.fn.Tools
// ------------------------------------------------------

(function( $ ){
    
    if( !$.fn.contains ) {
        $.fn.contains = function(jElem){
            if( isObject(jElem,'jquery') ) {
                var jRoot = $(this);
                if( $(document).is(jRoot) ) jRoot = $(document.body);
                if(jElem.length == 1) {
                    var contained = false;
                    while( jElem.parent().length ) {
                        if( jElem.is(jRoot) ) return true;
                        jElem = jElem.parent();
                    }
                } else if( jElem.length > 1 ) {
                    var contained = true;
                    jElem.each(function(){ if( !jRoot.contains($(this)) ) contained = false; });
                    return contained;
                }
            }
            return false;
        }
    }
    
    /* MODEL HANDLERS */
    
    $.event.props.push('dataTransfer');
    
    $.fn.getKeys = function(filter) {
        var jThis = $(this);
        switch(jThis.prop('nodeName').toLowerCase()) {
            case 'table': jThis = jThis.find('>tbody>tr'); break;
        }
        if(filter) jThis = jThis.filter(filter);
        var num_items = jThis.length;
        //console.log('num_items: '+num_items);
        
        if( num_items == 0 ) {
            return [];
        } else if( num_items == 1 ) {
            var item = false;
            if( jThis.data('keys') && jThis.data('values') ) {
                var keys = (''+jThis.data('keys')).split(',');
                var values = (''+jThis.data('values')).split(',');
                if(keys.length && keys.length == values.length) {
                    item = {};
                    for( var i = 0; i < keys.length ; i++ ) {
                        item[keys[i]] = values[i];
                    }
                }
            }
            if(!item){
                item = {};
                switch(jThis.prop('nodeName').toLowerCase()) {
                    case 'form':
                        jThis.find('[name]').each(function(){
                            var jInput = $(this);
                            if( /^select|input|textarea$/i.test(jInput.prop('nodeName')) ){
                                var name = jInput.attr('name');
                                if(!jInput.is(':disabled')) {
                                    Object.key(item,name,jInput.val());
                                    /*if( item[name] != undefined ) {
                                        if( item[name].push ) item[name].push(jInput.val() || '');
                                        else item[name] = [item[name],jInput.val() || ''];
                                    } else item[name] = jInput.val() || '';*/
                                }
                            }
                        });
                        break;
                    default:
                        jThis.find('[data-key]').each(function(){
                            var jThis = $(this);
                            item[jThis.data('key')] = jThis.data('value') || this.textContent;
                        });
                        break;
                }
                
            }
            return item;
        } else if( num_items > 1 ) {
            var items = [];
            jThis.each(function(){ items.push($(this).getKeys()); });
            return items;
        } else return false;
   };
   
})( jQuery );



// ------------------------------------------------------
//      aniEngine
// ------------------------------------------------------

(function( $ ){

    $.fn.aniShow = function(aniClass,callback){
        var jThis = $(this), args = {}, timeout;
        
        if( !jThis.hasClass('animated') ) jThis.addClass('animated');
        
        var className = jThis.attr('class');
        if( /t\-(\d+)s/.test(className) ) {
            var values = className.match(/t\-(\d+)s/);
            timeout = parseInt(values[1])*1000;
        } else if( /t\-(\d+)\_(\d)s/.test(className) ) {
            var values = className.match(/t\-(\d+)\_(\d)s/);
            timeout = parseInt(values[1])*1000+parseInt(values[2])*100;
        } else if( /t\-(\d+)\_(\d\d)s/.test(className) ) {
            var values = className.match(/t\-(\d+)\_(\d\d)s/);
            timeout = parseInt(values[1])*1000+parseInt(values[2])*10;
        } else timeout = 500;
        
        if( isFunction(aniClass) ) callback = aniClass;
        if( !isString(aniClass) ) {
            callback = aniClass;
            aniClass = jThis.attr('data-ani-show') || 'fadeIn';
        }
        
        jThis.removeClass('hide').addClass(aniClass);
        try{ setTimeout(function(){ jThis.removeClass(aniClass); if( isFunction(callback) ) callback.apply(jThis.get(0)); },timeout); } catch(err) { jThis.removeClass(aniClass); if( isFunction(callback) ) callback.apply(jThis.get(0)); }
        
        return this;
    }
    
    $.fn.aniHide = function(aniClass,callback){
        var jThis = $(this), timeout;
        
        if( !jThis.hasClass('animated') ) jThis.addClass('animated');
        
        var className = jThis.attr('class');
        if( /t\-(\d+)s/.test(className) ) {
            var values = className.match(/t\-(\d+)s/);
            timeout = parseInt(values[1])*1000;
        } else if( /t\-(\d+)\_(\d)s/.test(className) ) {
            var values = className.match(/t\-(\d+)\_(\d)s/);
            timeout = parseInt(values[1])*1000+parseInt(values[2])*100;
        } else if( /t\-(\d+)\_(\d\d)s/.test(className) ) {
            var values = className.match(/t\-(\d+)\_(\d\d)s/);
            timeout = parseInt(values[1])*1000+parseInt(values[2])*10;
        } else timeout = 500;
        
        if( isFunction(aniClass) ) callback = aniClass;
        if( !isString(aniClass) ) {
            callback = aniClass;
            aniClass = jThis.attr('data-ani-hide') || 'fadeOut';
        }
        
        jThis.addClass(aniClass);
        try{ setTimeout(function(){ jThis.addClass('hide').removeClass(aniClass); if( isFunction(callback) ) callback.apply(jThis.get(0)); },timeout); } catch(err) { jThis.addClass('hide').removeClass(aniClass); if( isFunction(callback) ) callback.apply(jThis.get(0)); }
        
        return this;
    }
    
    $.fn.aniShake = function(){
        var jThis = $(this);
        jThis.addClass('animated t-0_5s shake'); setTimeout(function(){ jThis.removeClass('shake'); },500);
        
        return this;
    }
    
})( jQuery );


// ------------------------------------------------------
//      i18n
// ------------------------------------------------------

(function( $ ){
    var _i18n = {};
    
    function get_i18n(env,callback){
        var params = '';
        if( isString(env) ) params = '?env='+env;
        else env = 'default';
        
        if( _i18n[env] ) return _i18n[env];
        
        $.ajax({
            type: "GET",
            url: '/-/model/i18n.json'+params,
            dataType: 'text',
            global: false, async: isFunction(callback),
            success: function(data){
                _i18n[env] = JSON.parse(data);
                if( isFunction(callback) ) callback.apply(window.$i18n,[i18n[env]]);
            }
        });
        if( isFunction(callback) ) return true;
        else return _i18n[env] || {};
    }
    
    window.$i18n = function(){
        var env = false, callback = false;
        
        if( arguments.length ) {
            
            if( isString(arguments[0]) ) {
                env = arguments[0];
                if( isFunction(arguments[1]) ) callback = arguments[1];
            } else if( isFunction(arguments[0]) ) callback = arguments[0];
            
            return get_i18n(env,callback);
            
        } else return get_i18n(env);
    };
    
    window.$i18n.get = get_i18n;
    
    if( !String.i18n ) {
        String.prototype.i18n = function() {
            var str = this;
            return this.replace(/\$i18n{\s*([\:\w\-\_\.]+)\s*}/g, function(match, text) {
                var cmd = text.split(':'), env = false, key, i18n;
                if( cmd[1] ) { env = cmd[0]; key = cmd[1] } else { key = cmd[0]; }
                
                i18n = get_i18n(env);
                
                return i18n[key] || match;
            });
        }
    }
    window.i18n = function(text){ if( isString(text) ) return /^[\:\w\-\_\.]+$/.test(text) ? ('$i18n{'+text+'}').i18n() : text.i18n(); else return text; };
    
})( jQuery );

// ------------------------------------------------------
//      $dom.prototype
// ------------------------------------------------------

if( !Element.prototype.matchesSelector ) {
    Element.prototype.matchesSelector = Element.prototype.webkitMatchesSelector ||
                                        Element.prototype.mozMatchesSelector ||
                                        Element.prototype.msMatchesSelector ||
                                        Element.prototype.oMatchesSelector;
}

/*if( !Element.prototype.nextElementSibling ) {
	// fix for lte IE9
}

if( !Element.prototype.firstElementChild ) {
	// fix for lte IE9
}*/

if( !Element.prototype.val ) {
    Element.prototype.val = function(new_value) {
        if(this.value === undefined) return false;
        
        if(new_value !== undefined) {
            this.value = new_value;
            return this;
        } else return this.value;
    }
}

if( !HTMLSelectElement.prototype.val ) {
    HTMLSelectElement.prototype.val = function(new_value) {
        if(new_value !== undefined) {
            this.find('[value='+new_value+']').attr('selected','selected');
            return this;
        } else {
            return this.find('[selected=selected]').attr('value');
        }
    }
}

if( !HTMLFormElement.prototype.getKeys ) {
    HTMLFormElement.prototype.getKeys = function(){
        var item = {};
        this.find('[name]').each(function(input){
            if( /^select|input|textarea$/i.test(input.nodeName) ){
                var name = input.attr('name');
                if(!input.attr('disabled')) {
                    Object.key(item,name,input.val());
                    /*if( item[name] != undefined ) {
                        if( item[name].push ) item[name].push(input.val() || '');
                        else item[name] = [item[name],input.val() || ''];
                    } else item[name] = input.val() || '';*/
                }
            }
        });
        return item;
    }
}



if( !Element.prototype.find )
(function(){
    
    function listDOM(elems){
        var list = this;
        
        
        if( isString(elems) ) {
        	if( /\s/.test(elems) ) [].push.apply(this,document.querySelectorAll(elems));
        	else {
        		if( /^[a-zA-Z]+$/.test(elems) ) [].push.apply(this,document.getElementsByTagName(elems));
        		else if( /^\#.+/.test(elems) ) [].push.call(this,document.getElementById(elems.substr(1)));
        		else if( /^\..+/.test(elems) ) [].push.apply(this,document.getElementsByClassName(elems.substr(1)));
        		else [].push.apply(this,document.querySelectorAll(elems));
        	}
        }
        else if( elems instanceof Array ) [].push.apply(this,elems);
        else if( elems instanceof NodeList ) [].push.apply(this,elems);
        else if( elems instanceof HTMLCollection ) [].push.apply(this,elems);
        else if( elems instanceof Element ) [].push.call(this,elems);
        else if( elems === document ) [].push.call(this,elems);
    }
    
    listDOM.prototype = new Array();
    
    listDOM.fn = function(name,elementDo,collectionDo) {
        if( isString(name) ) {
            if( isFunction(elementDo) ) {
                if( !Element.prototype[name] ) Element.prototype[name] = elementDo;
            }
            if( isFunction(collectionDo) ) {
	            listDOM.prototype[name] = collectionDo;
	            NodeList.prototype[name] = collectionDo;
            }
        } else if( isObject(name) && arguments.length == 1 ) {
            Object.keys(name).forEach(function(key){
                listDOM.fn(key,name[key].element,name[key].collection);
            });
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
                if( isFunction(each) ) each.class(this,this);
                return this;
            },
            collection: function(each){
                if( isFunction(each) ) {
                    Array.prototype.forEach.call(this,each);
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
                
                if( isFunction(selector) ) {
                    Array.prototype.forEach.call(this,function(elem){
                        if( selector.apply(elem,[elem]) ) elems.push(elem);
                    });
                    
                    return new listDOM(elems);
                    
                } else if( isString(selector) ) {
                    Array.prototype.forEach.call(this,function(elem){
                        if( Element.prototype.matchesSelector.call(elem,selector) ) elems.push(elem);
                    });
                    
                    return new listDOM(elems);
                }
                return this;
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
            element: function(key,value){
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
            collection: function(key,value){
                var elem;
                
                if( isString(key) ) {
                
                    if( !isString(value) ) return this[0].data(key);
                    else {
                        Array.prototype.forEach.call(this,function(elem){ elem.data(key,value); });
                        return this;
                    }
                }
                return this;
            }
       },
       'attr': {
            element: function(key,value){
                if( isString(key) ) {
                    if( value !== undefined ) {
                        this.setAttribute(key,value);
                        return this;
                    } else return this.getAttribute(key);
                }
                return this;
            },
            collection: function(key,value){
                var elem;
                
                if( isString(key) ) {
                
                    if( !isString(value) ) return this[0].getAttribute(key);
                    else {
                        Array.prototype.forEach.call(this,function(elem){ elem.setAttribute(key,value); });
                        return this;
                    }
                }
                return this;
            }
       },
       'addClass': {
           element: function(className){
                if(!this.className) this.className = '';
                var patt = new RegExp('\\b'+className+'\\b','');
                if(!patt.test(this.className)) this.className += ' '+className;
                return this;
           },
           collection: function(className){ Array.prototype.forEach.call(this,function(item){ item.addClass(className); }); return this; }
       },
       'removeClass': {
           element: function(className){
                if(this.className) {
                    var patt = new RegExp('(\\b|\\s+)'+className+'\\b','g');
                    this.className = this.className.replace(patt,'');
                }
                return this;
           },
           collection: function(className){ Array.prototype.forEach.call(this,function(item){ item.addClass(className); }); return this; }
       },
       'hasClass': {
            element: function(className){
                if(!this.className) return false;
                patt = new RegExp('\\b'+className+'\\b','');
                return patt.test(this.className);
            },
            collection: function(className){
                var classNames = className.trim().split(' ');
                className = '';
                classNames.forEach(function(className_part){ className += '.'+className_part; });
                
                var found = this.filter(className);
                return found.length ? found : false;
            }
       },
       'parent': {
           element: function(){
                if( this == document.body ) return false;
                return this.parentElement || this.parentNode;
           },
           collection: function(){
               var items = new listDOM(), parent;
               
               Array.prototype.forEach.call(this,function(item){ parent = item.parent(); if(parent) items.push(parent); });
               
               return items;
           }
       },
       'render': {
           element: function(html){
                this.innerHTML = html;
                
                return this;
           },
           collection: function(html){
               Array.prototype.forEach.call(this,function(item){ item.render(html); });
               return this;
           }
        },
        'on':{
            element: function(event,handler){
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
            collection: function(event,handler){
                Array.prototype.forEach.call(this,function(elem){
                    elem.on(event,handler);
                });
                
                return this;
            }
        },
        'off': {
            element: function(event){ this.on(event,false); },
            collection: function(event){ this.on(event,false); }
        },
        'trigger': {
            element: function(event,data){
                triggerEvent(this,event,false,data);
            },
            collection: function(event,data){
                Array.prototype.forEach.call(this,function(elem){
                    triggerEvent(elem,event,false,data);
                });
            }
        }
    });
    
    window.$dom = function(selector){ return new listDOM(selector); };
    
    document.find = function(selector){ return $dom(selector); };
    
})();


// ------------------------------------------------------
//      $html
// ------------------------------------------------------

(function( $ ){
    
    var htmlHandler = function(selector){ return Element.prototype.find(selector); };
    
    (function(){
        var templates = {};
        
        //this.find = function(selector){ return Element.prototype.find(selector); };
        
        this.replaceKeys = function(text,keys,args) {
            //console.log('$html.replaceKeys('+isObject(htmlHandler.globalKeys)+') '+JSON.stringify(htmlHandler.globalKeys));
            if( !isString(text) ) return text;
            if( isObject(keys) ) text = text.replaceKeys(keys,args);
            if( isArray(keys) ) {
                keys.forEach(function(k){ if( isObject(k) ) { text = text.replaceKeys(k,args); } });
            }
            
            return text;
        };
        
        this.template = function(name,args){
            
            if( isString(args) ) {
                templates[name] = args;
                if( isFunction(args.done) ) args.done.apply(null,[ '' ]);
                return templates[name];
            } else {
                if( isFunction(args) ) args = { done: args, async: true };
                else if( !isObject(args) ) args = {};
                
                if( templates[name] ) {
                    var tmpl = $html.replaceKeys(templates[name],args.replaceKeys,{ clean: args.clearKeys }).i18n();
                    
                    if( isFunction(args.done) ) args.done.apply(null,[tmpl]);
                    return tmpl;
                } else {
                    $.ajax({
                        type: "GET",
                        url: '/templates/'+name+'.html',
                        dataType: 'text',
                        global: false, async: !!args.async,
                        success: function(tmpl){
                            
                            /*tmpl = tmpl.replace(/<template /g,'<script type="text/x-template" ').replace(/<\/template>/g,'</script>');
                            
                            var jTmpl = $('<div>'+tmpl+'</div>');
                            jTmpl.extractTemplates();
                            templates[name] = jTmpl.html();*/
                            
                            s_tmpl = tmpl.split(/<\/template>/);
                            tmpl = '';
                            s_tmpl.forEach(function(track){
                            	if( /<template\s+name="([\w\-\_\/]+)">/.test(track) ) {
                            		
                            		tmpl += track.replace(/([\w\W]*)<template\s+name="([\w\-\_\/]+)">([\w\W]*)/,function(match,track,name,tmpl){
                            			templates[name] = tmpl;
                            			return track;
                            		});
                            		
                            	} else tmpl += track;
                            });
                            
                            templates[name] = tmpl;
                            
                            if( isFunction(args.done) ) args.done.apply(null,[ $html.replaceKeys(templates[name],args.replaceKeys,{ clean: args.clearKeys }).i18n() ]);
                        }
                    }).fail(function(jqXHR, textStatus, errorThrown){
                        if( isFunction(args.done) ) args.done.apply(null,[ '<div class="error">['+jqXHR.status+'] '+textStatus+'</div>' ]);
                    });
                    if( !args.async ) {
                        if( templates[name] ) return $html.replaceKeys(templates[name],args.replaceKeys,{ clean: args.clearKeys }).i18n();
                        else return '<div class="error">404</div>';
                    }
                }
            }
            return '';
        };
        
        this.jTemplate = function(name,args){
            return $( htmlHandler.template(name,args) );
        };
        
        this.templateLoaded = function(name) {
            if( isString(name) ) return templates[name] ? true : false;
            return false;
        };
        
        var render_plugins = {};
        this.renderPlugin = function(selector,run) {
            if( isString(selector) && isFunction(run) ) {
                render_plugins[selector] = run;
            }
        };
        
        this.render_runPlugins = function(jRender,args){
            Object.keys(render_plugins).forEach(function(selector){
                jRender.find(selector).each(function(){
                    render_plugins[selector].apply(this,[args]);
                });
            });
        };
        
        var plugins = {};
        this.plugin = function(selector,run) {
            if( isString(selector) && isFunction(run) ) {
                plugins[selector] = run;
                if( $html.plugins_running ) {
                    $(document.body).find(selector).each(function(){ run.apply(this,[]); });
                }
            }
        };
        
        this.runPlugins = function(jRender,args){
            Object.keys(plugins).forEach(function(selector){
                jRender.find(selector).each(function(){
                    plugins[selector].apply(this,[args]);
                });
            });
        };
        
    }).apply(htmlHandler);
    
    $.fn.extractTemplates = function(){
        $(this).find('script[type=\'text/x-template\'][name]').each(function(){
            var jThis = $(this);
            $html.template( jThis.attr('name'), jThis.text().trim() );
            jThis.remove();
        });
        $(this).find('template[name]').each(function(){
            var jThis = $(this);
            $html.template( jThis.attr('name'), jThis.html() );
            jThis.remove();
        });
    }
    
    $.fn.initDOM = function(args){
        var jRender = $(this);
        
        jRender.extractTemplates();
        
        jRender.find('template[name]').each(function(){
            var jTemplate = $( htmlHandler.template($(this).attr('name')) );
            if( jTemplate ) $(this).replaceWith( jTemplate );
        });
        
        jRender.find('form').on('submit',function(e){
            if( !this.checkValidity || this.checkValidity() ) {
                var jForm = $(this), handler_name;
                
                function initFormEvents(){
                    jForm.find('.submitting-disable').attr('disabled','disabled');
                    jForm.addClass('submitting');
                    
                    jForm.on('form.submit-end',function(e){
                        jForm.removeClass('submitting');
                        jForm.find('.submitting-disable').attr('disabled','disabled');
                    });
                    
                    jForm.trigger('form.submit',[e]);
                }
                
                if( handler_name = jForm.attr('data-action-submit') ) {
                    
                    stopEvent(e);
                    initFormEvents();
                    $doc.runAction('submit',handler_name,jForm);
                    
                } else if( jForm.data('ajax') ) {
                    stopEvent(e);
                    initFormEvents();
                }
                
            } else $(this).trigger('form.invalid');
        });
        
        jRender.find('[autofocus]:last').focus();
        
        // html plugins
        $html.render_runPlugins(jRender,args);
        $html.runPlugins(jRender,args);
    }
    
    $.fn.render = function(html,args){
        //console.log(':: checkpoint ::\n'+html);
        var jThis = $(this), jHTML;
        if( !args ) args = {};
        html = $html.replaceKeys(html,args.replaceKeys);
        //console.log('render.replaceKeys: '+JSON.stringify(args.replaceKeys));
        if( html != undefined ) {
            jThis.html(html);
            jThis.initDOM(args);
        	if( isFunction(args.done) ) args.done.apply(this);
        } //else jThis = $(document);
        
        return this;
    };
    
    $.fn.renderHref = function(href,args){
        if( isFunction(args) ) args = { done: args };
        else if( !args ) args = {};
        
        var target = this, jTarget = $(this);
        jTarget.addClass('loading');
        var version = (parseInt(jTarget.data('version')) || 0) + 1;
        jTarget.data('version',version);
        $.ajax(href,{ headers: { 'X-View': 'HTMLHttpRequest' } }).done(function(data){
            if( parseInt(jTarget.data('version')) == version ) {
                jTarget.render(data,args);
            }
        }).always(function(){
            jTarget.removeClass('loading');
        }).fail(function( jqXHR, textStatus, errorThrown ){
            if( parseInt(jTarget.data('version')) == version ) {
                jTarget.render('['+jqXHR.status+'] '+jqXHR.responseText,args);
            }
        });
        
        return this;
    }
    
    $.fn.renderTemplate = function(name,args){
        if( arguments.length ) {
            var target = this;
            //console.log('renderTemplate('+name+').done: '+( args ? args.done : false) );
            
            if( isFunction(args) ) {
                args = { done: args, async: true };
            } else if( !isObject(args) ) args = {};
            
            if( args.async || isFunction(args.done) ) {
                $html.template(name,{
                    replaceKeys: args.replaceKeys,
                    done: function(tmpl){
                        var done = args.done; args.done = false;
                        if( args.model && Mustache != undefined ) {
                            tmpl = Mustache.render(tmpl,args.model);
                        }
                        $(target).render(tmpl,args);
                        if( isFunction(done) ) done.apply(target);
                    }
                });
            } else {
                var tmpl = $html.template(name,{ replaceKeys: args.replaceKeys });
                if( args.model && Mustache != undefined ) {
                    tmpl = Mustache.render(tmpl,args.model);
                }
                $(target).render(tmpl,args);
            }
        }
        
        return this;
    }
    
    htmlHandler.modal = function(args){
        if(!args) args = {};
        else if( isString(args) ) args = { tmpl: args };
        
        if( !$(document.body).children('modals').length ) {
            htmlHandler.jModals = $('<modals>');
            $(document.body).append(htmlHandler.jModals);
        }
        
        var jModalScreen = $('<div class="modal-screen '+args.mode+'">');
        htmlHandler.jModals.append(jModalScreen);
        if( !$(document.body).hasClass('modals-active') ) $(document.body).addClass('modals-active');
        
            var jModalBG = $('<div class="modal-bg '+( args.classBG || 'bg-black-05' )+' animated t-0_25s fadeIn">');
            jModalScreen.append(jModalBG);
            
            var jModalWrapper = $('<div class="modal-wrapper animated t-0_25s fadeInDown" data-ani-hide="fadeOutUp">');
            jModalScreen.append(jModalWrapper);
            
                var jModal = $('<div class="modal-box animated t-0_4s border-radius">');
                jModalWrapper.append(jModal);
                
                    var jModalHeader = $('<div class="modal-header bar-shadow"><button modal="close" type="button" class="button-close">&times;</div></div>');
                    jModal.append(jModalHeader);
                    
                    var jModalBody = $('<div class="modal-body">');
                    jModal.append(jModalBody);
        
        jModal.reload = function(){
            if( args.url ) {
            	//jModalBody.render($html.template('loading/dark'));
                //jModalBody.children().addClass('loading-2x');
            	jModalBody.renderHref(args.url,function(){
            		if( isFunction(args.ready) ) args.ready.apply(jModal.get(0),[jModal]);
            	});
            } else if( args.template ) {
                if( !$html.templateLoaded(args.template) ) {
                    //jModalBody.render($html.template('loading/dark'));
                    //jModalBody.children().addClass('loading-2x');
                }
                jModalBody.renderTemplate(args.template,{ async: true, replaceKeys: args.replaceKeys || {}, model: args.model, done: function(){
                	if( isFunction(args.ready) ) args.ready.apply(jModal.get(0),[jModal]);
                } });
            } else if( args.iframe ) {
                jModalBody.html('<iframe style="width: 100%; height: 100%;" src="'+args.iframe+'" frameborder="0"></iframe>');
            }
        }
        jModal.reload();
        
        jModalScreen.on('modal.close',function(){
            jModalWrapper.aniHide();
            jModalBG.aniHide(function(){
                jModalScreen.remove();
                if( !$('modals').children().length ) $(document.body).removeClass('modals-active');
                delete jModalBody;
                delete jModalHeader;
                delete jModal;
                delete jModalWrapper;
                delete jModalBG;
                delete this;
            });
            if( isFunction(args.close) ) args.close.apply(jModal.get(0),[jModal]);
        });
        
        jModalScreen.on('click',function(e){
            var jClicked = $(e.target), modal_attr;
            if( jClicked.is(jModalBG) || jClicked.is(jModalWrapper) ) jModal.trigger('modal.close');
            else if( modal_attr = jClicked.attr('modal') ) {
                switch(modal_attr) {
                    case 'close':
                        jModal.trigger('modal.close');
                    break;
                }
            }
        });
        
        jModal.close = function(){ jModal.trigger('modal.close'); };
        
        return jModal;
    }
    
    window.$html = htmlHandler;
    
    $(document).ready(function(){
    	$(document.body).initDOM();
    	$html.plugins_running = true;
    });
    
})( jQuery );

$(document).on('engine.ready',function(){
    $doc.click('[data-modal-href]',function(){
        var jURL = $(this);
        var jModal = $html.modal({ url: jURL.attr('data-modal-href') });
    });
});

// ------------------------------------------------------
//      $user
// ------------------------------------------------------

(function( $ ){
    
    var user = new (function(){
        this._data = false;
        this.url = '/-/model/user.json';
        this.on = {};
        
        this.question = function(){
            return $cookies.get('question') || '';
        }
        
        this.status = function(callback){
            if(typeof callback == 'boolean') { async = !callback; callback = function(){} } else async = true;
            
            $.ajax(user.url,{
              type: 'GET', async: async,
              contentType : 'application/json',
              success: function(response){
                user._data = response;
                if(isFunction(callback)) callback.apply(user);
              }
            });
        }
        
        this.data = function(){
            if(user._data) return user._data;
            user.status(true);
            return user._data;
        }
        
        this.isLogged = function(){ return user.data().logged; }
        
        this.logIn = function() {
            var args;
            if( arguments.length == 1 ) {
                form = false;
                if( isFunction(arguments[0]) ) {
                    user.on.logIn = arguments[0]; return true;
                } else if( isObject(arguments[0],'any') ) {
                    form = arguments[0];
                    if( form.get ) form = form.get(0);
                    if( isObject(form,'htmlformelement') ) {
                        args = form.getKeys();
                        console.log('data: '+JSON.stringify(args));
                    } else {
                        form = false;
                        args = arguments[0];
                    }
                } else args = arguments[0];
            } else if( arguments.length == 3 ) {
                if( isFunction(arguments[2]) ) args = { onSuccess: arguments[2] };
                else args = arguments[2];
                args.uname = arguments[0]; args.upass = arguments[1];
            }
            
            var answer = CryptoJS.SHA512(user.question()+CryptoJS.SHA512(args.upass || '').toString()).toString();
            
            var login_data = { answer: answer };
            if( args.uname ) login_data.uname = args.uname;
            if( args.email ) login_data.email = args.email;
            
            return $ajax.postJSON(user.url,{
              data: login_data
            }).done(function(data, textStatus, jqXHR){
                user._data = data;
                if( isFunction(args.onSuccess) ) args.onSuccess.apply(user,[user._data]);
                if( isFunction(args.onAlways) ) args.onAlways.apply(user,[user._data]);
                if( isFunction(user.on.logIn) ) user.on.logIn.apply(user,[user._data]);
                $(document).trigger('user.logged-in');
                $(document).trigger('user.change');
            }).fail(function(jqXHR, textStatus, errorThrown){
                if( isFunction(args.onError) ) args.onError.apply(user,[user._data]);
                if( isFunction(args.onAlways) ) args.onAlways.apply(user,[user._data]);
                $(document).trigger('user.logged-in-failed');
            }).always(function(){
                if( form ) $(form).trigger('form.submit-end',[form]);
            });
        }
        
        this.logOut = function(args) {
            if( arguments.length == 1 ) {
                args = arguments[0];
                if( isFunction(args) ) { user.on.logOut = args; return true; }
            }
            
            return $.ajax(user.url,{
              type: 'DELETE',
              contentType : 'application/json'
            }).done(function(data, textStatus, jqXHR){
                user._data = data;
                try{ args.onSuccess(user,[user._data]); } catch(err){}
                try{ user.on.logOut(user,[user._data]); } catch(err){}
                this._data = false;
                $(document).trigger('user.logged-out');
                $(document).trigger('user.change');
            }).fail(function(jqXHR, textStatus, errorThrown){
                try{ args.onError(user,[user._data]); } catch(err){}
            });
        }
        
    })();
    
    $(document).on('user.logged-required',user.logOut);
    
    window.$user = user;

})( jQuery );

// ------------------------------------------------------
//      $model
// ------------------------------------------------------

(function( $ ){
    
    var core_models = {},
        model_event = $('<event>'),
        model_on = { 'new': {}, 'updated': {} },  //delete comented for IE compatibility
        model_actions = {};
       
    modelHandler = function(name){ this.name = name; };
    
    modelHandler.prototype.on = function(event_name,action){
        var model = this;
        if( isString(event_name) ) {
        	if( isFunction(action) ) {
	        	if( !isObject(model_on[event_name]) ) model_on[event_name] = {};
	        	model_on[event_name][model.name] = action;
        	} else if( action == undefined ) return model_event[event_name] || {};
        	else if( isString(action) ) {
        		if( isObject(model_event[event_name]) ) return model_event[event_name][action];
        		else return false;
        	}
        }
    }
    
    model_event.on('new',function(e,model,item){
        var action = model.on('new',model.name);
        if( isFunction(action) ) actions.apply(_model(table),[item]);
        $(document).find('[model-name=\''+model.name+'\']').trigger('model.new',[item]);
    }); 
       
    model_event.on('updated',function(e,model,item){
        var action = model.on('updated',model.name);
        if( isFunction(action) ) actions.apply(_model(table),[item]);
        $(document).find('[model-name=\''+model.name+'\']').trigger('model.updated',[item]);
    }); 
    
    model_event.on('status',function(e,model,item){
        var action = model.on('status',model.name);
        if( isFunction(action) ) actions.apply(_model(table),[item]);
        $(document).find('[model-name=\''+model.name+'\']').trigger('model.status',[item]);
    }); 
    
    modelHandler.prototype.status = function(id,status){
    	var model = this;
    	if( isString(id) ) id = Number(id);
    	var table = model.table(), item = table.data[table.index[id]];
    	if( item ) {
	    	if( isString(status) ) {
				item.status = status;
				model_event.trigger('updated',[model,item]);
	    	}
	    	return item.status;
    	}
    	return false;
    }
    
    modelHandler.prototype.trigger = function(id,event){
        model_event.trigger(event,[model,this.get(id)]);
    }
    
    var itemHandler = function(model,table,id){
        this.model = model;
        this.table = table;
        this.id = id;
    }
    
    itemHandler.prototype.attr = function(key,value){
        if( isString(key) ) {
            var item = this.table.data[this.table.index[this.id]];
            
            if( value != undefined ) {
                item[key] = value;
                model_event.trigger('updated',[this.model,item]);
            }
            return item[key];
        }
        return false;
    }
    
    itemHandler.prototype.is = function(key,value){
        if( isString(key) ) {
            var item = this.table.data[this.table.index[this.id]];
            
            if( item.$is == undefined ) item.$is = {};
            
            if( value != undefined ) {
                
                item.$is[key] = value;
                model_event.trigger('updated',[this.model,item]);
                
            }
            
            return item.$is[key];
        }
        return false;
    }
    
    itemHandler.prototype.isnt = function(key){
        if( isString(key) ) {
            var item = this.table.data[this.table.index[this.id]];
                
            item.$is[key] = false;
            model_event.trigger('updated',[this.model,item]);
            
            return true;
        }
        return false;
    }
    
    modelHandler.prototype.clear = function(){
        core_models[this.name] = false;
    }
    
    modelHandler.prototype.item = function(id){
        var table = core_models[this.name];
        return new itemHandler(this,table,id);
    }
    
    modelHandler.prototype.action = function(action_name,args){
        var model = this;
        
        if( isString(action_name) ) {
            //console.log('model: '+model.name+', action: '+action_name);
        	if( !isObject(model_actions[model.name]) ) model_actions[model.name] = {
        		
        		'delete': function(id){  // default behavior for action delete
        			var status = model.status(id);
        			model.status(id,'deleting');
		    		$.ajax({
		                type: "DELETE",
		                url: $(document.body).attr('data-model-url') ? $(document.body).attr('data-model-url').replace(':user',model.name) : '/data/'+model.name+'.json',
		                data: JSON.stringify({ id: id, undo: (status == 'deleted') }),
		                dataType: 'json', contentType: 'application/json'
		            }).done(function(){
		            	model.status(id,(status == 'deleted')?'':'deleted');
		            }).fail(function(jqXHR, textStatus, errorThrown){
                        if( jqXHR.status == 401 || jqXHR.status == 403 ) $(document).trigger('user.logged-required',user.logOut);
                        else model.status(id,'');
                    });
	    		}
        	}
        	
            if( isFunction(args) ) {	// register a new action
                model_actions[model.name][action_name] = args;
            } else if( isFunction(model_actions[model.name][action_name]) ) {	// if action exists
                model_actions[model.name][action_name].apply(model,args);
            }
        }
    }
    
    modelHandler.prototype.loadDependencies = function(args){
        if( isFunction(args) ) args = { done: args };
        else if( !isObject(args) ) args = {};
        var table = core_models[this.name], index_keys = Object.keys(table.indexes);
        
        if( index_keys.length ) {
        
            if( args.async ) {
                var pending = {};
                index_keys.forEach(function(index_key){ pending[table.indexes[index_key]] = true; });
            }
            
            index_keys.forEach(function(index_key){
                var model_name = table.indexes[index_key];
                if( args.async ) {
                    _model(model_name).table({
                        async: true,
                        done: function(){
                            _model(model_name).loadDependencies({ async: true, done: function(){
                                delete pending[model_name];
                                if( !Object.keys(pending).length ) args.done.apply(table);
                            } });
                        }
                    });
                } else  if( _model(model_name).table() ) {
                    if( !args.async ) _model(model_name).loadDependencies();
                }
            });
            
        } else if( isFunction(args.done) ) args.done.apply(table);
    }
    
    modelHandler.prototype.updateList = function() {
    	var table = core_models[this.name];
    	table.list = [];
        Object.keys(table.index).forEach(function(i){ table.list[table.index[i]] = parseInt(i); });
    }
    
    modelHandler.prototype.set = function(table_data) {
    	if( isObject(table_data) ) {
    		core_models[this.name] = table_data;
    		this.updateList();
    	}
    }
    
    modelHandler.prototype.table = function(args){
        if( !args ) args = {};
        args.async = (args.async == undefined) ? (isFunction(args.done)?true:false) : args.async;
        
        var model = this;
        var name = this.name;
        
        if( args.cache === false || !core_models[name] ) {
            $.ajax({
                type: "GET",
                url: $(document.body).attr('data-model-url') ? $(document.body).attr('data-model-url').replace(':user',name) : '/data/'+name+'.json',
                async: args.async,
                dataType: 'json', contentType: 'application/json',
                success: function(json){
                	model.set(json);
                    if( args.async ) {
                        console.log('loaded '+name+'.json');
                        if( args.cascade ) {
                            model.loadDependencies({ async: true, done: args.done });
                        } else if( isFunction(args.done) ) args.done.apply(model,[core_models[name]]);
                    }
                }
            }).fail(function(jqXHR, textStatus, errorThrown){
                if( jqXHR.status == 401 || jqXHR.status == 403 ) $(document).trigger('user.logged-required',user.logOut);
            });
            if(!args.async) console.log('loaded '+name+'.json');
        } else if( args.async ) {
            if( args.cascade ) {
                model.loadDependencies({ async: true, done: args.done });
            } else if( isFunction(args.done) ) args.done.apply(model,[core_models[name]]);
        }
        
        if( core_models[name] ) {
            if( args.cascade ) model.loadDependencies({ async: false });
            
            return core_models[name];
        } 
        return false;
    }
    
    modelHandler.prototype.parsedData = function(index,not_first) {
        var model = this, table;
        
        if( isString(index) ) index = parseInt(index);
        
        if( !not_first ) model.table({ cascade: true });
        
        if( table = core_models[model.name] ) {
            if( isArray(index) ) {
                var data = [];
                index.forEach(function(i){ data.push(model.parsedData(i,true)); });
                return data;
            } else if( isNumber(index) ) {
                var data_index = table.index[index];
                if( isNumber(data_index) ) {
                    var item = {}, src_item = table.data[parseInt(data_index)];
                    
                    Object.keys(src_item).forEach(function(key){
                        var indexed_table = table.indexes[key];
                        
                        if( indexed_table != undefined ) {
                            item[key] = _model(indexed_table).parsedData(src_item[key],true);
                        } else item[key] = src_item[key];
                    });
                    return item;
                }
            } else if(index == undefined) return model.parsedData(table.list,true);
        }
        return false;
    }
    
    modelHandler.prototype._get = function(index,args){
        var model = this, table = core_models[model.name];
        
        function fixIndex(){
            table = core_models[model.name];
            if( isNumber(args.pos) ) index = table.list[args.pos];
            else if( isArray(args.pos) ) {
                index = [];
                args.pos.forEach(function(i){ index.push(table.list[i]); });
            } else if( index == undefined ) index = table.list;
        }
        
        args.async = (args.async === undefined) ? (isFunction(args.done)?true:false) : args.async;
        
        //console.log('model: '+this.name+', async: '+args.async+', done: '+args.done);
        
        if( args.mode == 'full' ) {
            var full_json = true,
                url = $(document.body).attr('data-model-url') ? $(document.body).attr('data-model-url').replace(':user',model.name) : '/data/'+model.name+'.json';
            
            $.ajax({
                type: "GET",
                url: url+'?mode=full', async: args.async,
                dataType: 'json', contentType: 'application/json',
                success: function(json){
                    full_json = json;
                    if( isFunction(args.done) ) args.done.apply(model,[json]);
                }
            });
            return full_json;
        } else if(args.async) {
            model.table({
                done: function(){
                    fixIndex();
                    if( isFunction(args.done) ) args.done.apply(model,[model.parsedData(index)]);
                }, async: true
            });
            return true;
        } else {
        	model.table();
            fixIndex();
            if( isFunction(args.done) ) args.done.apply(model,[model.parsedData(index)]);
            return model.parsedData(index);
        }
            
        return false;
    }
    
    modelHandler.prototype.get = function(){
        var args = {}, index = undefined;
        if( isString(arguments[0]) ) {
            if( Number(arguments[0]) ) arguments[0] = Number(arguments[0]);
        }
        
        if( isNumber(arguments[0]) || isArray(arguments[0]) ) {
            index = arguments[0];
            if( isFunction(arguments[1]) ) {
                if( isObject(arguments[2]) ) {
                    args = arguments[2];
                    args.done = arguments[1];
                } else if( isFunction(arguments[2]) ) {
                    if( isObject(arguments[3]) ) args = arguments[3];
                    args.fail = arguments[2];
                    args.done = arguments[1];
                } else args.done = arguments[1];
            } else if( isObject(arguments[1]) ) args = arguments[1];
        } else if( isFunction(arguments[0]) ) {
            if( isFunction(arguments[1]) ) {
                args = { done: arguments[0] };
                args.fail = arguments[1];
            } else if( isObject(arguments[1]) ) {
                args = arguments[1];
                args.done = arguments[0];
            } else args.done = arguments[0];
        } else if( isObject(arguments[0]) ) args = arguments[0];
        
        return this._get(index,args);
    };
    
    modelHandler.prototype.save = function(model_data,args){
    	var model = this;
        if( isFunction(args) ) args = { done: args };
        else if( !isObject(args) ) args = {};
        
        var jqXHR = $.ajax({
            type: 'POST',
            url: $(document.body).attr('data-model-url') ? $(document.body).attr('data-model-url').replace(':user',model.name) : '/data/'+model.name+'.json',
            data: JSON.stringify(model_data),
            dataType: 'json', contentType: 'application/json',
            success: function(response){
                var id, table = model.table();
                
            	if( id = parseInt(model_data.id) ) {
            		var item = table.data[table.index[id]];
            		
            		Object.keys(response.data).forEach(function(key){
            			item[key] = response.data[key];
            		});
            		
            		console.log('status: '+item.status);
            		
            		model_event.trigger('updated',[model,item]);
            		
            	} else {
            	    if(response.data) {
            	        if(response.data.id) {
                    	    var pos = table.length;
                    	    table.data.push(response.data);
                    	    table.index[parseInt(response.data.id)] = pos;
                    	    table.list.push(parseInt(response.data.id));
                    	    
                    	    model_event.trigger('new',[model,response.data]);
            	        }
            	    }
            	}
            	
            	if( isFunction(args.done) ) args.done.apply(model,[response]);
            }
        }).fail(function(jqXHR, textStatus, errorThrown){
            if( jqXHR.status == 401 || jqXHR.status == 403 ) $(document).trigger('user.logged-required',user.logOut);
        });
        return jqXHR;
    }
    
    _model = function(name,args){ return new modelHandler(name,args); }
    
    _model.require = function(selectors,args){
    	var model = this;
    	if( !args ) args = {};
        else if( isFunction(args) ) {
            if( isObject(arguments[2]) ) { arguments[2].done = args; args = arguments[2]; }
            else args = { done: args };
        }
        
        if( isString(selectors) && /\w+,\w+/.test(selectors) ) selectors.split(',')
        
        if( isArray(selectors) ) {
        	var pending = {};
        	var json = {};
        	selectors.forEach(function(selector){ pending[selector] = true; });
        	selectors.forEach(function(selector){
        		_model.require(selector,{
        			done: function(data){
        				delete pending[selector];
        				json[selector] = data;
        				if( Object.keys(pending).length == 0 ) {
        					if( isFunction(args.done) ) args.done.apply(model,[json]);
        				}
        			}, async: args.async
        		});
        	});
        	
        } else if( isString(selectors) ) {
        	//alert('reload '+args.reload);
        	if( core_models[selectors] && !args.reload ) {
        		if( isFunction(args.done) ) args.done.apply(model,[core_models[selectors]]);
        		return core_models[selectors];
        	} else {
        	    //console.log('model required '+selectors+', args: '+Object.keys(args));
        	    if( args.reload ) _model(selectors).clear();
		        return _model(selectors).get(args.done);
        	}
        }
	        
        return false;
    }
    
    _model.clear = function(){ core_models = {}; };
    
    window.$model = _model;
    
    $(document).on('user.logged-out',function(){
        $model.clear();
        console.log('user.logged-out >: $model.clear();');
    });

})( jQuery );


    // HTML PLUGIN
$(function(){
    
    $html.renderPlugin('[model-repeat]',function(args){
        if( !args ) args = {};
        
        var jThis = $(this), jParent = jThis.parent(), jRow = {};
        var template, match, cmds = jThis.attr('model-repeat');
        
        jThis.removeAttr('model-repeat');
        template = this.outerHTML;
        jThis.remove();
        
        cmd = cmds.split('|');
        
        if( match = cmd[0].match(/([\/\.\-\_\w]+)\sin\s([\/\-\_\.\w]+)/) ) {
        	var items_path = match[2].split('.'), path_step;
            var model = $model(items_path.shift());
            var item_name = match[1];
            
            model.get(function(items){
                if( jThis.attr('model-sortby') ) items.sortBy( jThis.attr('model-sortby').split(',') );
                
            	items.forEach(function(model_item){
            	    if(model_item.status == 'deleted') return false;
            	    
            		var item = model_item;
            		item_path = items_path.clone();
	            	while( path_step = item_path.shift() ) {
	            		if( item[path_step] ) item = item[path_step];
	            		else return false;
	            	}
            		
                    var keys = {};
                    keys[item_name] = item;
                    
                    var jItem = $(template.replaceKeys(keys,{ clean: true }).i18n()).attr('model-item',model.name+'/'+item.id);
                    jRow[item.id] = jItem;
                    
                    if( item.status != undefined ) jItem.attr('model-status',item.status);
                    if( isObject(item.$is) ) {
                        Object.keys(item.$is).forEach(function(prop){
                            if( item.$is[prop] ) jItem.addClass('is-'+prop);
                        });
                    }
                    
                    jParent.append(jItem);
                });
                jParent.attr('model-name',model.name);
                jParent.on('model.updated',function(e,model_item){
                	var item = model_item;
            		item_path = items_path.clone();
	            	while( path_step = item_path.shift() ) {
	            		if( item[path_step] ) item = item[path_step];
	            		else return false;
	            	}
	            	
                	var keys = {};
                    keys[item_name] = $model(model.name).get(item.id);
                    jItem = $(template.replaceKeys(keys,{ clean: true }).i18n()).attr('model-item',model.name+'/'+item.id);
                    if( item.status != undefined ) jItem.attr('model-status',item.status);
                    if( isObject(item.$is) ) {
                        Object.keys(item.$is).forEach(function(prop){
                            if( item.$is[prop] ) jItem.addClass('is-'+prop);
                        });
                    }
                    
                	jRow[item.id].replaceWith(jItem);
                	jRow[item.id] = jItem;
                });
                jParent.on('model.new',function(e,model_item){
                	var item = model_item;
            		item_path = items_path.clone();
	            	while( path_step = item_path.shift() ) {
	            		if( item[path_step] ) item = item[path_step];
	            		else return false;
	            	}
	            	
                	var keys = {};
                    keys[item_name] = $model(model.name).get(item.id);
                    jItem = $(template.replaceKeys(keys,{ clean: true }).i18n()).attr('model-item',model.name+'/'+item.id);
                    if( item.status != undefined ) jItem.attr('model-status',item.status);
                	jRow[item.id] = jItem;
                	jParent.prepend(jItem);
                });
                jParent.on('model.status',function(e,item){
                	jRow[item.id].attr('model-status',item.status);
                });
            },{ async: jThis.attr('model-async') ? ( jThis.attr('model-async') == 'true' ? true : false ) : undefined });
        }
    });
    
    $(document).on('engine.ready',function(){
        $doc.click('[model-action]',function(){
            var jClicked = $(this), action = jClicked.attr('model-action'), match;
            var patt = /^\s*(([\-\_\w]+)(\/([\-\_\w]+))?\.)?([\-\_\w]+)\s*$/;
            
            if( match = action.match(patt) ) {
                var action_name = match[5], model_name = match[2], model_id = match[4];
                
                if( action_name ) {
                    if( !model_name ) {
                        if( jClicked.attr('model-name') ) model_name = jClicked.attr('model-name');
                        else if( jClicked.attr('model-item') || jClicked.data('model-item') ) {
                            
                            var model_item; //  /^\s*([\-\_\w]+)(\/([\-\_\w]+))\s*$/
                            if( model_item = ( jClicked.attr('model-item') || jClicked.data('model-item') ).match(/^\s*(.+)\/(.+)\s*$/) ) {
                                if( model_item[1] ) model_name = model_item[1];
                                if( model_item[2] ) model_id = model_item[2];
                            }
                        } else {
                            var jTmp = jClicked;
                            while( jTmp.length ) {
                                if( jTmp.attr('model-item') || jTmp.data('model-item') ) {
                                    var model_item;
                                    if( model_item = ( jTmp.attr('model-item') || jTmp.data('model-item') ).match(/^\s*(.+)\/(.+)\s*$/) ) {
                                        if( model_item[1] ) model_name = model_item[1];
                                        if( model_item[2] ) model_id = model_item[2];
                                    }
                                }
                                jTmp = jTmp.parent();
                            }
                        }
                    }
                    
                    if( model_name ) $model(model_name).action(action_name,[model_id]);
                }
            }
        });
    });
});

// ------------------------------------------------------
//      $gears
// ------------------------------------------------------

(function( $ ){
	
	var gears_list = {},
	    gear_definitions = {};
	
	var gearHandler = function(name,gear){
		this.name = name;
		if( isFunction(gear) ) gear_definitions[this.name] = gear;
	};
	
    gearHandler.prototype.get = function(args){
    	if( isFunction(args) ) {
    		args = { async: true, done: args };
    	} else if( !isObject(args) ) args = {};
    	
    	var gear_name = this.name;
    	
        if( !gears_list[gear_name] ) {
            
            if( isFunction(gear_definitions[gear_name]) ) {
                gears_list[gear_name] = new gear_definitions[gear_name]();
                if( isFunction(args.done) ) args.done.apply(this,[gears_list[gear_name]]);
            } else {
                $ajax('/gears/'+gear_name+'.gear',{
                    async: ( ( args.async === undefined ) ? ( isFunction(args.done) ? true : false ) : args.async ),
                }).done(function(data){
                	var gear;
                    try{
                    	eval('gear = new (function(){'+data+'})();');
                    } catch(err) {
                    	console.log('error parsing '+gear_name+'.gear\n'+err.message);
                    	return false;
                    }
                    gears_list[gear_name] = gear;
                    if( isFunction(args.done) ) args.done.apply(this,[gear]);
                }).fail(function(xhr){
                	if( isFunction(args.done) ) args.done.apply(this,[false]);
                });
            }
            
        } else {
        	if( isFunction(args.done) ) args.done.apply(false,[gears_list[gear_name]]);
        }
        return gears_list[gear_name];
    }
    
    gearHandler.prototype.run = function(){
        this.get(function(gear){
        	if(gear) {
		        if( isFunction(gear.run) ) gear.run.apply(gear);
		    } else console.log('[warning] gear not foud: '+name);
        });
    }
    
    var gearsHandler = function(name,gear){ return new gearHandler(name,gear); };
    
    window.$gear = gearsHandler;
    
})( jQuery );

    // HTML PLUGIN
    
(function( $html ){
    
    $html.plugin('[data-gear]',function(){
        $gear($(this).attr('data-gear')).run();
        console.log('[data-gear='+$(this).attr('data-gear')+']');
    });
    
})($html);

// ------------------------------------------------------
//      $doc
// ------------------------------------------------------

(function( $ ){

    var docHandler = new (function(){
        var doc = this;
        
        this.find = document.find;
        
        this.fn = {};
        this.runFn = function(name) {
            if( isFunction(doc.fn[name]) ) doc.fn[name]();
        };
        this.setFn = function(name,action) {
            if( isString(name) && isFunction(action) ) doc.fn[name] = action;
        };
        
        this.actions = {};
        
        this.runAction = function(event,name,jCaller,args) {
            if( !args ) args = [];
            if( isString(event) && doc.actions[event]) {
                if( isFunction(doc.actions[event][name]) ) doc.actions[event][name].apply(jCaller.get(0),args);
            }
        };
        this.action = function(event,name,action) {
            if( isString(event) && isString(name) && isFunction(action) ) {
                if( !isObject(doc.actions[event]) ) doc.actions[event] = {};
                doc.actions[event][name] = action;
            }
        };
        
        var clickHandlers = {};
        this.click = function(selector,action) {
            if( isString(selector) ) {
                if( isFunction(action) ) {
                    clickHandlers[selector] = action;
                } else if( action == undefined ) {
                    if( isFunction( clickHandlers[selector] ) ) return clickHandlers[selector];
                    else return function(){};
                }
            } else if( /^html[a-z]+element$/.test(varType(selector)) ) {
                Object.keys(clickHandlers).forEach(function(key){
                    if( isFunction(clickHandlers[key]) && $(selector).filter(key).length ) {
                        clickHandlers[key].apply(selector,[action]);
                        return true;
                    }
                });
            } else if( isObject(selector,'jquery') ) {
                Object.keys(clickHandlers).forEach(function(key){
                    if( isFunction(clickHandlers[key]) && selector.filter(key).length ) {
                        clickHandlers[key].apply(selector.get(0),[action]);
                        return true;
                    }
                });
            }
            return false;
        }
        
        this.on = function(event,action){ $(document).on(event,action); };
        
        this.onhashchange = {};
        this.onhashchange['default'] = function(){};
        
        this.hashChange = function(e) {
            if(arguments.length) {
                var arg0 = arguments[0];
                if( /event/.test(varType(arg0)) ) {
                    doc.onhashchange['default'].apply(arg0);
                    if( doc.onhashchange[doc.view] ) {
                        doc.onhashchange[doc.view].apply(arg0);
                    }
                } else switch(varType(arg0)) {
                    case 'function':
                        doc.onhashchange['default'] = arg0;
                        break;
                    case 'string':
                        var arg1;
                        if( arg1 = arguments[1] ) {
                            if( isFunction(arg1) ) doc.onhashchange[arg0] = arg1;
                        }
                        break;
                }
            } else {
            	doc.onhashchange['default'].apply(false);
                if( doc.onhashchange[doc.view] ) {
                	doc.onhashchange[doc.view].apply(false);
                }
            }
        }
        
        this.onchangestate = function(){}
        
        this.changeState = function(href,args){
            if( arguments.length == 1 ) {
                if( isFunction(arguments[0]) ) doc.onchangestate = arguments[0];
            } else if( isString(href) ) {
                if(!args) args = {};
                if( isString(args.target_id) && $(args.target_id) ) {
                    $(args.target_id).addClass('loading');
                    if(history.pushState) {
                        $('modals').children().trigger('modal.close');
                        $.ajax({ type: "GET", headers: { 'X-View': 'HTMLHttpRequest' }, url: href, dataType: 'text', processData: false }).always(function(jqXHR,textStatus,errorThrown){
                            if( textStatus == 'success' ) {
                                var state = { html: jqXHR, view_type: args.view_type, title: args.title || (document.title || ''), href: href, target_id: args.target_id };
                            } else {
                            	if( Number(jqXHR.status) == 403 ) {
                            		args.view_type = 'user';
                            		//$user.status();
                            		$(document.body).attr('data-user-logged',false);
                            	} else args.view_type = jqXHR.status;
                                var state = { html: jqXHR.responseText, view_type: args.view_type, title: args.title || (document.title || ''), href: href, target_id: args.target_id };
                            }
                            history.pushState(state,document.title,href);
                            $(args.target_id).removeClass('loading');
                            try{
                                var event = triggerEvent(document,'popstate',{ state: state });
                            } catch(err) { alert(err.message); }
                        });
                    }
                }
            }
        }
        
        this.viewHandler = {};
        this.onView = function(view_name,action){
            if( isString(view_name) ) {
                if( isFunction(action) ) {
                    if( !isArray(doc.viewHandler[view_name]) ) doc.viewHandler[view_name] = [];
                    doc.viewHandler[view_name].push(action);
                }
            }
        }
        $(document).on('view.change',function(view){
            if( isArray(doc.viewHandler[view.name]) ) {
                doc.viewHandler[view.name].forEach(function(action){
                   if( isFunction(action) ) action.apply(view);
                });
            }
        });
        
        this.stateChange = function(e){
            if( isFunction(e) ) doc.onchangestate = e;
            else {
                if( !doc.current_pathname || doc.current_pathname != location.pathname ) {
                    var state;
                    if( state = e.state ) {
                        doc.view = location.pathname.split('/')[1];
                        console.log('stateChange | html '+(state.html?'OK':'missing')+', target_id: '+state.target_id )
                        
                        if(state.target_id) {
                            if(state.html) {
                                $(state.target_id).render(state.html);
                                $(document.body).attr('data-current-view',doc.view);
                                $(document.body).attr('data-view-type',state.view_type);
                                if( /#/.test(state.href || '') ) docHandler.hashChange();
                                $(document).trigger('view.change',[{ name: doc.view, type: state.view_type }]);
                            } else $(state.target_id).renderHref(state.href,function(){
                                $(document.body).attr('data-current-view',doc.view);
                                $(document.body).attr('data-view-type',state.view_type);
                                if( /#/.test(state.href || '') ) docHandler.hashChange();
                                $(document).trigger('view.change',[{ name: doc.view, type: state.view_type }]);
                            });
                        }
                        doc.onchangestate.call(state,e);
                    } else {
                        if(doc.first_run) location.reload();
                        doc.first_run = true;
                    }
                }
                doc.current_pathname = location.pathname;
            }
        }
        doc.view = location.pathname.split('/')[1];
        
    })();
    
    docHandler.ready = function(action){
        if( isFunction(action) ) action.apply();
    }
    
    window.$doc = docHandler;
    
    window.onhashchange = $doc.hashChange;
    window.onpopstate = $doc.stateChange;

})( jQuery );

// ------------------------------------------------------
//      DOC READY
// ------------------------------------------------------

$(document).ready(function(){
    var jDoc = $(this);
    
    jDoc.click(function(e){
        var jClicked = $(e.target), aux;
        
        if( e.which != 1 ) return false; // ensure is left click
        
        while( jClicked.length ) {
            if( aux = jClicked.attr('data-action-click') ) $doc.runAction('click',aux,jClicked);
            
            if( aux = jClicked.attr('data-trigger') ) {
                if( aux == 'hashchange' ) $doc.hashChange();
                else jClicked.trigger(aux);
            }
            
            if( href = jClicked.attr('href') ) {
                view_type = jClicked.data('view') || ( jClicked.attr('target') ? (jClicked.attr('target').match(/^\s*view\:([\w\-\_]+)\s*/) || [])[1] : false );
                
                if( view_type ) {
                    var target_id = jClicked.attr('view-target') || '#main';
                    if( $(target_id).length && history.pushState ) {
                        stopEvent(e);
                        if( href.split('#')[0] != location.pathname.split('#')[0] ) {
                            $doc.changeState(href,{ view_type: view_type, target_id: target_id, element: jClicked.get(0) });
                        } else if( /#/.test(href) ) {
                            location.hash = href.split('#')[1];
                        }
                        
                    }
                    break;
                }
                if( target = jClicked.attr('data-target') ) {
                    if( $(target).length ) {
                        $(target).renderHref(href); stopEvent(e);
                        break;
                    }
                }
            }
            
            if( className = jClicked.attr('toggle-class') ) {
                if( jClicked.hasClass(className) ) jClicked.removeClass(className);
                else jClicked.addClass(className);
            }
            
            if( $doc.click(jClicked,e) ) jClicked = $();
            else jClicked = jClicked.parent();
        }
    });
    
    //console.log('jEngine started!');
    
    if( /#/.test(location) ) $doc.hashChange();
    
    $(document).trigger('engine.ready');
});



// ------------------------------------------------------
//      GENERAL HTML PLUGINS
// ------------------------------------------------------

    $html.plugin('.widget-slider',function(){
        var jSlider = $(this), jPrevious;
        var jSlides = jSlider.find('.slide');
        var num = jSlides.length;
        
        function playFrame(index) {
            jPrevious = jSlides.filter('.active');
            jPrevious.filter('[data-any-hide]').aniHide();
            jPrevious.removeClass('active').addClass('hidding');
            jSlides.eq(index).addClass('active').aniShow(function(){ jPrevious.removeClass('hidding'); });
            
            var timeout = Number($(this).attr('data-slide-duration')) || Number(jSlider.attr('data-slide-duration'));
            if( timeout )
            setTimeout(function(){
                nextSlide();
            }, timeout );
        }
        
        function ondemandImg(jSlide,callback){
        	var jIMG = jSlide.find('img[data-on-demand]');
        	if( !jIMG.length && isFunction(callback) ) callback.apply(jSlide.get(0));
        	else {
                var img = jIMG.get(0);
                img.src = img.getAttribute('data-on-demand');
                img.removeAttribute('data-on-demand');
                img.onload = function(){
                	callback.apply(jSlide.get(0));
                };
            }
        }
        
        function nextSlide() {
            var index = jSlides.filter('.active').index() + 1;
            if( index >= num ) index = 0;
            else if( index < 0 ) index = num;
            
            var jSlide = jSlides.eq(index);
            
            if( $(document).contains(jSlider) ) {
                //console.log('nextSlide: '+index+' ('+( Number(jSlides.eq(index).attr('data-slide-duration')) || Number(jSlider.attr('data-slide-duration')) || 2000 )+')');
                ondemandImg(jSlide,function(){ playFrame(index); });
            }
        }
        
        jSlides.addClass('hide');
        ondemandImg(jSlides.filter(':first'),function(){
            $(this).addClass('active').aniShow();
            var timeout = Number($(this).attr('data-slide-duration')) || Number(jSlider.attr('data-slide-duration'));
            if( timeout ) setTimeout(nextSlide, timeout );
        });
    });
    
    $doc.click('[data-active-list]',function(e){
        var jList = $(this), jClicked = $(e.target);
        var mode = jList.attr('data-active-list');
        
        while( jClicked.length ) {
            if( jList.is(jClicked.parent()) ) {
                if( mode == 'one' ) {
                    if( !jClicked.hasClass('active') ) {
                        jList.children().removeClass('active');
                        jClicked.addClass('active');
                        jList.trigger('change',[jClicked,jList]);
                    }
                } else { // mode == 'any'
                    if( jClicked.hasClass('active') ) jClicked.removeClass('active'); else jClicked.addClass('active');
                    jList.trigger('change',[jList.children('.active'),jList]);
                }
                break;
            }
            jClicked = jClicked.parent();
        }
    });
    
    $html.plugin('ul[data-select-name]',function(){
    	var jSelect = $(this),
			jUlLi = jSelect.children('li'),
			jLabel = jUlLi.children('a'),
			jUL = jUlLi.children('ul'),
			mode = jUL.attr('data-active-list'),
			jInput = $('<input type="hidden" name="'+jSelect.attr('data-select-name')+'"></input>'),
			jOptions = jUL.children('[data-value]').not('[data-value=]'),
			jAll = jUL.children('[data-value=]');
			
			jSelect.append(jInput);
			jAll.attr('data-text-label',jLabel.text());
			
			jUL.on('change',function(e,jActive){
				e.stopPropagation();
				jSelect.trigger('change',[jActive.attr('data-value')]);
			});
			
			jSelect.on('change',function(e,value){
				jInput.val(value);
				jSelect.attr('data-selected-value',value);
				var jActive = jUL.children('.active');
				var label = jActive.attr('data-text-label') || jActive.text();
				jLabel.text(label);
			});
			
			if( jSelect.attr('data-filter-by') ) {
				var jFilter = $('ul[data-select-name='+jSelect.attr('data-filter-by')+']');
				jFilter.on('change',function(e,value){
					jOptions.remove();
					
					if( value ) jUL.append(jOptions.filter('[data-filter='+value+']'));
					else {
						var found = {};
						jFilter.find('[data-value]').each(function(){ found[this.getAttribute('data-value')] = true; });
						
						jOptions.each(function(){ if( found[this.getAttribute('data-filter')] ) jUL.append(this); });
					}
					
					if( jUL.children('.active').length ) jUL.trigger('change',[jUL.children('.active')]);
					else {
						jOptions.removeClass('active');
						jUl.trigger('change',[jAll.addClass('active')]);
					}
				});
			}
    });
    
    // LISTS
    
    $doc.click('label',function(e){
        $(this).next('input').focus();
        $(this).next('select').focus();
        $(this).next('textarea').focus();
    });
    
    $html.plugin('select[selected-value]',function(){
        var option = this.find('[value=\''+this.attr('selected-value')+'\']').each(function(option){ option.selected = true; });
    });
