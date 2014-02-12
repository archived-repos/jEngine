//	jqPower - This script enhances jQuery providing useful common methods.
//	Copyright (C) 2014  Jesús Manuel Germade Castiñeiras
//	
//	This program is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published by
//	the Free Software Foundation, either version 3 of the License.



// ------------------------------------
// NATIVE PROTOTYPE FUNCIONS
// ------------------------------------

function stopEvent(e) {
    if(e) e.stopped = true;
    if (e &&e.preventDefault) e.preventDefault();
    else if (window.event && window.event.returnValue) window.eventReturnValue = false;
};

function triggerEvent(element,name,args){
  var event; // The custom event that will be created

  if (document.createEvent) {
    event = document.createEvent("HTMLEvents");
    event.initEvent(name, true, true);
  } else {
    event = document.createEventObject();
    event.eventType = name;
  }

  event.eventName = name;
  Object.keys(args).forEach(function(item){
      event[item] = args[item];
  });

  if (document.createEvent) {
    element.dispatchEvent(event);
  } else {
    element.fireEvent("on" + event.eventType, event);
  }
  
  return event;
}


Event = Event || window.Event;


// function String.formatText(arg1,args2,...)
// return: replaced '%n' by arg[n] string
if (!String.prototype.formatText) {
 String.prototype.formatText = function() {
   var args = arguments;
   return this.replace(/{(\d+)}/g, function(match, number) { 
     return typeof args[number] != 'undefined' ? args[number] : match ;
   });
 };
}

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

// function String.replaceKeys(item)
// return: replaced '{key1} some text {key2}' with item: { key1: 'value1', key2: 'value2' }
if (!String.prototype.replaceKeys) {
 String.prototype.replaceKeys = function(keys,args) {
	if( !args ) args = {};
	if(!keys) return this;
	return this.replace(/\${\s*([\w\-\_\.]+)\s*}/g, function(match, key) {
       if(/\./.test(key)) {
           var path = key.split('.'), in_keys = keys;
           for(var k=0;k<path.length;k++) {
               if(in_keys[path[k]] == undefined) return (args.clean?'':match);
               in_keys = in_keys[path[k]];
            }
           return in_keys;
       } else return (keys[key] == undefined)?(args.clean?'':match):keys[key];
	});
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

function varType(obj){
    if( obj == undefined ) return 'undefined';
    if( typeof(obj) == 'object' ) {
        if( obj.jquery ) return 'jquery';
        
        var match;
        
        if( match = (''+obj.constructor).match(/^\s*function\s*(.*)\(/) ) return match[1].toLowerCase();
        
        if( match = (''+obj.constructor).match(/^\[object\s(.*)\]$/) ) return match[1].toLowerCase();
        
        alert('unknown object '+obj.constructor);
    } else return typeof(obj);
}

if (!String.prototype.is) {
    String.prototype.is = function(){
        if( arguments.length == 0 ) {
            return ( !!this.length && this != 'undefined' );
        } else if( arguments.length == 1 ) {
            if( arguments[0] == undefined ) return this == 'undefined';
            else return this == arguments[0];
        }
        return false;
    }
}

if (!String.prototype.clone) {
	Array.prototype.clone = function(){
		var dolly = []
		this.forEach(function(o){ dolly.push(o); });
		return dolly;
	}
}


function isObject(myVar,type){ if( typeof(myVar) == 'object' ) return varType(myVar) == (type || 'object'); else return false; }
function isString(myVar){ return varType(myVar) == 'string'; }
function isFunction(myVar){ return varType(myVar) == 'function'; }
function isArray(myVar){ return varType(myVar) == 'array'; }
function isNumber(myVar){ return varType(myVar) == 'number'; }


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
            if( date1 == date2 ) return 0;
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

	//	About base64.js (window.B64)
	//	-	Copyright Vassilis Petroulias [DRDigit]
	//	-	Licensed under the Apache License, Version 2.0 (the "License");
	window.B64={alphabet:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",lookup:null,ie:/MSIE /.test(navigator.userAgent),ieo:/MSIE [67]/.test(navigator.userAgent),encode:function(e){var t=B64.toUtf8(e),n=-1,r=t.length,i,s,o,u=[,,,];if(B64.ie){var a=[];while(++n<r){i=t[n];s=t[++n];u[0]=i>>2;u[1]=(i&3)<<4|s>>4;if(isNaN(s))u[2]=u[3]=64;else{o=t[++n];u[2]=(s&15)<<2|o>>6;u[3]=isNaN(o)?64:o&63}a.push(B64.alphabet.charAt(u[0]),B64.alphabet.charAt(u[1]),B64.alphabet.charAt(u[2]),B64.alphabet.charAt(u[3]))}return a.join("")}else{var a="";while(++n<r){i=t[n];s=t[++n];u[0]=i>>2;u[1]=(i&3)<<4|s>>4;if(isNaN(s))u[2]=u[3]=64;else{o=t[++n];u[2]=(s&15)<<2|o>>6;u[3]=isNaN(o)?64:o&63}a+=B64.alphabet[u[0]]+B64.alphabet[u[1]]+B64.alphabet[u[2]]+B64.alphabet[u[3]]}return a}},decode:function(e){if(e.length%4)throw new Error("InvalidCharacterError: 'B64.decode' failed: The string to be decoded is not correctly encoded.");var t=B64.fromUtf8(e),n=0,r=t.length;if(B64.ieo){var i=[];while(n<r){if(t[n]<128)i.push(String.fromCharCode(t[n++]));else if(t[n]>191&&t[n]<224)i.push(String.fromCharCode((t[n++]&31)<<6|t[n++]&63));else i.push(String.fromCharCode((t[n++]&15)<<12|(t[n++]&63)<<6|t[n++]&63))}return i.join("")}else{var i="";while(n<r){if(t[n]<128)i+=String.fromCharCode(t[n++]);else if(t[n]>191&&t[n]<224)i+=String.fromCharCode((t[n++]&31)<<6|t[n++]&63);else i+=String.fromCharCode((t[n++]&15)<<12|(t[n++]&63)<<6|t[n++]&63)}return i}},toUtf8:function(e){var t=-1,n=e.length,r,i=[];if(/^[\x00-\x7f]*$/.test(e))while(++t<n)i.push(e.charCodeAt(t));else while(++t<n){r=e.charCodeAt(t);if(r<128)i.push(r);else if(r<2048)i.push(r>>6|192,r&63|128);else i.push(r>>12|224,r>>6&63|128,r&63|128)}return i},fromUtf8:function(e){var t=-1,n,r=[],i=[,,,];if(!B64.lookup){n=B64.alphabet.length;B64.lookup={};while(++t<n)B64.lookup[B64.alphabet.charAt(t)]=t;t=-1}n=e.length;while(++t<n){i[0]=B64.lookup[e.charAt(t)];i[1]=B64.lookup[e.charAt(++t)];r.push(i[0]<<2|i[1]>>4);i[2]=B64.lookup[e.charAt(++t)];if(i[2]==64)break;r.push((i[1]&15)<<4|i[2]>>2);i[3]=B64.lookup[e.charAt(++t)];if(i[3]==64)break;r.push((i[2]&3)<<6|i[3])}return r}}

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
                                    if( item[name] != undefined ) {
                                        if( item[name].push ) item[name].push(jInput.val() || '');
                                        else item[name] = [item[name],jInput.val() || ''];
                                    } else item[name] = jInput.val() || '';
                                }
                            }
                        });
                        break;
                    /*case 'table':
                        return $(this).find('tr').getKeysList();
                        break;*/
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
            aniClass = jThis.attr('ani-show') || 'fadeIn';
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
            aniClass = jThis.attr('ani-hide') || 'fadeOut';
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
            url: '/base/model/i18n.json'+params,
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
//      $html
// ------------------------------------------------------

