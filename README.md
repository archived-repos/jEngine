jEngine
=======

>	jEngine - A Powerful javascript framework to build your website/application.

>	Copyright (C) 2014  Jesús Manuel Germade Castiñeiras

>	This program is free software: you can redistribute it and/or modify
>	it under the terms of the GNU General Public License as published by
>	the Free Software Foundation, either version 3 of the License.

=======


##### BASICS (Underscore)

    _.stopEvent(e)    preventDefault() alias
	
    _.triggerEvent(element,event_name,data)
    
    _.varType(obj)
    
    _.isObject(obj,type|['any'])
    
    _.isArray(obj)
    
    _.isString(obj)
    
    _.isFunction(obj)
    
    _.isNumber(obj)
    
    
    
    _.key(obj,selector,value?)
    
    _.keys(obj)
    
    
    _.sortBy(list,selector1,selector2)
    
    
    _.clone(obj)
    
    
    
##### $ajax

	$ajax('some/url').get();
	
	               " .post(obj);
	               
	               " .put(obj);
	               
	               " .patch(obj);
	               
	               " .delete(obj);


##### $i18n

	backend dependencies
	
	
##### $script

	template script example:
	
		var template_script = $script('$if{list}list items: $for{item in list}[${item}]${/}${else}nothing to show${/}');
		
		result = template_script.render({ list: [ 'item1', 'item2' ] });
		
		> 'list items: [item1][item2]'
	
	or just ( using String.render() )
	
		'$if{list}list items: $for{item in list}[${item}]${/}${else}nothing to show${/}'.render({ list: [ 'item1', 'item2' ] });
		
		
##### String.prototype

	'some text'.capitalize()      >  'Some text'
	'some text'.capitalize(true)  >  'Some Text'
	
	'17/04/2014'.toDate()         >  Date (Thu Apr 17 2014 00:00:00 GMT+0200 -Hora de verano romance-)
	
	
##### $dom

	$dom is a DOM query (jQuery $ like)
	
	$dom('#css.selector'|HTMLElement|NodeList)
		
		returns a collection of DOM Elements in a Array object with following methods:
			
			[].get()
			[].find('#css.selector')
			[].filter('#css.selector')
			[].children('[css].selector')
			[].data(value?)
			[].attr(value?)
			[].addClass('class')
			[].removeClass('class')
			[].hasClass('class')
			[].parent()
			[].render()		//  like jQuery.html()
			[].on(event,handler)
			[].off(event)
			[].trigger(data)
			
##### $html
	
	$html.template(template_name,template_string)
	
	$html.plugin('#css.selector',initializer)

	$html.modal({
		? template: '<div>some template</div>' | $html.template('template/name')
		? model: { crash: { test: 'dummy' } }
	})
		
	
	
	