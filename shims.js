"use strict";

// Shims for some new standard functions:
(function () {
	var shim = function (obj, shims) {
		for (var name in shims) {
			if (!(name in obj)) {
				obj[name] = shims[name];
			}
		}
	};

	shim(String.prototype, {
		trim: function () {
			return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		},
		trimLeft: function () {
			return this.replace(/^\s\s*/, '');
		},
		trimRight: function () {
			return this.replace(/\s\s*$/, '');
		}
	});

	shim(Array, {
		isArray: function (object) {
			return Object.prototype.toString.call(object) === '[object Array]';
		}
	});

	shim(Array.prototype, {
		indexOf: function (searchElement, fromIndex) {
			if (!fromIndex || fromIndex < 0) fromIndex = 0;
			for (; fromIndex < this.length; ++ fromIndex) {
				if (this[fromIndex] === searchElement) {
					return fromIndex;
				}
			}
			return -1;
		},
		forEach: function (f) {
			for (var i = 0; i < this.length; ++ i) {
				f(this[i],i,this);
			}
		}
	});

	shim(Function.prototype, {
		bind: function (self) {
			var funct   = this;
			var partial = Array.prototype.slice.call(arguments,1);
			return function () {
				return funct.apply(self,partial.concat(Array.prototype.slice.call(arguments)));
			};
		}
	});

	shim(Date, {
		now: function () {
			return new Date().getTime();
		}
	});

	// dummy console object to prevent crashes on forgotten debug messages:
	if (typeof(console) === "undefined")
		shim(window, {console: {}});
	shim(window.console, {log: function () {}});
	shim(window.console, {
		info:  window.console.log,
		warn:  window.console.log,
		error: window.console.log,
		trace: window.console.log,
		dir:   window.console.log
	});
})();