(function( $ ){
    var jBody = $(document.body);
    
    var htmlHandler = new (function(){
        var templates = {};
        
        this.replaceKeys = function(text,keys) {
            //console.log('$html.replaceKeys('+isObject(htmlHandler.globalKeys)+') '+JSON.stringify(htmlHandler.globalKeys));
            if( !isString(text) ) return text;
            if( isObject(keys) ) text = text.replaceKeys(keys);
            if( isArray(keys) ) {
                keys.forEach(function(k){ if( isObject(k) ) { text = text.replaceKeys(k); } });
            }
            
            return text;
        }
        
        this.template = function(name,args){
            /*var name, args = {};
            if( !arguments.length ) return '';
            name = arguments[0];*/
            
            if( isString(args) ) {
                templates[name] = args;
                if( isFunction(args.done) ) args.done.apply(null,[ '' ]);
                return templates[name];
            } else {
                if( isFunction(args) ) args = { done: args, async: true };
                else if( !isObject(args) ) args = {};
                
                if( templates[name] ) {
                    var tmpl = $html.replaceKeys(templates[name],args.replaceKeys).i18n();
                    
                    if( isFunction(args.done) ) args.done.apply(null,[tmpl]);
                    return tmpl;
                } else {
                    $.ajax({
                        type: "GET",
                        url: '/templates/'+name+'.tmpl',
                        dataType: 'text',
                        global: false, async: !!args.async,
                        success: function(tmpl){
                            var jTmpl = $('<div>'+tmpl+'</div>');
                            jTmpl.extractTemplates();
                            templates[name] = jTmpl.html();
                            if( isFunction(args.done) ) args.done.apply(null,[ $html.replaceKeys(templates[name],args.replaceKeys).i18n() ]);
                        }
                    }).fail(function(jqXHR, textStatus, errorThrown){
                        if( isFunction(args.done) ) args.done.apply(null,[ '<div class="error">['+jqXHR.status+'] '+textStatus+'</div>' ]);
                    });
                    if( !args.async ) {
                        if( templates[name] ) return $html.replaceKeys(templates[name],args.replaceKeys).i18n();
                        else return '<div class="error">404</div>';
                    }
                }
            }
            return '';
        };
        
        this.templateLoaded = function(name) {
            if( isString(name) ) return templates[name] ? true : false;
            return false;
        }
        
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
        }
        
        var plugins = {};
        this.plugin = function(selector,run) {
            if( isString(selector) && isFunction(run) ) {
                plugins[selector] = run;
            }
        };
        
        this.runPlugins = function(jRender,args){
            Object.keys(plugins).forEach(function(selector){
                jRender.find(selector).each(function(){
                    plugins[selector].apply(this,[args]);
                });
            });
        }
        
    })();
    
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
                if( handler_name = jForm.attr('on-submit') ) {
                    jForm.find('[text-on-submit]').each(function(){
                        jElem = $(this);
                        if( jElem.prop('nodeName') == 'INPUT' )
                            jElem.data('default-text',jElem.val()).val(jElem.attr('text-on-submit')).attr('disabled','disabled').addClass('working');
                        else 
                            jElem.data('default-text',jElem.text()).text(jElem.attr('text-on-submit')).attr('disabled','disabled').addClass('working');
                    });
                    jForm.on('form.submit-end',function(){
                        jForm.find('[text-on-submit]').each(function(){
                            if( jElem.prop('nodeName') == 'INPUT' ) $(this).val(jElem.data('default-text')).removeAttr('disabled').removeClass('working');    
                            else $(this).text(jElem.data('default-text')).removeAttr('disabled').removeClass('working');
                        });
                    });
                    stopEvent(e);
                    $doc.runOn('submit',handler_name,jForm);
                }
                jForm.trigger('form.submit');
                
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
        $.post(href).done(function(data){
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
                        $(target).render(tmpl,args);
                        if( isFunction(done) ) done.apply(target);
                    }
                });
            } else $(target).render($html.template(name,{ replaceKeys: args.replaceKeys }),args);
        }
        
        return this;
    }
    
    htmlHandler.modal = function(args){
        if(!args) args = {};
        else if( isString(args) ) args = { tmpl: args };
        
        if( !htmlHandler.jModals ) {
            htmlHandler.jModals = $('<modals>');
            jBody.append(htmlHandler.jModals);
        }
        
        var jModalScreen = $('<div class="modal-screen">');
        htmlHandler.jModals.append(jModalScreen);
        if( !$(document.body).hasClass('modals-active') ) $(document.body).addClass('modals-active');
        
            var jModalBG = $('<div class="modal-bg '+( args.classBG || 'bg-black-05' )+' animated t-0_25s fadeIn">');
            jModalScreen.append(jModalBG);
            
            var jModalWrapper = $('<div class="modal-wrapper animated t-0_25s fadeInDown" ani-hide="fadeOutUp">');
            jModalScreen.append(jModalWrapper);
            
                var jModal = $('<div class="modal-box animated t-0_4s border-radius">');
                jModalWrapper.append(jModal);
                
                    var jModalHeader = $('<div class="modal-header bar-shadow"><button modal="close" type="button" class="button-close">&times;</div></div>');
                    jModal.append(jModalHeader);
                    
                    var jModalBody = $('<div class="modal-body">');
                    jModal.append(jModalBody);
        
        
        if( args.url ) {
        	jModalBody.render($html.template('loading/dark'));
            jModalBody.children().addClass('loading-2x');
        	jModalBody.renderHref(args.url,function(){
        		if( isFunction(args.ready) ) args.ready.apply(jModal.get(0),[jModal]);
        	});
        } else if( args.template ) {
            if( !$html.templateLoaded(args.template) ) {
                jModalBody.render($html.template('loading/dark'));
                jModalBody.children().addClass('loading-2x');
            }
            jModalBody.renderTemplate(args.template,{ async: true, replaceKeys: args.replaceKeys || {}, done: function(){
            	if( isFunction(args.ready) ) args.ready.apply(jModal.get(0),[jModal]);
            } });
        }
        
        jModalScreen.on('modal.close',function(){
            jModalWrapper.aniHide();
            jModalBG.aniHide(function(){
                jModalScreen.remove();
                if( !$('modals').children().length ) $(document.body).removeClass('modals-active');
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
    
})( jQuery );

$(function(){
    $doc.click('[modal-href]',function(){
        var jURL = $(this);
        
        var jModal = $html.modal({ url: jURL.attr('modal-href') });
    });
});

// ------------------------------------------------------
//      $user
// ------------------------------------------------------

(function( $ ){
    
    var user = new (function(){
        this._data = false;
        this.url = '/base/model/user.json';
        this.on = {};
        
        this.question = function(){
            return $cookies.get('question');
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
            if( arguments.length == 1 ) {
                var args = arguments[0];
                if( isFunction(args) ) { user.on.logIn = args; return true; }
            } else if( arguments.length == 3 ) {
                var args;
                if( isFunction(arguments[2]) ) args = { onSuccess: arguments[2] };
                else args = arguments[2];
                args.uname = arguments[0]; args.upass = arguments[1];
            }
            
            var answer = CryptoJS.SHA512(user.question()+CryptoJS.SHA512(args.upass).toString()).toString();
            
            var login_data = { answer: answer };
            if( args.uname ) login_data.uname = args.uname;
            if( args.email ) login_data.email = args.email;
            
            //login_data.question = user.question();
            
            return $.ajax(user.url,{
              type: 'POST',
              processData: false,
              data: JSON.stringify(login_data),
              contentType : 'application/json'
            }).done(function(data, textStatus, jqXHR){
                user._data = data;
                if( isFunction(args.onSuccess) ) args.onSuccess.apply(user,[user._data]);
                if( isFunction(args.onAlways) ) args.onAlways.apply(user,[user._data]);
                if( isFunction(user.on.logIn) ) user.on.logIn.apply(user,[user._data]);
                $(document).trigger('user.logged-in');
            }).fail(function(jqXHR, textStatus, errorThrown){
                if( isFunction(args.onError) ) args.onError.apply(user,[user._data]);
                if( isFunction(args.onAlways) ) args.onAlways.apply(user,[user._data]);
                $(document).trigger('user.logged-in-failed');
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
            }).fail(function(jqXHR, textStatus, errorThrown){
                try{ args.onError(user,[user._data]); } catch(err){}
            });
        }
        
    })();
    
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
        $(document).find('[model-name='+model.name+']').trigger('model.new',[item]);
    }); 
       
    model_event.on('updated',function(e,model,item){
        var action = model.on('updated',model.name);
        if( isFunction(action) ) actions.apply(_model(table),[item]);
        $(document).find('[model-name='+model.name+']').trigger('model.updated',[item]);
    }); 
    
    model_event.on('status',function(e,model,item){
        var action = model.on('status',model.name);
        if( isFunction(action) ) actions.apply(_model(table),[item]);
        $(document).find('[model-name='+model.name+']').trigger('model.status',[item]);
    }); 
    
    modelHandler.prototype.status = function(id,status){
    	var model = this;
    	if( isString(id) ) id = Number(id);
    	var table = model.table(), item = table.data[table.index[id]];
    	if( item ) {
	    	if( isString(status) ) {
				item.status = status;
				model_event.trigger('status',[model,item]);
	    	}
	    	return item.status;
    	}
    	return false;
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
		                url: '/data/'+model.name+'.json',
		                data: JSON.stringify({ id: id, undo: (status == 'deleted') }),
		                dataType: 'json', contentType: 'application/json'
		            }).done(function(){
		            	model.status(id,(status == 'deleted')?'':'deleted');
		            }).fail(function(){
		            	alert('wtf!!');
		            	model.status(id,'');
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
                url: '/data/'+name+'.json', async: args.async,
                dataType: 'json', contentType: 'application/json',
                success: function(json){
                	model.set(json);
                    if( args.async ) {
                        if( args.cascade ) {
                            model.loadDependencies({ async: true, done: args.done });
                        } else if( isFunction(args.done) ) args.done.apply(model,[core_models[name]]);
                    }
                }
            });
            console.log('loaded '+name+'.json');
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
        
        args.async = (args.async == undefined) ? (isFunction(args.done)?true:false) : args.async;
        
        if( args.mode == 'full' ) {
            var full_json = true;
            $.ajax({
                type: "GET",
                url: '/data/'+model.name+'.json?mode=full', async: args.async,
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
                    if( isFunction(args.done) ) {
                        args.done.apply(model,[model.parsedData(index)]);
                    }
                }, async: true
            });
            return true;
        } else {
        	model.table();
            fixIndex();
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
            args = { done: arguments[0] };
            if( isFunction(arguments[1]) ) args.fail = arguments[1];
        } else if( isObject(arguments[0]) ) args = arguments[0];
        
        return this._get(index,args);
    };
    
    modelHandler.prototype.save = function(model_data,args){
    	var model = this;
        if( isFunction(args) ) args = { done: args };
        else if( !isObject(args) ) args = {};
        
        var jqXHR = $.ajax({
            type: 'POST',
            url: '/data/'+model.name+'.json',
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
            		//console.log('item added '+JSON.stringify(response));
            	    var pos = table.length;
            	    table.data.push(response.data);
            	    table.index[parseInt(response.data.id)] = pos;
            	    table.list.push(parseInt(response.data.id));
            	    
            	    model_event.trigger('new',[model,response.data]);
            	}
            	
            	if( isFunction(args.done) ) args.done.apply(model,[response]);
            }
        });
        return jqXHR;
    }
    
    _model = function(name){ return new modelHandler(name); }
    
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
        	if( core_models[selectors] && !args.reload ) {
        		if( isFunction(args.done) ) args.done.apply(model,[core_models[selectors]]);
        		return core_models[selectors];
        	} else {
		        var full_json = true;
		        $.ajax({
		            type: "GET",
		            url: '/data/'+selectors+'.json?mode=require',
		            dataType: 'json',
		            global: false, async: !!isFunction(args.done),
		            success: function(json){
		                full_json = json;
		                if( isObject(json.data) ) {
		                	Object.keys(json.data).forEach(function(name){
		                		_model(name).set(json.data[name]);
		                	});
		                }
		                if( isFunction(args.done) ) args.done.apply(model,[json]);
		            }
		        });
		        return full_json;
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
        
        if( match = cmd[0].match(/([\.\-\_\w]+)\sin\s([\-\_\.\w]+)/) ) {
        	var items_path = match[2].split('.'), path_step;
            var model = $model(items_path.shift());
            var item_name = match[1];
            
            model.get(function(items){
            	items.forEach(function(model_item){
            		var item = model_item;
            		item_path = items_path.clone();
	            	while( path_step = item_path.shift() ) {
	            		if( item[path_step] ) item = item[path_step];
	            		else return false;
	            	}
            		
                    var keys = {};
                    keys[item_name] = item;
                    jRow[item.id] = $(template.replaceKeys(keys,{ clean: true }).i18n()).attr('model-item',model.name+'/'+item.id);
                    if( item.status != undefined ) jRow[item.id].attr('model-status',item.status);
                    jParent.append(jRow[item.id]);
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
            });
        }
    });
    
    $doc.click('[model-action]',function(){
        var jClicked = $(this), action = jClicked.attr('model-action'), match;
        var patt = /^\s*(([\-\_\w]+)(\/([\-\_\w]+))?\.)?([\-\_\w]+)\s*$/;
        
        //  match[0] ( original expression ),   match[1] ( model/id ), match[2] ( model name ), match[3] ( noise -consecuence of optional model/id- )
        //  match[4] ( id ), match[5] ( action name )
        
        if( match = action.match(patt) ) {
            var action_name = match[5], model_name = match[2], model_id = match[4];
            
            if( action_name ) {
                if( !model_name ) {
                    if( jClicked.attr('model-name') ) model_name = jClicked.attr('model-name');
                    else if( jClicked.attr('model-item') || jClicked.data('model-item') ) {
                        //console.log('model-item attr:'+jClicked.attr('model-item')+', data:'+jClicked.data('model-item'));
                        
                        var model_item;
                        if( model_item = ( jClicked.attr('model-item') || jClicked.data('model-item') ).match(/^\s*([\-\_\w]+)(\/([\-\_\w]+))\s*$/) ) {
                            if( model_item[1] ) model_name = model_item[1];
                            if( model_item[3] ) model_id = model_item[3];
                        }
                    } else {
                        var jTmp = jClicked;
                        while( jTmp.length ) {
                            if( jTmp.attr('model-item') || jTmp.data('model-item') ) {
                                //console.log('model-item attr:'+jTmp.attr('model-item')+', data:'+jTmp.data('model-item'));
                                var model_item;
                                if( model_item = ( jTmp.attr('model-item') || jTmp.data('model-item') ).match(/^\s*([\-\_\w]+)(\/([\-\_\w]+))\s*$/) ) {
                                    if( model_item[1] ) model_name = model_item[1];
                                    if( model_item[3] ) model_id = model_item[3];
                                }
                            }
                            jTmp = jTmp.parent();
                        }
                    }
                }
                
                if( model_name ) {
                    //console.log('action: '+action_name+', model: '+model_name+', id: '+model_id)
                    $model(model_name).action(action_name,[model_id]);
                }
            }
        }
    });
    
});

