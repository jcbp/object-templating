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
		isObjectLike: function(value) {
			return !!value && typeof value == 'object';
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
	var helpers = {};
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
	var set = function(obj, data, path, helper) {
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
			if(helper) {
				value = helper(value);
			}
			obj[key] = value;
		}
		else if(isCollection) {
			if(Utils.isArray(data)) {
				Utils.forEach(data, function(value, i) {
					if(!obj[key][i]) {
						obj[key][i] = {};
					}
					set(obj[key][i], value, path, helper);
				});
			}
			else {
				Utils.forEach(obj[key], function(value, i) {
					set(obj[key][i], data, path, helper);
				});
			}
		}
		else {
			set(obj[key], data, path, helper);
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
				var helper = null;
				if(Utils.isObjectLike(source)) {
					helper = Utils.isFunction(helpers[source.helper]) ?
						helpers[source.helper] :
						null;
					source = source.path;
				}
				var value = get(data, split(source));
				if(value) {
					set(result, value, split(dest), helper);
				}
				else if(typeof failCallback == 'function') {
					failCallback(source, dest);
				}
			});
			return result;
		},
		registerHelper: function(name, helper) {
			helpers[name] = helper;
		}
	};
});
