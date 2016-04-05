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
					if(obj.hasOwnProperty(name) && callback(obj[name], name) === false) {
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
		}
	};
	var split = function(path) {
		return path.replace(/\[\]/g, '.[]').split('.');
	};
	var join = function(path) {
		return path.join('.').replace(/\.\[\]/g, '[]');
	};
	var get = function(obj, path) {
		path = path.slice();
		var key = path.shift(),
			result = null;

		if(key == '[]') {
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
	var add = function(obj, data, path) {
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
			if(isCollection) {
				obj[key] = data.slice();
			}
			else {
				obj[key] = data;
			}
		}
		else if(isCollection) {
			if(Utils.isArray(data)) {
				Utils.forEach(data, function(value, i) {
					if(!obj[key][i]) {
						obj[key][i] = {};
					}
					add(obj[key][i], value, path);
				});
			}
			else {
				Utils.forEach(obj[key], function(value, i) {
					add(obj[key][i], data, path);
				});
			}
		}
		else {
			add(obj[key], data, path);
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
			var root = {};
			Utils.forEach(template, function(origin, dest) {
				var node = get(data, split(origin));
				if(node) {
					add(root, node, split(dest));
				}
				else if(typeof failCallback == 'function') {
					failCallback(origin, dest);
				}
			});
			return root;
		}
	};
});