// ------------------------------------------------------
//      $gears
// ------------------------------------------------------

(function( $ ){
    var gearsHandler = new (function(){
        var gears = this;
        
        this.list = {};
        
        this.get = function(name){
            if( !gears[name] ) {
                $.ajax({
                    type: "GET",
                    url: '/gears/'+name+'.gear',
                    dataType: 'text',
                    global: false, async: false
                }).done(function(gear){
                    try{ eval('gears[name] = new (function(){'+gear+'})();'); }
                    catch(err) { console.log('error parsing '+name+'.gear\n'+err.message); }
                });
            }
            return gears[name];
        }
        
        this.run = function(name){
            var gear = gears.get(name);
            if(gear) {
                if( isFunction(gear.run) ) gear.run.apply(gear);
            } else console.log('[warning] gear not foud: '+name);
        }
        
    });
    
    window.$gears = gearsHandler;
    
})( jQuery );

    // HTML PLUGIN

    $html.plugin('[run-gear]',function(){
        $gears.run($(this).attr('run-gear'));
        console.log('[run-gear='+$(this).attr('run-gear')+']');
    });

// ------------------------------------------------------
//      $doc
// ------------------------------------------------------

(function( $ ){

    var appHandler = new (function(){
        var app = this;
        
        this.fn = {};
        this.runFn = function(name) {
            if( isFunction(app.fn[name]) ) app.fn[name]();
        };
        this.setFn = function(name,action) {
            if( isString(name) && isFunction(action) ) app.fn[name] = action;
        };
        
        this.on = {};
        
        this.runOn = function(event,name,jCaller,args) {
            if( !args ) args = [];
            if( isString(event) && app.on[event]) {
                if( isFunction(app.on[event][name]) ) app.on[event][name].apply(jCaller.get(0),args);
            }
        };
        this.on = function(event,name,action) {
            if( isString(event) && isString(name) && isFunction(action) ) {
                if( !isObject(app.on[event]) ) app.on[event] = {};
                app.on[event][name] = action;
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
        
        
        this.onhashchange = {};
        this.onhashchange['default'] = function(){};
        
        this.hashChange = function(e) {
            if(arguments.length) {
                var arg0 = arguments[0];
                if( /event/.test(varType(arg0)) ) {
                    app.onhashchange['default'].apply(arg0);
                    //console.log('new hash: '+location.hash);
                    if( app.onhashchange[app.view] ) {
                        app.onhashchange[app.view].apply(arg0);
                    }
                } else switch(varType(arg0)) {
                    case 'function':
                        app.onhashchange['default'] = arg0;
                        break;
                    case 'string':
                        var arg1;
                        if( arg1 = arguments[1] ) {
                            if( isFunction(arg1) ) app.onhashchange[arg0] = arg1;
                        }
                        break;
                }
            }
        }
        
        this.onchangestate = function(){}
        
        this.changeState = function(href,args){
            if( arguments.length == 1 ) {
                if( isFunction(arguments[0]) ) app.onchangestate = arguments[0];
            } else if( isString(href) ) {
                if(!args) args = {};
                if( isString(args.target_id) && $(args.target_id) ) {
                    $(args.target_id).addClass('loading');
                    if(history.pushState) {
                        $('modals').children().trigger('modal.close');
                        $.ajax({ type: "POST", url: href, dataType: 'text', processData: false }).always(function(jqXHR,textStatus,errorThrown){
                            if( textStatus == 'success' ) {
                                var state = { html: jqXHR, view_type: args.view_type, title: args.title || (document.title || ''), href: href, target_id: args.target_id };
                            } else {
                            	if( Number(jqXHR.status) == 403 ) {
                            		args.view_type = 'user';
                            		//$user.status();
                            		$(document.body).attr('user-logged',false);
                            	} else args.view_type = jqXHR.status;
                                var state = { html: jqXHR.responseText, view_type: args.view_type, title: args.title || (document.title || ''), href: href, target_id: args.target_id };
                            }
                            history.pushState(state,document.title,href);
                            $(args.target_id).removeClass('loading');
                            try{
                                var event = triggerEvent(args.element || window,'popstate',{ state: state });
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
                    if( !isArray(app.viewHandler[view_name]) ) app.viewHandler[view_name] = [];
                    app.viewHandler[view_name].push(action);
                }
            }
        }
        $(document).on('view.change',function(view){
            if( isArray(app.viewHandler[view.name]) ) {
                app.viewHandler[view.name].forEach(function(action){
                   if( isFunction(action) ) action.apply(view);
                });
            }
        });
        
        this.stateChanged = function(e){
            if( isFunction(e) ) app.onchangestate = e;
            else {
                if( !app.current_pathname || app.current_pathname != location.pathname ) {
                    var state;
                    if( state = e.state ) {
                        app.view = location.pathname.split('/')[1];
                        if(state.target_id) {
                            if(state.html) {
                                $(state.target_id).render(state.html);
                                $(document.body).attr('current-view',app.view);
                                $(document.body).attr('view-type',state.view_type);
                            } else $(state.target_id).renderHref(state.href,function(){
                                $(document.body).attr('current-view',app.view);
                                $(document.body).attr('view-type',state.view_type);
                            });
                            $(document).trigger('view.change',[{ name: app.view, type: state.view_type }]);
                        }
                        app.onchangestate.call(state,e);
                    } else {
                        if(app.first_run) location.reload();
                        app.first_run = true;
                    }
                }
                app.current_pathname = location.pathname;
            }
        }
        app.view = location.pathname.split('/')[1];
        
        this._i18n = {};
        this._i18n['default'] = {};
        
        this.i18n = function(env){
            var params = '';
            if( isString(env) ) params = '?env='+env;
            else env = 'default';
            $.ajax({
                type: "GET",
                url: '/base/model/i18n.json'+params,
                dataType: 'text',
                global: false, async: false,
                success: function(data){ app._i18n[env] = $.parseJSON(data); }
            });
            return app._i18n[env] || {};
        }
        
    })();
    
    window.$doc = appHandler;
    
    window.onhashchange = $doc.hashChange;
    window.onpopstate = $doc.stateChanged;

})( jQuery );

// ------------------------------------------------------
//      DOC READY
// ------------------------------------------------------

$(document).ready(function(){
    var jDoc = $(this);
    
    jDoc.click(function(e){
        var jClicked = $(e.target), aux;
        
        while( jClicked.length ) {
            if( aux = jClicked.attr('on-click') ) $doc.runOn('click',aux,jClicked);
            
            if( href = jClicked.attr('href') ) {
                
                if( view_type = jClicked.attr('view-type') ) {
                    var target_id = jClicked.attr('view-target') || '#main';
                    if( $(target_id).length && history.pushState ) {
                        if( !/#/.test(href) || href.split('#')[0] != location.pathname.split('#')[0] ) {
                            stopEvent(e);
                            $doc.changeState(href,{ view_type: view_type, target_id: target_id, element: jClicked.get(0) });
                        }
                    }
                    break;
                }
                if( target = jClicked.attr('href-target') ) {
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
    
    console.log('jQ.enhanced!');
    $(document.body).initDOM();
    $(document).trigger('powered');
});



// ------------------------------------------------------
//      GENERAL HTML PLUGINS
// ------------------------------------------------------

    $html.plugin('.widget-slider',function(){
        var jSlider = $(this), jPrevious;
        var jSlides = jSlider.children();
        var num = jSlides.length;
        
        function playFrame(index) {
            jPrevious = jSlides.filter('.active');
            jPrevious.filter('[any-hide]').aniHide();
            jPrevious.removeClass('active').addClass('hidding');
            jSlides.eq(index).addClass('active').aniShow(function(){ jPrevious.removeClass('hidding'); });
            
            setTimeout(function(){
                nextSlide();
            }, Number(jSlides.eq(index).attr('slide-duration')) || Number(jSlider.attr('slide-duration')) || 2000 );
        }
        
        function ondemandImg(jSlide,callback){
            if( !jSlide.find('img[on-demand]').each(function(){
                var img = this;
                img.src = img.getAttribute('on-demand');
                img.removeAttribute('on-demand');
                img.onload = callback;
                /*imgCache(img.getAttribute('on-demand'),function(){
                    img.src = img.getAttribute('on-demand');
                    //img.onload = callback;
                    if( isFunction(callback) ) callback.apply(img);
                });*/
                
                /*var jImg = $(this);
                console.log('on-demand: '+this.getAttribute('on-demand'));
                var img = this.cloneNode();
                img.src = this.getAttribute('on-demand');
                img.removeAttribute('on-demand');
                img.onload = function(){
                    console.log('loaded: '+img.src);
                    jImg.replaceWith(this);
                    if( isFunction(callback) ) callback.apply(img);
                }*/
            }).length && isFunction(callback) ) callback.apply(jSlide.get(0));
        }
        
        function nextSlide() {
            var index = jSlides.filter('.active').index() + 1;
            if( index >= num ) index = 0;
            else if( index < 0 ) index = num;
            
            var jSlide = jSlides.eq(index);
            
            if( $(document).contains(jSlider) ) {
                console.log('nextSlide: '+index+' ('+( Number(jSlides.eq(index).attr('slide-duration')) || Number(jSlider.attr('slide-duration')) || 2000 )+')');
                ondemandImg(jSlide,function(){ playFrame(index); });
            }
            
            /*if( !jSlide.find('img[on-demand]').each(function(){
                var jImg = $(this);
                console.log('on-demand: '+this.getAttribute('on-demand'));
                var img = this.cloneNode();
                img.src = this.getAttribute('on-demand');
                img.removeAttribute('on-demand');
                img.onload = function(){
                    console.log('loaded: '+img.src);
                    jImg.replaceWith(this);
                    playFrame(index);
                }
            }).length ) playFrame(index);*/
        }
        $(document).ready(function(){
            jSlides.addClass('hide');
            ondemandImg(jSlides.filter('.active').removeClass('hide'),function(){
                $(this).aniShow();
                setTimeout(nextSlide, Number(jSlides.filter('.active').attr('slide-duration')) || Number(jSlider.attr('slide-duration')) || 2000 );
            });
        });
    });
    
    $doc.click('[active-list]',function(e){
        var jList = $(this), jClicked = $(e.target);
        var mode = jList.attr('active-list');
        
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
    
    $html.plugin('ul[select-name]',function(){
    	var jSelect = $(this),
			jUlLi = jSelect.children('li'),
			jLabel = jUlLi.children('a'),
			jUL = jUlLi.children('ul'),
			mode = jUL.attr('active-children'),
			jInput = $('<input type="hidden" name="'+jSelect.attr('select-name')+'"></input>'),
			jOptions = jUL.children('[select-value]').not('[select-value=]'),
			jAll = jUL.children('[select-value=]');
			
			jSelect.append(jInput);
			jAll.attr('text-label',jLabel.text());
			
			jUL.on('change',function(e,jActive){
				e.stopPropagation();
				jSelect.trigger('change',[jActive.attr('select-value')]);
			});
			
			jSelect.on('change',function(e,value){
				jInput.val(value);
				jSelect.attr('selected-value',value);
				var jActive = jUL.children('.active');
				var label = jActive.attr('text-label') || jActive.text();
				jLabel.text(label);
			});
			
			if( jSelect.attr('filter-by') ) {
				var jFilter = $('ul[select-name='+jSelect.attr('filter-by')+']');
				jFilter.on('change',function(e,value){
					jOptions.remove();
					//console.log('[option-filter='+value+']');
					if( value ) jUL.append(jOptions.filter('[option-filter='+value+']'));
					else {
						var found = {};
						jFilter.find('[select-value]').each(function(){ found[this.getAttribute('select-value')] = true; });
						//console.log('found: '+Object.keys(found));
						
						jOptions.each(function(){ if( found[this.getAttribute('option-filter')] ) jUL.append(this); });
					}
					
					if( jUL.children('.active').length ) jUL.trigger('change',[jUL.children('.active')]);
					else {
						jOptions.removeClass('active');
						jUl.trigger('change',[jAll.addClass('active')]);
					} 
					//console.log( jSelect.attr('select-name')+' :: '+jFilter.attr('select-name')+' = '+value );
					//jSelect.trigger('change',value);
				});
			}
    });
    
    // LISTS
    
    /*$html.plugin('[make-list]',function(){
        var jList = $(this);
        var nodeName = this.nodeName.toLowerCase();
        
        var options = jList.attr('make-list').split(',');
        options.forEach(function(option){
            option = option.trim();
            if( option == 'selectable' ) {
                if( !jList.hasClass('selectable-rows') ) jList.addClass('selectable-rows');
                jList.attr('click-list',true);
            } else if( option == 'sortable' ) {
                if( !jList.hasClass('sortable-rows') ) jList.addClass('sortable-rows');
                jList.attr('click-list',true);
            }
        });
    });
    
    $doc.click('[click-list]',function(e){
        var jList = $(this), jClicked = $(e.target), jBase, row_selector, aux;
        var nodeName = this.nodeName.toLowerCase();
        var multiple = jList.data('multiple');
        
        if( nodeName == 'table' ) {
            jBase = jList.children('tbody');
            row_selector = 'tr';
        } else {
            jBase = jList;
            if( nodeName == 'ul' || nodeName == 'ol' ) row_selector = 'li';
            else row_selector = '.row';
        }
        
        while( jClicked.length ) {
            if( jClicked.filter(row_selector).length ) {
                if( jBase.contains(jClicked) ) {
                    if( jList.hasClass('selectable-rows') ) {
                        if( jClicked.hasClass('active') ) jClicked.removeClass('active');
                        else {
                            if( !multiple ) jBase.children().removeClass('active');
                            jClicked.addClass('active');
                        }
                        jList.trigger('select',[jClicked,jBase]);
                    }
                    if( aux = jList.attr('on-select') ) {
                        $doc.runOn('select',aux,jClicked,[jBase]);
                    }
                }
                
                jClicked = $();
            } else if( jClicked.is(jBase) ) jClicked = $();
            else jClicked = jClicked.parent();
        }
    });*/
    
    $doc.click('label',function(e){
        $(this).next('input').focus();
        $(this).next('select').focus();
        $(this).next('textarea').focus();
    });
    
    $html.plugin('select',function(){
        var jSelect = $(this), value;
        jSelect.val(jSelect.children(':first').val()); 
        if( value = jSelect.attr('selected-value') ) jSelect.val(value);
    });
    
    $html.plugin('.btn-img',function(){
        var jButton = $(this), jIMG;
        var jInput = jButton.find('input[type=file]');
        
        if( jInput.length != 1 ) {
            var jInput = $('<input type="file" name="'+jButton.attr('name')+'" accept="image/*"></input>');
            jInput.data('id',jButton.data('id'));
            jButton.after(jInput);
            jButton.data('id','');
        }
            
        var jInputReal = $('<input type="hidden" name="'+jInput.attr('name')+'"></input>');
        jInput.get(0).removeAttribute('name');
        jButton.append(jInputReal);
        
        var imgSrc = jButton.attr('img-src');
        
        if( jButton.find('.img-src').length ) {
            jIMG = jButton.find('.img-src');
        } else if( imgSrc ) {
            jIMG = $('<div class="img-src"></div>');
            jButton.prepend(jIMG);
            jIMG.css('background-image','url('+imgSrc+')');
        } else {
            jIMG = jButton.attr('img-preview') ? $(jButton.attr('img-preview')) : jButton.find('img');
            
            if( jIMG.length == 1 ) {
                
                if(!jIMG.data('empty'))
                    jIMG.data('empty','data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
                
                if( !jIMG.attr('src') || jIMG.attr('src') == '' ) jIMG.attr('src',jIMG.data('empty'));
            } else jIMG = false;
            
        }
        
        (function addXhrProgressEvent($) {
            var originalXhr = $.ajaxSettings.xhr;
            $.ajaxSetup({
                xhr: function() {
                    var req = originalXhr(), that = this;
                    if (req) {
                        if (typeof req.addEventListener == "function" && that.progress !== undefined) {
                            req.addEventListener("progress", that.progress, false);
                            req.upload.addEventListener("progress", that.progress, false);
                        }
                    }
                    return req;
                }
            });
        })(jQuery);
        
        jInput.on('progress',function(e,progress){
            if (progress.lengthComputable) {
                var percentComplete = progress.loaded / progress.total;
                //Do something with upload progress
                console.log(percentComplete);
            }
        });
        
        jInput.change(function(e){
            var theFile = e.target.files[0];
            var data = new FormData();
            data.append('file',theFile);
            
            jButton.addClass('loading');
            var jqXHR = $.ajax({
                type: 'POST',
                url: jInput.attr('url-upload') || '/data/images.json',
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                success: function(data){
                    if( data ) {
                        if( data.success ) {
                            jInputReal.val(data.image);
                            if( jIMG ) {
                                var fileReader = new FileReader();
                                fileReader.onload = function(event){
                                    if( jIMG.prop('nodeName') == 'IMG' ) jIMG.attr('src',event.target.result);
                                    else jIMG.css('background-image','url('+event.target.result+')');
                                };
                                fileReader.readAsDataURL(theFile);
                            }
                        }
                    } else console.log('[error] /data/images.json\n'+data);
                }, progress: function(evt) { jInput.trigger('progress',[evt]); }
            }).always(function(){ jButton.removeClass('loading'); });
        });
    });
