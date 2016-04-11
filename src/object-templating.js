/*global module, define*/
(function (name, definition) {
	if(typeof module != 'undefined' && module.exports) {
		module.exports = definition();
	}
	else if(typeof define == 'function' && define.amd) {
		define(definition);
	}
	else {
		this[name] = definition();
	}
})('ObjectTemplating', function() {
	var Utils = {
		forEach: function(obj, callback) {
			if(Utils.isNumeric(obj.length)) {
				for(var i = 0; i < obj.length && callback(obj[i], i) !== false; i++);
			}
			else {
				for(var name in obj) {
					if(
						obj.hasOwnProperty(name) &&
						callback(obj[name], name) === false
					) {
						break;
					}
				}
			}
		},
		isNumeric: function(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		},
		isArray: function(obj) {
			return Object.prototype.toString.call(obj) === '[object Array]';
		},
		isFunction: function(f) {
			return typeof f == 'function';
		},
		convertToValue: function(str) {
			var value;
			// number
			if(Utils.isNumeric(str)) {
				value = Number(str);
			}
			// array
			else if(
				str.substring(0, 1) == '[' &&
				str.substring(str.length - 1) == ']'
			) {
				var arrayOfStrings = str.substring(1, str.length - 1).split(/, ?/);
				value = [];
				for(var i = 0; i < arrayOfStrings.length; i++) {
					value.push(Utils.convertToValue(arrayOfStrings[i]));
				}
			}
			// boolean
			else if(str == 'true' || str == 'false') {
				value = str == 'true';
			}
			// string
			else {
				value = str;
			}
			return value;
		}
	};
	var split = function(path) {
		if(path.substring(0, 1) == '>') {
			return ['>', path.substring(1)];
		}
		else {
			return path.replace(/\[\]/g, '.[]').split('.');
		}
	};
	var join = function(path) {
		return path.join('.').replace(/\.\[\]/g, '[]');
	};
	var get = function(obj, path) {
		path = path.slice();
		var key = path.shift(),
			result = null;

		if(key == '>') {
			result = Utils.convertToValue(path[0]);
		}
		else if(key == '[]') {
			result = [];
			if(path.length === 0) {
				Utils.forEach(obj, function(each) {
					result.push(each);
				});
			}
			else {
				Utils.forEach(obj, function(each) {
					result.push(get(each, path));
				});
			}
		}
		else {
			var next = obj[key];
			if(next) {
				if(path.length === 0) {
					result = next;
				}
				else {
					result = get(next, path);
				}
			}
		}
		return result;
	};
	var add = function(obj, data, path, func) {
		path = path.slice();
		var key = path.shift(),
			isCollection = path[0] == '[]' ? !!path.shift() : false;

		if(!obj[key]) {
			if(isCollection) {
				obj[key] = [];
			}
			else {
				obj[key] = {};
			}
		}

		if(path.length === 0) {
			var value = isCollection ? data.slice() : data;
			if(Utils.isFunction(func)) {
				value = func(value);
			}
			obj[key] = value;
		}
		else if(isCollection) {
			if(Utils.isArray(data)) {
				Utils.forEach(data, function(value, i) {
					if(!obj[key][i]) {
						obj[key][i] = {};
					}
					add(obj[key][i], value, path, func);
				});
			}
			else {
				Utils.forEach(obj[key], function(value, i) {
					add(obj[key][i], data, path, func);
				});
			}
		}
		else {
			add(obj[key], data, path, func);
		}
	};
	return {
		/**
		 * Creates a new object that will have a
		 * structure defined by a template
		 * and will be filled with the specified data
		 * @param   {object}    data         	Object data source
		 * @param   {object}    template     	Object template that describes
		 *                                 		 	the new object structure
		 * @param   {function=} failCallback 	Function to be called when the
		 *                                   	  	expected data is not present
		 * @returns {object}    				The resulting object
		 */
		create: function(data, template, failCallback) {
			var result = {};
			Utils.forEach(template, function(source, dest) {
				var func = null;
				if(Utils.isArray(source)) {
					func = source[1];
					source = source[0];
				}
				var value = get(data, split(source));
				if(value) {
					add(result, value, split(dest), func);
				}
				else if(typeof failCallback == 'function') {
					failCallback(source, dest);
				}
			});
			return result;
		}
	};
});
