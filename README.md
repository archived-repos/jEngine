jEngine
=======

>	jEngine - A Powerful javascript framework to build your website or application.

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


##### i18n

	backend dependencie
	
	
##### $script

	string script example:
	
	'some text $if{hola}text if true${else}text if false${/}, some text $if{!hola}text if true${else}text if false${/} $each{tasks}[tarea: ${.}, ${../hola.caracola}]${/} ${hola.caracola}'
	
	