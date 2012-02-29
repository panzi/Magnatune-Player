/**
 * Copyright (C) 2012  Mathias Panzenböck
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

"use strict";

$.fx.interval = 40;
$.format = function (fmt, args) {
	if (!args) args = {};
	var index = 0;
	return fmt.replace(/\{[^\{\}]*\}|\{\{|\}\}|\{|\}/g, function (found) {
		switch (found) {
			case '{{': return '{';
			case '}}': return '}';
			case '{': throw new SyntaxError("Single '{' encountered in format string");
			case '}': throw new SyntaxError("Single '}' encountered in format string");
			default:
				var key = found.slice(1,found.length-1);
				if (!key) {
					key = index ++;
				}
				if (key in args) {
					return String(args[key]);
				}
				else {
					throw new ReferenceError(key+" is not defined");
				}
		}
	});
};

// inspired by:
// http://farhadi.ir/posts/utf8-in-javascript-with-a-new-trick
$.base64Encode = function (input) {
	return btoa(unescape(encodeURIComponent(input)));
};
$.base64Decode = function (input) {
	return decodeURIComponent(escape(atob(input)));
};

(function ($, undefined) {
	var dom_parser = false;

	// based on: https://developer.mozilla.org/en/DOMParser
	// does not work with IE < 9
	// Firefox/Opera/IE throw errors on unsupported types
	try {
		// WebKit returns null on unsupported types
		if ((new DOMParser()).parseFromString("", "text/html")) {
			// text/html parsing is natively supported
			dom_parser = true;
		}
	} catch (ex) {}

	if (dom_parser) {
		$.parseHTML = function (html) {
			return new DOMParser().parseFromString(html, "text/html");
		};
	}
	else if (document.implementation && document.implementation.createHTMLDocument) {
		$.parseHTML = function (html) {
			var doc = document.implementation.createHTMLDocument("");
			var doc_el = doc.documentElement;

			doc_el.innerHTML = html;

			var els = [], el = doc_el.firstChild;

			while (el) {
				if (el.nodeType === 1) els.push(el);
				el = el.nextSibling;
			}

  			// are we dealing with an entire document or a fragment?
			if (els.length === 1 && els[0].nodeName === "HTML") {
				doc.removeChild(doc_el);
				el = doc_el.firstChild;
				while (el) {
					var next = el.nextSibling;
					doc.appendChild(el);
					el = next;
				}
			}
			else {
				el = doc_el.firstChild;
				while (el) {
					var next = el.nextSibling;
					if (el.nodeType !== 1 && el.nodeType !== 3) doc.insertBefore(el,doc_el);
					el = next;
				}
			}

			return doc;
		};
	}
})(jQuery);

var tag = (function ($,undefined) {
	var add = function (element, arg) {
		var type = typeof(arg);
		if (type === "function") arg = arg(element);
		if (arg === null || type === "undefined") return;
		if (type === "string") {
			element.appendChild(document.createTextNode(arg));
		}
		else if (Array.isArray(arg) || arg instanceof $) {
			for (var i = 0, n = arg.length; i < n; ++ i) {
				add(element, arg[i]);
			}
		}
		else if (arg.nodeType === 1 || arg.nodeType === 3) {
			element.appendChild(arg);
		}
		else if (type === "object") {
			for (var attr in arg) {
				var value = arg[attr];
				if (attr === "class" || attr === "className") {
					if (Array.isArray(value)) {
						value = ' '.join(value);
					}
					else {
						value = String(value);
					}
					$(element).addClass(value);
				}
				else if (attr === "for" || attr === "htmlFor") {
					element.htmlFor = String(value);
				}
				else if (attr === "dataset") {
					$(element).dataset(value);
				}
				else if (/^on/.test(attr)) {
					if (typeof(value) !== "function") {
						value = new Function("event",
							'if ((function (event) {\n'+value+
							'\n}).call(this,event) === false) { event.preventDefault(); }');
					}
					$(element).on(attr.replace(/^on/,""), value);
				}
				else if (attr === 'style' || attr === 'css') {
					if (typeof(value) === "object") {
						$(element).css(value);
					}
					else {
						element.style.cssText += ";"+value;
					}
				}
				else if (attr === 'value' && element.nodeName === 'TEXTAREA') {
					element.value = value;
				}
				else if (value === true) {
					element.setAttribute(attr,attr === 'draggable' ? 'true' : attr === 'autocomplete' ? 'on' : attr);
				}
				else if (value === false) {
					if (attr === 'draggable') {
						element.setAttribute(attr,'false');
					}
					else if (attr === 'autocomplete') {
						element.setAttribute(attr,'off');
					}
					else {
						element.removeAttribute(attr);
					}
				}
				else {
					element.setAttribute(attr,String(value));
				}
			}
		}
		else {
			// Number or Boolean
			element.appendChild(document.createTextNode(String(arg)));
		}
	};

	var tag = function (name) {
		var element = document.createElement(name);
		for (var i = 1, n = arguments.length; i < n; ++ i) {
			add(element, arguments[i]);
		}
		return element;
	};

	// TLDs from: http://data.iana.org/TLD/tlds-alpha-by-domain.txt 27.12.2011
	var link_pattern = /\b((?:https?|s?ftp|mailto|irc|file|ssh|telnet):[^\s\(\)\[\]!]+)|\b([_a-z0-9]+(?:[-_a-z0-9\.]+[_a-z0-9]+)?@[_a-z0-9]+(?:[-_a-z0-9\.]+[_a-z0-9]+)?)\b|\b([-a-z0-9]+(?:[-a-z0-9\.]+[-a-z0-9]+)?\.(?:ac|ad|ae|aero|af|ag|ai|al|am|an|ao|aq|ar|arpa|as|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|info|int|io|iq|ir|is|it|je|jm|jo|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mo|mobi|mp|mq|mr|ms|mt|mu|museum|mv|mw|mx|my|mz|na|name|nc|ne|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--3e0b707e|xn--45brj9c|xn--80akhbyknj4f|xn--90a3ac|xn--9t4b11yi5a|xn--clchc0ea0b2g2a9gcd|xn--deba0ad|xn--fiqs8s|xn--fiqz9s|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--g6w251d|xn--gecrj9c|xn--h2brj9c|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--j6w193g|xn--jxalpdlp|xn--kgbechtv|xn--kprw13d|xn--kpry57d|xn--lgbbat1ad8j|xn--mgbaam7a8h|xn--mgbayh7gpa|xn--mgbbh1a71e|xn--mgbc0a9azcg|xn--mgberp4a5d4ar|xn--o3cw4h|xn--ogbpf8fl|xn--p1ai|xn--pgbs0dh|xn--s9brj9c|xn--wgbh1c|xn--wgbl6a|xn--xkc2al3hye2a|xn--xkc2dl3a5ee0h|xn--yfro4i67o|xn--ygbi2ammx|xn--zckzah|xxx|ye|yt|za|zm|zw)\b(?:\/[^\s\(\)\[\]!]+)?)/i;

	tag.add = add;
	tag.linkify = function (s) {
		var elements = [];
		for (;;) {
			var j = s.search(link_pattern);
			if (j < 0) {
				elements.push(s);
				break;
			}
			else if (j > 0) {
				elements.push(s.slice(0,j));
				s = s.slice(j);
			}
			var m = link_pattern.exec(s);
			var url, label;
			if (m[1]) {
				// url with protocol
				url = label = m[1];
			}
			else if (m[2]) {
				// mailto url without protocol
				url = 'mailto:'+m[2];
				label = m[2];
			}
			else {
				// http url without protocol
				url = 'http://'+m[3];
				label = m[3];
			}
			elements.push(tag('a',{href:url},label));
			s = s.slice(m[0].length);
		}
		return elements;
	};

	tag.textify = function (text) {
		var elements = [];
		if (text) {
			var pars = text.split(/\r?\n\s*\r?\n/g);
			for (var i = 0; i < pars.length; ++ i) {
				var lines = pars[i].split(/\r?\n/g);
				var par = tag('p');
				for (var j = 0; j < lines.length; ++ j) {
					add(par, tag.linkify(lines[j]));
					if (j + 1 < lines.length) {
						add(par, tag('br'));
					}
				}
				elements.push(par);
			}
		}
		return elements;
	};

	tag.time = function (time) {
		if (isNaN(time) || time === Infinity) {
			return "??:??";
		}
		var secs = Math.round(time);
		var mins = Math.floor(secs / 60);
		secs -= 60 * mins;
		var hours = Math.floor(mins / 60);
		mins -= 60 * hours;

		secs = secs < 10 ? '0'+secs : String(secs);
		if (hours > 0) {
			mins = mins < 10 ? '0'+mins : String(mins);
			return hours+':'+mins+':'+secs;
		}
		else {
			return mins+':'+secs;
		}
	};

	var next_number_id = 0;
	tag.number = function (opts) {
		var attrs = {
			'class':'number',
			type: 'text',
			id: 'id' in opts ? opts.id : 'number_input_'+(next_number_id ++),
			value: 'value' in opts ? opts.value : 0,
			size: 'size' in opts ? opts.size : 3,
			autocomplete: 'off',
			onchange: numberFieldChanged
		};
		attrs.dataset = {
			value: attrs.value
		};
		if ('min' in opts) attrs.dataset.min = opts.min;
		if ('max' in opts) attrs.dataset.max = opts.max;
		if ('decimals' in opts) attrs.dataset.decimals = opts.decimals;
		if ('step'     in opts) attrs.dataset.step     = opts.step;
		var input = tag('input',attrs);
		if ('onchange' in opts) {
			add(input,{'onnumberchange':opts.onchange});
		}
		return {
			input: tag('span',{'class':'number-container text-input-container'},input),
			plus:  tag('button',{'class':'number-button',onclick:increaseNumberField,dataset:{'for':attrs.id}},'+'),
			minus: tag('button',{'class':'number-button',onclick:decreaseNumberField,dataset:{'for':attrs.id}},'\u2013')
		};
	};

	tag.number.get = function (field) {
		field = $(field);
		var value = field.dataset('value');
		if (value === undefined) {
			var decimals = field.dataset("decimals");

			value = parseFloat(field.val());
			if (decimals !== undefined) {
				value = parseFloat(value.toFixed(parseInt(decimals)));
			}
		}
		else {
			value = parseFloat(value);
		}
		return value;
	};
	
	tag.number.set = function (field, value) {
		if (!isNaN(value)) {
			value = parseFloat(value);
			field = $(field);
			var min   = field.dataset("min");
			var max   = field.dataset("max");
			var decimals = field.dataset("decimals");
			if (min !== undefined) {
				value = Math.max(parseFloat(min),value);
			}
			if (max !== undefined) {
				value = Math.min(parseFloat(max),value);
			}
			if (decimals !== undefined) {
				value = value.toFixed(parseInt(decimals));
			}
			else {
				value = String(value);
			}

			field.val(value);
			field.dataset("value",value);
		}
	};
	
	function numberFieldChanged () {
		var field = $(this);
		if (isNaN(field.val())) {
			field.val(field.dataset('value') || field.dataset('min') || '0');
		}
		else {
			tag.number.set(field,field.val());
		}
		field.trigger('numberchange');
	}

	function increaseNumberField () {
		var button = $(this);
		var field = $('#'+button.dataset('for'));
		var step = field.dataset('step');
		if (step === undefined) {
			step = 1;
		}
		else {
			step = parseFloat(step);
		}
		tag.number.set(field,tag.number.get(field) + step);
		field.trigger('numberchange');
	}

	function decreaseNumberField () {
		var button = $(this);
		var field = $('#'+button.dataset('for'));
		var step = field.dataset('step');
		if (step === undefined) {
			step = 1;
		}
		else {
			step = parseFloat(step);
		}
		tag.number.set(field,tag.number.get(field) - step);
		field.trigger('numberchange');
	}

	function click_expander (event) {
		tag.expander.toggle(this);
		event.preventDefault();
	}

	tag.expander = function (opts) {
		var element, head = tag('a', {
			'class': 'head',
			href:'javascript:void(0)',
			onclick: click_expander},
			opts.head_attrs,
			tag('span',{'class':'expander'},'\u25B6'),
			' ',opts.label);

		try {
			element = tag('li', opts.attrs, head);
			$(element).data('options',opts);
			if (opts.expanded) {
				tag.expander.expand(element);
			}
			return element;
		}
		finally {
			head = null;
			element = null;
		}
	};

	tag.expander.toggle = function (element) {
		element = $(element);
		if (element.is(".head, .body")) element = element.parent();
		
		if (element.children('.body').length === 0) {
			tag.expander.expand(element);
		}
		else {
			tag.expander.collapse(element);
		}
	};

	tag.expander.expand = function (element) {
		element = $(element);
		if (element.is(".head, .body")) element = element.parent();
		
		element.find('> .head > .expander:first').text('\u25BC');

		var body = element.children('.body');
		if (body.length === 0) {
			var opts = element.data("options");
			var newbody = tag('div',{'class':'body'},opts.body_attrs);
			opts.render(newbody);
			element.append(newbody);
			if (opts.rendered) opts.rendered();
		}
	};

	tag.expander.collapse = function (element) {
		element = $(element);
		if (element.is(".head, .body")) element = element.parent();
		
		element.find('> .head > .expander:first').text('\u25B6');
		element.children('.body').remove();
	};

	return tag;
})(jQuery);

var Magnatune = {
	TouchDevice: 'ontouchstart' in window && 'createTouch' in document,
	VolumeControl: (function () {
		var ua = navigator.userAgent.toLowerCase();
		// got information from jplayer:
		var noVolume = [
			/ipad/,
			/iphone/,
			/ipod/,
			/android(?!.*?mobile)/,
			/android.*?mobile/,
			/blackberry/,
			/windows ce/,
			/webos/,
			/playbook/
		];
		for (var i = 0; i < noVolume.length; ++ i) {
			if (noVolume[i].test(ua)) {
				return false;
			}
		}
		return true;
	})(),
	Options: {
		AnimationDuration: 500
	}
};

(function (undefined) {

var MIME_TYPE_MAP = {
	"m3u":  "audio/mpegurl",
	"xspf": "application/xspf+xml",
	"json": "application/json",
	"html": "text/html",
	"pls":  "audio/x-scpls"
};

var DOWNLOAD_MIME_TYPE_MAP = {
	"m3u":  "audio/mpegurl",
	"xspf": "application/xspf+xml",
	"json": "application/octet-stream",
	"html": "application/octet-stream",
	"pls":  "audio/x-scpls"
};

var XML_CHAR_MAP = {
	'<': '&lt;',
	'>': '&gt;',
	'&': '&amp;',
	'"': '&quot;',
	"'": '&apos;'
};

function escapeXml (s) {
	return s.replace(/[<>&"']/g, function (ch) {
		return XML_CHAR_MAP[ch];
	});
}

/**
 * Build an absolute url using a base url.
 * The provided base url has to be a valid absolute url. It will not be validated!
 * If no base url is given the document location is used.
 * Schemes that behave other than http might not work.
 * It tries to support file:-urls, but might fail in some cases.
 * email:-urls aren't supported at all (don't make sense anyway).
 */
function absurl (url, base) {
	if (!base) base = document.location.href;
	if (!url) {
		return base;
	}
	else if (/^[a-z][-+\.a-z0-9]*:/i.test(url)) {
		// The scheme actually could contain any kind of alphanumerical unicode
		// character, but JavaScript regular expressions don't support unicode
		// character classes. Maybe /^[^:]+:/ or even /^.*:/ would be sufficient?
		return url;
	}
	else if (url.slice(0,2) === '//') {
		return /^[^:]+:/.exec(base)[0]+url;
	}
	
	var ch = url.charAt(0);
	if (ch === '/') {
		if (/^file:/i.test(base)) {
			// file scheme has no hostname
			return 'file://'+url;
		}
		else {
			return /^[^:]+:\/*[^\/]+/i.exec(base)[0]+url;
		}
	}
	else if (ch === '#') {
		// assume "#" only occures at the end indicating the fragment
		return base.replace(/#.*$/,'')+url;
	}
	else if (ch === '?') {
		// assume "?" and "#" only occure at the end indicating the query
		// and the fragment
		return base.replace(/[\?#].*$/,'')+url;
	}
	else {
		var path;
		if (/^file:/i.test(base)) {
			path = base.replace(/^file:\/{0,2}/i,'');
			base = "file://";
		}
		else {
			var match = /^([^:]+:\/*[^\/]+)(\/.*?)?(\?.*?)?(#.*)?$/.exec(base);
			base = match[1];
			path = match[2]||"/";
		}
	
		path = path.split("/");
		path.pop();
		if (path.length === 0) {
			// Ensure leading "/". Of course this is only valid on
			// unix like filesystems. More magic would be needed to
			// support other filesystems.
			path.push("");
		}
		path.push(url);
		return base+path.join("/");
	}
}

var ERROR_MAP = {
	timeout:     "Connection timeout",
	error:       "Connection error",
	abort:       "Request aborted by user",
	parsererror: "Illegal data sent by server"
};

function errorHeadline (textStatus, errorThrown) {
	return ERROR_MAP[textStatus] || (errorThrown ? errorThrown.toString() : 'Error');
}

function read (file, opts) {
	var onload;
	var reader = new FileReader();

	if (typeof(opts) === "function") {
		onload = opts;
		opts = {};
	}
	else {
		onload = opts.onload;
	}
	
	reader.onerror = opts.onerror || function (event) {
		var msg = this.error.toString();

		if (msg === '[object FileError]') {
			switch (this.error.code) {
				case FileError.ABORT_ERR:
					msg = 'Aborted';
					break;

				case FileError.ENCODING_ERR:
					msg = 'Encoding Error';
					break;

				case FileError.NOT_FOUND_ERR:
					msg = 'File not found';
					break;

				case FileError.NOT_READABLE_ERR:
					msg = 'File is not readable';
					break;

				case FileError.NO_MODIFICATION_ALLOWED_ERR:
					msg = 'File is not writeable';
					break;

				case FileError.SECURITY_ERR:
					msg = 'Security Error';
					break;

				default:
					msg = 'Error code ' + this.error.code;
			}
		}

		if (file.name) {
			alert("Error reading file \u00bb"+file.name+"\u00ab: "+msg);
		}
		else {
			alert("Error reading file: "+msg);
		}
	};

	reader.onload = onload;
	
	reader.readAsText(file, opts.encoding || "UTF-8");

	return reader;
}

function getBoolean (name) {
	var value = localStorage.getItem(name);
	if (value !== null) {
		try {
			value = JSON.parse(value);
		}
		catch (e) {
			console.error(e);
			return null;
		}
		if (typeof(value) !== "boolean") {
			value = null;
		}
	}
	return value;
}

function showPopup (button, popup) {
	var pos = button.position();
	var off = button.offset();
	var left = pos.left;
	var button_height = button.outerHeight();
	var top = pos.top + button_height;
	off.top += button_height;
	popup.css({
		visibility: 'hidden',
		display: ''
	});
	var width = popup.outerWidth();
	var height = popup.outerHeight();
	if (off.left < 10) {
		left = 10 - off.left + left;
	}
	else if (off.left + width > $(window).innerWidth() - 10) {
		left = $(window).innerWidth() - width - 10 - off.left + left;
	}

	if (off.top < 10) {
		top = 10 - off.top + top;
	}
	else if (off.top + height > $(window).innerHeight() - 10) {
		top = $(window).innerHeight() - height - 10 - off.top + top;
	}
	popup.hide().css({
		visibility: '',
		left: left+'px',
		top: top+'px'
	}).fadeIn('fast');
}

function showSave (data, name, mimetype) {
	window.open("data:"+(mimetype||"application/octet-stream")+";charset=utf-8;base64,"+$.base64Encode(data),name||"Download");
}

function loadVisibleImages (scroller) {
	var pos = scroller.offset();
	var startpos = pos.top - 150;
	var endpos = pos.top + scroller.outerHeight() + 200;
	var images = scroller.find('img[data-src]');
	var index = 0;
	// TODO: speed up with binary search?
	for (; index < images.length; ++ index) {
		if ($(images[index]).offset().top >= startpos) {
			break;
		}
	}
	
	for (; index < images.length; ++ index) {
		var image = $(images[index]);
		if (image.offset().top >= endpos) {
			break;
		}
		image.attr("src",image.attr("data-src")).removeAttr("data-src");
	}
}

$.extend(Magnatune, {
	Events: {
		extend: function (obj) {
			var events = {};
			obj.on = function (event, handler) {
				var handlers = events[event] || (events[event] = []);
				handlers.push(handler);
			};

			obj.off = function (event, handler) {
				var handlers = events[event], i;
				if (handlers && (i = handlers.indexOf(handler)) !== -1) {
					handlers.splice(i,1);
				}
			};

			obj.trigger = function (event) {
				var handlers = events[event];
				if (handlers) {
					var args = Array.prototype.slice.call(arguments,1);
					for (var i = 0; i < handlers.length; ++ i) {
						try {
							handlers[i].apply(this,args);
						}
						catch (e) {
							console.error(e);
						}
					}
				}
			};
		}
	},
	setNotificationsEnabled: function (enabled) {
		enabled = !!enabled;
		if (typeof(localStorage) !== "undefined") {
			localStorage.setItem('notifications.enabled',String(enabled));
		}
		if (window.webkitNotifications && window.webkitNotifications.checkPermission() !== 0) {
			window.webkitNotifications.requestPermission();
		}
	},
	getNotificationsEnabled: function () {
		return getBoolean('notifications.enabled');
	},
	Player: {
		_song: null,
		song: function () {
			return this._song;
		},
		duration: function () {
			var duration = this.audio ? this.audio.duration : NaN;
			if ((isNaN(duration) || duration === Infinity) && this._song) {
				duration = this._song.duration;
			}
			return duration;
		},
		currentTime: function () {
			return this.audio.currentTime;
		},
		playing: function () {
			return !this.audio.paused && !this.audio.ended;
		},
		paused: function () {
			return this.audio.paused;
		},
		ended: function () {
			return this.audio.ended;
		},
		member: function () {
			return $('#member').is(':checked');
		},
		setMember: function (member) {
			$('#member').attr('checked',!!member);
		},
		showSpinner: function () {
			$('#waiting').show().rotate({
				angle: 0,
				animateTo: 360,
				easing: function (x,t,b,c,d) {
					return c*(t/d)+b;
				},
				callback: function () {
					if ($(this).is(':visible')) {
						Magnatune.Player.showSpinner();
					}
				}
			});
		},
		hideSpinner: function () {
			$('#waiting').hide();
		},
		audio: null,
		_time_update: function (currentTime) {
			var duration = this.duration();
			var remaining = duration - currentTime;
			$('#time-left').text('-'+tag.time(remaining < 0 ? NaN : remaining));
			$('#current-time').text(tag.time(currentTime));
			$('#play-progress').css('width',Math.round(
				$('#play-progress-container').width() * currentTime / duration)+'px');
		},
		_playing: function () {
			$('#play-image').hide();
			$('#pause-image').show();

			if (this._song &&
				typeof(localStorage) !== "undefined" &&
				getBoolean('notifications.enabled') &&
				window.webkitNotifications &&
				window.webkitNotifications.checkPermission() === 0) {
				var album = Magnatune.Collection.Albums[this._song.albumname];
				var notification = window.webkitNotifications.createNotification(
					'http://he3.magnatune.com/music/'+
					encodeURIComponent(album.artist.artist)+'/'+
					encodeURIComponent(album.albumname)+'/cover_50.jpg',
					this._song.desc,
					"by "+album.artist.artist+" from the album "+this._song.albumname);
				notification.ondisplay = this._timed_hide_notification;
				notification.show();
			}
		},
		_timed_hide_notification: function () {
			var timeout;
			if (typeof(localStorage) !== "undefined") {
				timeout = parseInt(localStorage.getItem('notifications.timeout'),10);
				if (isNaN(timeout)) {
					timeout = 6000;
				}
			}
			else {
				timeout = 6000;
			}
			
			if (timeout > 0) {
				setTimeout(function () {
					this.cancel();
				}.bind(this), timeout);
			}
		},
		_not_playing: function () {
			$('#play-image').show();
			$('#pause-image').hide();
		},
		_ended: function () {
			this._not_playing();
			Magnatune.Player.hideSpinner();
			if (!Magnatune.DnD.seeking) {
				Magnatune.Playlist.next(true);
			}
		},
		_volume_change: function () {
			var volume = this.volume();
			var maxheight = $('#volume-bar-container').height();
			var height = Math.round(maxheight * volume);
			$('#volume-bar').css('height', height+'px');
			$('#volume').text(Math.round(volume * 100)+'%');
		},
		_duration_change: function () {
			var duration = this.duration();
			var remaining = duration - this.currentTime();
			$('#time-left').text('-'+tag.time(remaining < 0 ? NaN : remaining));
			$('#current-duration, #playlist .current .duration').text(tag.time(duration));
		},
		Handlers: {
			progress: function (event) {
				var duration = Magnatune.Player.duration();
				var ranges = this.buffered;
				var buffered = $('#buffer-progress')[0];
				var ctx = buffered.getContext('2d');
				ctx.fillStyle = '#626D86';
				ctx.clearRect(0,0,buffered.width,buffered.height);
				for (var i = 0; i < ranges.length; ++ i) {
					var start = ranges.start(i);
					var x     = Math.round(buffered.width * start / duration);
					var width = Math.round(buffered.width * (ranges.end(i) - start) / duration);
					ctx.fillRect(x,0,width,buffered.height);
				}
			},
			timeupdate: function (event) {
				Magnatune.Player._time_update(this.currentTime);
			},
			volumechange: function (event) {
				Magnatune.Player._volume_change();
			},
			durationchange: function (event) {
				Magnatune.Player._duration_change();
			},
			waiting: function (event) {
				Magnatune.Player.showSpinner();
			},
			error: function (event) {
				console.log('error',event);
				Magnatune.Player.hideSpinner();
				Magnatune.Player.stop();
				// TODO
				// XXX: chrome does not fire this event when http auth fails!
			},
			canplay: function (event) {
				Magnatune.Player.hideSpinner();
			},
			playing: function (event) {
				Magnatune.Player._playing();
			},
			emptied: function (event) {
				Magnatune.Player.hideSpinner();
			},
			pause: function (event) {
				Magnatune.Player._not_playing();
			},
			ended: function (event) {
				Magnatune.Player._ended();
			}
		},
		initAudio: function () {
			var volume = 1.0;
			if (this.audio) {
				volume = this.audio.volume;
				for (var event in this.Handlers) {
					$(this.audio).off(event, this.Handlers[event]);
				}
				if (!this.audio.paused && !this.audio.ended) {
					try { this.audio.pause(); } catch (e) {}
				}
				$(this.audio).empty();
				this.audio.src = "";
				try { this.audio.load(); } catch(e) {}
				$(this.audio).remove();
			}
			this.audio = new Audio();
			this.audio.volume = volume;
			this.audio.preload = "none";
			// seeking only works when controls enabled:
			this.audio.controls = true;
			// but I actually want to paint my own controls:
			$(this.audio).css('display','none');
			for (var event in this.Handlers) {
				$(this.audio).on(event, this.Handlers[event]);
			}
			// seeking only works when in document! wtf?
			$(document.body).append(this.audio);
		},
		play: function (norewind) {
			this._update(norewind);
			if (this._song) {
				this.audio.load();
				this.audio.play();
			}
		},
		_set_sources: function (sources) {
			for (var i = 0; i < sources.length; ++ i) {
				this.audio.appendChild(tag('source',sources[i]));
			}
		},
		_prepare_audio: function () {
			this.initAudio();
		},
		_update: function (norewind) {
			var song = Magnatune.Playlist.current();
			if (!song && !norewind) {
				song = Magnatune.Playlist.first();
				$('#playlist > tbody > tr:first').addClass('current');
			}

			$('#play-progress').css('width','0px');
			var buffered = $('#buffer-progress')[0];
			if (buffered.getContext) {
				var ctx = buffered.getContext('2d');
				ctx.clearRect(0,0,buffered.width,buffered.height);
			}

			var currently_playing = $('#currently-playing');

			// Replacing the source child elements did not work for me so I
			// have to create a new audio element for each play command!
			this._prepare_audio();
			this._song = song;

			if (!song) {
				currently_playing.removeAttr('title');
				currently_playing.find('> a').attr(
					'href',"javascript:Magnatune.Playlist.randomAlbum();void(0)").text(
					"[Play Random Album]");

				$('#play-image').show();
				$('#pause-image').hide();
				$('#time-left').text('---:--');
				$('#current-time').text('--:--');
				$('#current-duration').text('--:--');
				document.title = 'Magnatune Player';

				return;
			}

			var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
			if (Magnatune.authenticated && this.member()) {
				var url = "http://stream.magnatune.com/music/"+encodeURIComponent(artist)+"/"+
					encodeURIComponent(song.albumname)+"/"+encodeURIComponent(song.mp3);

				this._set_sources([
					{type:'audio/ogg',src:url.replace(/\.mp3$/i,'.ogg')},
					{type:'audio/mp4',src:url.replace(/\.mp3$/i,'.m4a')},
					{type:'audio/mpeg;codecs="mp3"',src:url}
				]);
			}
			else {
				var url = "http://he3.magnatune.com/music/"+encodeURIComponent(artist)+"/"+
					encodeURIComponent(song.albumname)+"/"+encodeURIComponent(song.mp3);

				this._set_sources([
					{type:'audio/ogg',src:url.replace(/\.mp3$/i,'_spoken.ogg')},
					{type:'audio/mp4',src:url.replace(/\.mp3$/i,'_spoken.m4a')},
					{type:'audio/mpeg;codecs="mp3"',src:url.replace(/\.mp3$/i,'_spoken.mp3')}
				]);
			}

			var album_url = '#/album/'+encodeURIComponent(song.albumname);
			var song_label = song.desc+' - '+song.albumname+' - '+artist;
			currently_playing.attr('title',song_label);
			currently_playing.find('> a').attr('href',album_url).text(song_label);

			var duration = Magnatune.Player.duration();
			$('#time-left').text('-'+tag.time(duration));
			$('#current-time').text(tag.time(0));
			$('#current-duration').text(tag.time(duration));
			document.title = song.desc+' - '+artist+' - Magnatune Player';
		},
		seek: function (time) {
			try {
				this.audio.currentTime = time;
			}
			catch (e) {}
		},
		pause: function () {
			if (!this.audio.paused && !this.audio.ended) {
				this.audio.pause();
			}
		},
		playPause: function () {
			if (this.playing()) {
				this.audio.pause();
			}
			else if (!this._song) {
				this.play();
			}
			else {
				this.audio.play();
			}
		},
		stop: function () {
			if (!this.audio.paused && !this.audio.ended) {
				this.audio.pause();
			}
			try {
				this.audio.currentTime = 0;
			}
			catch (e) {}
		},
		visible: function () {
			return $('#player-hide').is(':visible');
		},
		hide: function (skipAnimation) {
			var currently_playing;
			var new_width = $('#volume-button').is(':visible') ? '300px' : '340px';
			$('#player-show').show();
			$('#player-hide').hide();
			if (skipAnimation) {
				$('#player-wrapper').stop().css({top:'-60px'});
				currently_playing = $('#currently-playing').stop();
				Magnatune.Player._stopTitleAnim();
				currently_playing.css({bottom:'6px',width:new_width});
				$('#navigation, #content').stop().css({top:'50px'});
			}
			else {
				var d = Magnatune.Options.AnimationDuration;
				$('#player-wrapper').stop().animate({top:'-60px'},d);
				currently_playing = $('#currently-playing').stop();
				Magnatune.Player._stopTitleAnim();
				currently_playing.animate({bottom:'6px',width:new_width},d);
				$('#navigation, #content').stop().animate({top:'50px'},d);
			}
		},
		show: function (skipAnimation) {
			$('#player-show').hide();
			$('#player-hide').show();
			if (skipAnimation) {
				$('#player-wrapper').stop().css({top:'0px'});
				var currently_playing = $('#currently-playing').stop();
				Magnatune.Player._stopTitleAnim();
				currently_playing.css({bottom:'60px',width:'430px'});
				$('#navigation, #content').stop().css({top:'110px'});
			}
			else {
				var d = Magnatune.Options.AnimationDuration;
				$('#player-wrapper').stop().animate({top:'0px'},d);
				var currently_playing = $('#currently-playing').stop();
				Magnatune.Player._stopTitleAnim();
				currently_playing.animate({bottom:'60px',width:'430px'},d);
				$('#navigation, #content').stop().animate({top:'110px'},d);
			}
		},
		_stopTitleAnim: function () {
			$('#currently-playing').stop('scroll',true,false).animate(
				{scrollLeft: 0},
				{duration: Magnatune.Options.AnimationDuration,
				 queue:    'scroll',
				 easing:   'linear'}).dequeue('scroll');
		},
		_titleAnim: function () {
			var currently_playing = $('#currently-playing');
			var text = currently_playing.find('a');
			var diff = text.width() - currently_playing.width();
			currently_playing.stop('scroll',true,false);
			if (diff > 0) {
				var d = Magnatune.Options.AnimationDuration;
				var scroll = currently_playing.scrollLeft();
				if ((scroll + 5) >= diff) {
					currently_playing.scrollLeft(diff).animate(
						{scrollLeft: 0},
						{duration: (diff / 40) * d,
						 queue:    'scroll',
						 easing:   'linear',
						 complete: Magnatune.Player._titleAnim});
				}
				else {
					currently_playing.animate(
						{scrollLeft: diff},
						{duration: ((diff - scroll) / 40) * d,
						 queue:    'scroll',
						 easing:   'linear',
						 complete: Magnatune.Player._titleAnim});
				}
				currently_playing.dequeue('scroll');
			}
			else {
				currently_playing.scrollLeft(0);
			}
		},
		toggleVolume: function () {
			var control = $('#volume-control');
			if (control.is(':visible')) {
				control.fadeOut('fast');
			}
			else {
				var button = $('#volume-button');
				var pos = button.position();
				control.css({
					visibility: 'hidden',
					display: ''
				});
				control.css({
					left: Math.round(pos.left+(button.outerWidth()-control.outerWidth())*0.5)+'px',
					top: (pos.top+button.outerHeight())+'px',
					display: 'none',
					visibility: ''
				}).fadeIn('fast');
			}
		},
		showCredentials: function () {
			if (typeof(localStorage) !== "undefined" && getBoolean('login.remember')) {
				$('#username').val(localStorage.getItem('login.username') || '');
				$('#password').val(localStorage.getItem('login.password') || '');
			}
			this._showCredentials();
		},
		_showCredentials: function () {
			showPopup($('#member-container'),$('#credentials'));
		},
		hideCredentials: function () {
			$('#login-spinner').hide();
			$('#credentials').fadeOut('fast', function () {
				// clear form so no one can spy the credentials when pants status down:
				$('#username, #password').val('');
			});
	
			if (typeof(localStorage) !== "undefined") {
				var remember = $('#remember-login').is(':checked');
				localStorage.setItem('login.remember',String(remember));
				if (!remember) {
					localStorage.removeItem('login.username');
					localStorage.removeItem('login.password');
				}
			}
		},
		cancelCredentials: function () {
			this.hideCredentials();
			if (!Magnatune.authenticated) {
				this.setMember(false);
			}
		},
		mute: function () {
			this.audio.muted = true;
		},
		unmute: function () {
			this.audio.muted = false;
		},
		muted: function () {
			return this.audio.muted;
		},
		setVolume: function (volume) {
			this.audio.volume = volume;
		},
		volume: function () {
			return this.audio.volume;
		}
	},
	Info: {
		_scroll_top: 0,
		_scroll_left: 0,
		show: function () {
			$('#info-button').addClass('active');
			$('#playlist-button').removeClass('active');
			var playlist_content = $('#playlist-container > .tab-content');
			Magnatune.Playlist._scroll_left = playlist_content.scrollLeft();
			Magnatune.Playlist._scroll_top = playlist_content.scrollTop();
			$('#playlist-container').hide();
			$('#info').show();
			$('#info-content').scrollLeft(this._scroll_left).scrollTop(this._scroll_top);
		},
		toggleEmbed: function (albumname,sku) {
			var embed_container = $('#embed-container');
			if (embed_container.is(':visible')) {
				$('#embed-button').removeClass('toggled');
				embed_container.hide();
			}
			else {
				$('#embed-button').addClass('toggled');
				embed_container.show();
				this.updateEmbed(albumname,sku);
			}
		},
		updateEmbed: function (albumname,sku) {
			var artist = Magnatune.Collection.Albums[albumname].artist.artist;
			var large    = $('#embed_large').is(':checked');
			var autoplay = $('#embed_autoplay').is(':checked');
			var width  = tag.number.get('#embed_width');
			var height = tag.number.get('#embed_height');
			var player;

			if (large) {
				if (width  <  150) width  =  150;
				if (width  >  600) width  =  600;
				if (height <  140) height =  140;
				if (height > 1000) height = 1000;
				player = "http://embed.magnatune.com/img/magnatune_player_embedded.swf";
			}
			else {
				if (width  < 100) width  = 100;
				if (width  > 600) width  = 600;
				if (height <  15) height =  15;
				if (height >  15) height =  15;
				player = "http://embed.magnatune.com/img/magnatune_player_embedded_single.swf";
			}

			var html = $.format(
				'<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" '+
				'codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" '+
				'width="{WIDTH}" height="{HEIGHT}">'+
				'<param name="allowScriptAccess" value="sameDomain"/>'+
				'<param name="movie" value="{PLAYER}?playlist_url=http://embed.magnatune.com/artists/albums/{ALBUM_SKU}/hifi.xspf&autoload=true&autoplay={AUTOPLAY}&playlist_title={PLAYLIST_TITLE}"/>'+
				'<param name="quality" value="high"/>'+
				'<param name="bgcolor" value="#E6E6E6"/>'+
				'<embed src="{PLAYER}?playlist_url=http://embed.magnatune.com/artists/albums/{ALBUM_SKU}/hifi.xspf&autoload=true&autoplay={AUTOPLAY}&playlist_title={PLAYLIST_TITLE}" '+
				'quality="high" bgcolor="#E6E6E6" name="xspf_player" allowscriptaccess="sameDomain" '+
				'type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" '+
				'align="center" width="{WIDTH}" height="{HEIGHT}"></embed>'+
				'</object>', {
					WIDTH: width,
					HEIGHT: height,
					PLAYER: player,
					ALBUM_SKU: sku,
					AUTOPLAY: autoplay ? 't' : '',
					PLAYLIST_TITLE: encodeURIComponent(albumname+' - '+artist)
				});

			$('#embed').val(html);
		},
		visible: function () {
			return $('#info').is(':visible');
		},
		_albumsTable: function (albums) {
			var tbody = $(tag('tbody'));
			for (var i = 0; i < albums.length; ++ i) {
				tbody.append(this._albumRow(albums[i]));
			}

			return tag('table', {'class':'albums'}, tbody);
		},
		_albumRow: function (album) {
			var launchdate = new Date();
			launchdate.setTime(album.launchdate * 1000);
			launchdate = '('+launchdate.getFullYear()+')';
			var row = tag('tr',
				{title:album.albumname+' '+launchdate+' '+album.artist.artist},
				tag('td', tag('a',
					{href:'#/album/'+encodeURIComponent(album.albumname)},
					tag('img',{'class':'cover',
						'data-src':'http://he3.magnatune.com/music/'+
							encodeURIComponent(album.artist.artist)+'/'+
							encodeURIComponent(album.albumname)+'/cover_50.jpg'}))),
				tag('td',
					tag('a',
						{href:'#/album/'+encodeURIComponent(album.albumname)},
						album.albumname),
					' ',
					tag('span',{'class':'launchdate'},launchdate),
					tag('br'),
					tag('a',
						{href:'#/artist/'+encodeURIComponent(album.artist.artist)},
						album.artist.artist)));
			Magnatune.DnD.draggable(row, Magnatune.DnD.albumOptions(album));
			return row;
		},
		_albumsList: function (albums) {
			var list = $(tag('ul',{'class':'albums'}));
			for (var i = 0; i < albums.length; ++ i) {
				list.append(tag('li',
					tag('table',
						tag('tbody',
							this._albumRow(albums[i])))));
			}

			return list;
		},
		hash: function () {
			return $("#info-content").dataset('hash');
		},
		loadVisibleImages: function () {
			loadVisibleImages($("#info-content"));
		},
		update: function (hash,breadcrumbs,content,keeptab) {
			this._async_page = null;

			var list = $('#breadcrumbs');
			list.empty();
			list.append(tag('li', {'class':'first'}, tag('a', {href:'#/about'}, 'Home')));
			for (var i = 0; i < breadcrumbs.length; ++ i) {
				var el = breadcrumbs[i];
				list.append(tag('li', tag('a', {href:el.href}, el.text)));
			}
			$('#info-button a').attr('href', hash);
			var info = $("#info-content");
			info.dataset('hash',hash);
			info.scrollTop(0);
			info.scrollLeft(0);
			info.html(content);
			
			this._scroll_top = this._scroll_left = 0;
			if (!keeptab) this.show();
			if (!keeptab || Magnatune.Info.visible()) {
				window.location.hash = hash;
			}
			loadVisibleImages(info);
		},
		pageNotFound: function (hash,breadcrumbs,content,keeptab) {
			content = tag('div',{'class':'errorpage notfound'},
				tag('h2','Not Found'),
				content);
			this.update(hash,breadcrumbs,content,keeptab);
		},
		ajaxError: function (hash,breadcrumbs,textStatus,errorThrown,content,keeptab) {
			content = tag('div',{'class':'errorpage ajaxerror'},
				tag('h2',errorHeadline(textStatus,errorThrown)),
				content);
			this.update(hash,breadcrumbs,content,keeptab);
		},
		_async_page: null,
		load: function (hash,opts) {
			var m = /^#?\/([^\/]+)(?:\/(.*))?/.exec(hash);
			
			if (!m) return false;

			if (!opts) opts = {};
			var page = m[1];
			if (typeof(m[2]) !== "undefined") {
				opts.id = decodeURIComponent(m[2]);
			}

			if (this._async_page) {
				try {
					this._async_page.abort();
				}
				catch (e) {
					console.error(e);
				}
				this._async_page = null;
			}
			if (Object.prototype.hasOwnProperty.call(this.Pages,page)) {
				this._async_page = this.Pages[page](opts||{});
				return true;
			}
			else {
				this.pageNotFound(
					hash,
					[{href: hash, text: 'Not Found'}],
					tag('p','Page not found. Please check whether you have you have misstyped the URL.'),
					opts.keeptab);
				return false;
			}
		},
		Pages: {
			playlist: function (opts) {
				// pseudopage
				if (opts.id) {
					Magnatune.Playlist.load(opts.id);
				}
				Magnatune.Playlist.show();
			},
			info: function () {
				// pseudopage
				var hash = Magnatune.Info.hash();
				if (hash === '#/info' || !hash) {
					window.location.hash = '#/about';
				}
				else {
					window.location.hash = hash;
				}
			},
			about: function (opts) {
				// TODO: don't inline this HTML here
				var page = tag('div',{'class':'about'});
				var more = '';
				if (window.chrome && window.chrome.app) {
					if (window.chrome.app.isInstalled) {
						more = '<span class="app installed">App is installed</span>';
						if (window.webkitNotifications) {
							more += ('<br/><input type="checkbox" id="notifications-enabled" '+
								'onchange="Magnatune.setNotificationsEnabled($(this).is(\':checked\'));"'+
								(getBoolean('notifications.enabled') ? ' checked' : '')+'/> ' +
								'<label for="notifications-enabled">Show notifications on song change</label>');
						}
					}
					else {
						more = '<a class="button app" href="app/magnatune-player.crx">Install App</a>';
					}
				}
				$(page).html(
					'<h2>Magnatune Player</h2>'+
					'<div class="about-float">'+
					'<a class="logo" title="Magnatune" href="http://magnatune.com/"><img alt="" src="images/logo.png"/></a>'+
					more+
					'</div>'+
					'<p>This is a proof of concept interface to <a href="http://magnatune.com/">magnatune.com</a> '+
					'that is organized like a music player. It uses the '+
					'<a href="http://www.sqlite.org/">SQLite</a> export from the '+
					'<a href="http://magnatune.com/info/api">Magnatune API</a> and the '+
					'<a href="http://dev.w3.org/html5/spec/the-audio-element.html">HTML5 Audio Element</a>. '+
					'Depending on the browser HTML5 Audio is still not bug free, and therefore things like the buffer '+
					'progress display or seeking might not work 100% reliable. In Internet Explorer previous to '+
					'version 9 ActiveX is used to play music. However, the layout might look completely broken '+
					'because of Internet Explorer\'s lacking standard support. If you want a good experience please '+
					'use <a href="http://www.firefox.com/">Mozilla Firefox</a>, '+
					'<a href="http://www.google.com/chrome/">Google Chrome</a>, '+
					'<a href="http://www.apple.com/safari/">Apple Safari</a> or '+
					'<a href="http://www.opera.com/">Opera</a>.</p>'+
					'<p><a id="start-tour" href="javascript:Magnatune.Tour.start();void(0)">Take a Tour</a> to '+
					'get an overview of the features of the Magnatune Player.</p>'+
					'<p>You can download the source code of this web page on '+
					'<a href="https://bitbucket.org/panzi/magnatune-player">bitbucket</a>. '+
					'Other experiments done by me can be found <a '+
					'href="http://web.student.tuwien.ac.at/~e0427417/">here</a>.</p>'+
					'<p>Copyright &copy; 2012 Mathias Panzenb&ouml;ck<br/>'+
					'License <a href="http://www.gnu.org/licenses/gpl-2.0.html" target="_blank">GPLv2+</a>: '+
					'GNU GPL version 2 or later</p>'+
					'<p>This is free software; you are free to change and redistribute it.<br/>'+
					'There is NO WARRANTY, to the extent permitted by law.</p>');
				Magnatune.Info.update('#/about',[],page,opts.keeptab);
			},
			genre: function (opts) {
				var hash = '#/genre/'+encodeURIComponent(opts.id);
				var genre = Magnatune.Collection.Genres[opts.id];
				var breadcrumbs = [{href:hash,text:opts.id}];
				if (!genre) {
					Magnatune.Info.pageNotFound(
						hash,
						breadcrumbs,
						tag('p','Genre \u00bb'+opts.id+'\u00ab was not found.'),
						opts.keeptab);
					return;
				}
				var albums = genre.albums.slice();
				albums.sort(Magnatune.Navigation.albumSorter());
				var page = tag('div',{'class':'genre'},
					tag('h2',tag('a',{'class':'genre',
						href:'http://magnatune.com/genres/'+genre.genre.replace(/\s/g,'').toLowerCase()+'/',
						target:'_blank'},
						genre.genre)),
					tag('p', tag('a',{'class':'button',href:'javascript:'+
						encodeURIComponent('Magnatune.Playlist.randomAlbumOfGenre('+
							JSON.stringify(genre.genre)+');void(0)')},'\u25B6 Play Random Album')),
					Magnatune.Info._albumsList(albums));
				Magnatune.Info.update(hash,breadcrumbs,page,opts.keeptab);
			},
			album: function (opts) {
				var hash = '#/album/'+encodeURIComponent(opts.id);
				var album = Magnatune.Collection.Albums[opts.id];
				var artist = album ? album.artist.artist : 'Unknown Artist';
				var breadcrumbs = [
					{href: '#/artist/'+encodeURIComponent(artist), text: artist},
					{href: hash, text: opts.id}];

				return Magnatune.Collection.request({
					args: {action: 'album', name: opts.id},
					success: function (data) {
						if (!data.body) {
							Magnatune.Info.pageNotFound(
								hash,
								breadcrumbs,
								tag('p','Album \u00bb'+opts.id+'\u00ab was not found.'),
								opts.keeptab);
							return;
						}
						var authenticated = Magnatune.authenticated && Magnatune.Player.member();
						var songs = $(tag('tbody'));
						var url_prefix = 'http://download.magnatune.com/music/'+
							encodeURIComponent(artist)+'/'+
							encodeURIComponent(album.albumname)+'/';
						var album_prefix = "http://download.magnatune.com/membership/download?";
						for (var i = 0; i < data.body.songs.length; ++ i) {
							var song = data.body.songs[i];
						
							song.albumname = album.albumname;
							var row = $(tag('tr', {dataset: song},
								tag('td', {'class':'number'}, song.number),
								tag('td', song.desc),
								tag('td', {'class':'duration'}, tag.time(song.duration))));
							if (authenticated) {
								var url = url_prefix+encodeURIComponent(song.mp3);
								row.append(tag('td',
									tag('a',{href:url},'mp3'),' ',
									tag('a',{href:url.replace(/\.mp3$/i,'.wav')},'wav'),' ',
									tag('a',{href:url.replace(/\.mp3$/i,'.m4a')},'m4a'),' ',
									tag('a',{href:url.replace(/\.mp3$/i,'.ogg')},'ogg')));
							}
							row.append(tag('td', tag('a',{
								title: 'Enqueue Track',
								onclick: 'Magnatune.Playlist.enqueue([$(this).parent().parent().dataset()],undefined,true);',
								href:'javascript:void(0)'},'+')));
							Magnatune.DnD.draggable(row, Magnatune.DnD.SongOptions);
							songs.append(row);
						}
						var genres = $(tag('ul',{'class':'genres'}));
						for (var i = 0; i < album.genres.length; ++ i) {
							var genre = album.genres[i].genre;
							genres.append(tag('li', i === 0 ? {'class':'first'} : null,
								tag('a', {href:'#/genre/'+encodeURIComponent(genre)}, genre)));
						}
						var also = [];
						for (var i = 0; i < data.body.also.length; ++ i) {
							also.push(Magnatune.Collection.Albums[data.body.also[i]]);
						}
						var launchdate = new Date();
						launchdate.setTime(data.body.launchdate * 1000);
						var sku = data.body.sku;
						var embed_args   = JSON.stringify(album.albumname)+','+JSON.stringify(sku);
						var embed_update = 'Magnatune.Info.updateEmbed('+embed_args+');';
						var embed_width  = tag.number({id: 'embed_width',  value: 400, min: 0, max: 1920, decimals: 0, step: 10, onchange: embed_update});
						var embed_height = tag.number({id: 'embed_height', value: 300, min: 0, max: 1080, decimals: 0, step: 10, onchange: embed_update});
						var cover_file, cover_class;
						if (window.innerWidth < 1280) {
							cover_file = '/cover_200.jpg';
							cover_class = 'cover big';
						}
						else {
							cover_file = '/cover_300.jpg';
							cover_class = 'cover huge';
						}
						var page = tag('div',{'class':'album'},
							tag('h2', tag('a', {'class':'albumname',
								href:'http://magnatune.com/artists/albums/'+sku+'/',
								target:'_blank'},
								album.albumname)),
							tag('div',{'class':'launchdate'}, launchdate.toLocaleDateString()),
							genres,
							tag('table',
								tag('tbody',
									tag('tr',
										authenticated ? null :
											tag('td',
												tag('a',{
													'class':'buy button',
													title:'Buy Music from Magnatune',
													href:'https://magnatune.com/buy/choose?sku='+sku,
													target:'_blank'},'Buy')),
										tag('td',
											tag('a',{
												rel: 'license',
												target:'_blank',
												href: 'http://creativecommons.org/licenses/by-nc-sa/1.0/'},
												tag('img',{
													alt:'Creative Commons License',
													width:'88',
													height:'31',
													title:'This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 1.0 Generic License',
													src:'http://i.creativecommons.org/l/by-nc-sa/1.0/88x31.png'})))))),
							tag('img', {'class':cover_class,
								src: 'http://he3.magnatune.com/music/'+
									encodeURIComponent(artist)+'/'+
									encodeURIComponent(album.albumname)+cover_file,
								alt: 'Cover'}),
							tag.textify(data.body.description),
							authenticated ? [tag('p',
								tag('div',{'class':'download-headline'},'Download the complete album:'),
								' ',
								tag('a',{target:'_blank',href:album_prefix+$.param({
									sku: sku,
									format: 'vbr',
									filename: sku+'-vbr.zip',
									path: url_prefix+sku+'-vbr.zip'})},'MP3 VBR'),
								', ',
								tag('a',{target:'_blank',href:album_prefix+$.param({
									sku: sku,
									format: 'wav',
									filename: 'wav.zip',
									path: url_prefix+'wav.zip'})},'WAV'),
								', ',
								tag('a',{target:'_blank',href:album_prefix+$.param({
									sku: sku,
									format: 'flac',
									filename: sku+'-flac.zip',
									path: url_prefix+sku+'-flac.zip'})},'FLAC'),
								', ',
								tag('a',{target:'_blank',href:album_prefix+$.param({
									sku: sku,
									format: 'ogg',
									filename: sku+'-ogg.zip',
									path: url_prefix+sku+'-ogg.zip'})},'OGG'),
								', ',
								tag('a',{target:'_blank',href:album_prefix+$.param({
									sku: sku,
									format: 'mp3',
									filename: 'mp3.zip',
									path: url_prefix+'mp3.zip'})},'128kb MP3'),
								', ',
								tag('a',{target:'_blank',href:album_prefix+$.param({
									sku: sku,
									format: 'aac',
									filename: sku+'-aac.zip',
									path: url_prefix+sku+'-aac.zip'})},'iTunes AAC')),
							tag('p',
								tag('span',{'class':'download-headline'},'Cover:'),
								' ',
								tag('a',{target:'_blank',href:url_prefix+'cover.jpg'},'JPG'),
								', ',
								tag('span',{'class':'download-headline'},'Artwork:'),
								' ',
								tag('a',{target:'_blank',href:url_prefix+'artwork.pdf'},'PDF'))] : null,
							tag('div',
								tag('a', {'class':'button',href:'javascript:void(0)',
									onclick:'Magnatune.Playlist.replace($(this).parent().parent().find(".tracklist tbody tr").map(function () { return $(this).dataset(); }), true);'},
									'\u25B6 Play Album'),
								' ',
								tag('a', {'class':'button',href:'javascript:void(0)',
									onclick:'Magnatune.Playlist.enqueue($(this).parent().parent().find(".tracklist tbody tr").map(function () { return $(this).dataset(); }), undefined, true);'},
									'Enqueue Album'),
								' ',
								tag('a', {'class':'button',id:'embed-button',href:'javascript:'+encodeURIComponent(
									'Magnatune.Info.toggleEmbed('+embed_args+');void(0)')},
									'Embed Code')),
							tag('table',{'id':'embed-container','style':'display:none;'},
								tag('tbody',
									tag('tr',
										tag('td',{'class':'embed-config'},
											tag('table',{'class':'embed-dimensions'},
												tag('tbody',
													tag('tr',
														tag('td', tag('label',{'for':'embed_width'},'Width:')),
														tag('td', embed_width.input),
														tag('td', 'px'),
														tag('td', embed_width.plus, embed_width.minus)),
													tag('tr',
														tag('td', tag('label',{'for':'embed_height'},'Height:')),
														tag('td', embed_height.input),
														tag('td', 'px'),
														tag('td', embed_height.plus, embed_height.minus))))),
										tag('td',{'class':'embed-config'},
											tag('div',{'class':'embed-flags'},
												tag('div',tag('input',{type:'checkbox',id:'embed_large',onchange:embed_update,checked:true}),' ',tag('label',{'for':'embed_large'},'Large')),
												tag('div',tag('input',{type:'checkbox',id:'embed_autoplay',onchange:embed_update}),' ',tag('label',{'for':'embed_autoplay'},'Autoplay')))),
										tag('td',{'class':'embed-code'},
											tag('textarea',{'id':'embed',title:'Copy this HTML code into your website.',onclick:'this.select();'}))))),
							tag('table',{'class':'tracklist'},
								tag('thead',
									tag('tr',
										tag('th','Nr.'),
										tag('th','Title'),
										tag('th','Duration'),
										authenticated ? 
											tag('th','Download') :
											null,
										tag('th',''))),
								songs),
							tag('div',{'class':'also'},
								tag('h3','Related Albums'),
								Magnatune.Info._albumsTable(also)));
						Magnatune.Info.update(hash,breadcrumbs,page,opts.keeptab);
					},
					error: function (request, textStatus, errorThrown) {
						if (textStatus === "abort") return;
						Magnatune.Info.ajaxError(
							hash,
							breadcrumbs,
							textStatus, errorThrown,
							tag('p','Error retrieving information of album \u00bb'+opts.id+'\u00ab from server.'),
							opts.keeptab);
					}
				});
			},
			artist: function (opts) {
				var hash = '#/artist/'+encodeURIComponent(opts.id);
				var breadcrumbs = [{href: hash, text: opts.id}];

				return Magnatune.Collection.request({
					args: {action: 'artist', name: opts.id},
					success: function (data) {
						if (!data.body) {
							Magnatune.Info.pageNotFound(
								hash,
								breadcrumbs,
								tag('p','Artist \u00bb'+opts.id+'\u00ab was not found.'),
								opts.keeptab);
							return;
						}
						var artist = Magnatune.Collection.Artists[opts.id];
						var tbody = $(tag('tbody'));
						var albums = artist.albums.slice();
						albums.sort(Magnatune.Collection.AlbumDateSorter);
						for (var i = 0; i < albums.length; ++ i) {
							var album = albums[i];
							var launchdate = new Date();
							launchdate.setTime(album.launchdate * 1000);
							var row = tag('tr',
								tag('td', tag('a',
									{href:'#/album/'+encodeURIComponent(album.albumname)},
									tag('img', {'class':'cover',
										'data-src':'http://he3.magnatune.com/music/'+
											encodeURIComponent(album.artist.artist)+'/'+
											encodeURIComponent(album.albumname)+'/cover_50.jpg'}))),
								tag('td', tag('a',
									{href:'#/album/'+encodeURIComponent(album.albumname)},
									album.albumname),
									' ',
									tag('span', {'class':'launchdate'}, '('+launchdate.getFullYear()+')')));
							Magnatune.DnD.draggable(row, Magnatune.DnD.albumOptions(album));
							tbody.append(row);
						}
						var page = tag('div', {'class':'artist'},
							tag('h2', tag('a', {'class':'artist',
								href:'http://magnatune.com/artists/'+data.body.homepage,
								target:'_blank'},
								artist.artist)),
							data.body.bandphoto && tag('img', {'class': 'bandphoto',
								src: 'http://magnatune.com/'+data.body.bandphoto,
								alt: 'Bandphoto'}),
							tag('table', {'class':'albums'}, tbody),
							tag.textify(data.body.bio));
						Magnatune.Info.update(hash,breadcrumbs,page,opts.keeptab);
					},
					error: function (request, textStatus, errorThrown) {
						if (textStatus === "abort") return;
						Magnatune.Info.ajaxError(
							hash,
							breadcrumbs,
							textStatus, errorThrown,
							tag('p','Error retrieving information of artist \u00bb'+opts.id+'\u00ab from server.'),
							opts.keeptab);
					}
				});
			}
		}
	},
	Playlist: {
		SupportedMimeTypes: [
			"application/json",         // maybe
			"text/x-json",              // maybe
			"text/json",                // maybe
			"application/xspf+xml",
			"audio/mpegurl",
			"audio/x-mpegurl",
			"audio/x-scpls",
			// basically same as m3u, even has # comments:
			"text/uri-list",
			"text/html",
			"application/xhtml+xml",
			"text/xml",                 // maybe
			"text/plain",               // maybe
			"application/octet-stream", // maybe
			"Text"                      // IE, like text/plain
		],
		_scroll_top: 0,
		_scroll_left: 0,
		show: function () {
			$('#playlist-button').addClass('active');
			$('#info-button').removeClass('active');
			var info_content = $('#info-content');
			Magnatune.Info._scroll_left = info_content.scrollLeft();
			Magnatune.Info._scroll_top = info_content.scrollTop();
			$('#playlist-container').show().find('> .tab-content').scrollLeft(this._scroll_left).scrollTop(this._scroll_top);
			$('#info').hide();
		},
		visible: function () {
			return $('#playlist').is(':visible');
		},
		showExportMenu: function () {
			var member = $('#export-member-options');
			if (Magnatune.authenticated) {
				member.show();
			}
			else {
				member.hide();
			}
			showPopup($('#export-button'),$('#export-menu'));
		},
		hideExportMenu: function () {
			$('#export-menu').fadeOut('fast');
		},
		toggleExportMenu: function () {
			if ($('#export-menu').is(':visible')) {
				this.hideExportMenu();
			}
			else {
				this.showExportMenu();
			}
		},
		_url_getter: function (opts) {
			var prefix, suffix;
			
			if (opts.member && Magnatune.authenticated) {
				prefix = "http://stream.magnatune.com/music/";
				suffix = "";
			}
			else {
				prefix = "http://he3.magnatune.com/music/";
				suffix = "_spoken";
			}

			var format = String(opts.track_format).toLowerCase();
			switch (format) {
				case "mp3":
				case "m4a":
				case "ogg":
					suffix += '.'+format;
					break;

				default:
					throw new Error("Illegal track format: "+opts.track_format);
			}

			return function (song) {
				var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
				return prefix+encodeURIComponent(artist)+"/"+encodeURIComponent(song.albumname)+"/"+encodeURIComponent(song.mp3.replace(/\.mp3$/i,suffix));
			};
		},
		exportM3u: function (songs, opts) {
			var buf = ["#EXTM3U\n"];
			var get_url = this._url_getter(opts);
			
			for (var i = 0; i < songs.length; ++ i) {
				var song = songs[i];
				var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
				buf.push("#EXTINF:"+Math.round(song.duration)+","+artist.replace(/\s*[-:\n]+\s*/g,' ')+" - "+song.desc.replace(/\n/g," ")+"\n");
				buf.push(get_url(song)+"\n");
			}

			return buf.join("");
		},
		exportPls: function (songs, opts) {
			var buf = ['[Playlist]\r\n'];
			var get_url = this._url_getter(opts);
			
			for (var i = 0; i < songs.length; ++ i) {
				var song = songs[i];
				var index = i + 1;
				buf.push(
					"File"+index+"="+get_url(song)+"\r\n"+
					"Title"+index+"="+song.desc.replace(/\r/g,'').replace(/\n/g,' ')+"\r\n"+
					"Length"+index+"="+Math.round(song.duration)+"\r\n");
			}

			buf.push(
				"NumberOfEntries="+songs.length+"\r\n"+
				"Version=2\r\n");

			return buf.join("");
		},
		exportXspf: function (songs, opts) {
			var buf = [
				'<?xml version="1.0" encoding="UTF-8"?>\n'+
				'<playlist version="1" xmlns="http://xspf.org/ns/0/">\n'
			];
			var get_url = this._url_getter(opts);

			if (opts.title) buf.push('\t<title>'+escapeXml(opts.title)+'</title>\n');

			buf.push(
				'\t<image>http://magnatune.com/favicon.ico</image>\n'+
				'\t<trackList>\n');

			for (var i = 0; i < songs.length; ++ i) {
				var song = songs[i];
				var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
				var folder = encodeURIComponent(artist)+"/"+encodeURIComponent(song.albumname)+"/";
				var id = 'magnatune:'+folder+encodeURIComponent(song.desc);
				var image = "http://he3.magnatune.com/music/"+folder+'cover_100.jpg';
				buf.push(
					'\t\t<track>\n'+
					'\t\t\t<location>'+escapeXml(get_url(song))+'</location>\n'+
					'\t\t\t<identifier>'+escapeXml(id)+'</identifier>\n'+
					'\t\t\t<title>'+escapeXml(song.desc)+'</title>\n'+
					'\t\t\t<creator>'+escapeXml(artist)+'</creator>\n'+
					'\t\t\t<image>'+escapeXml(image)+'</image>\n'+
					'\t\t\t<album>'+escapeXml(song.albumname)+'</album>\n'+
					'\t\t\t<trackNum>'+escapeXml(String(song.number))+'</trackNum>\n'+
					'\t\t\t<duration>'+escapeXml(String(song.duration))+'</duration>\n'+
					'\t\t</track>\n');
			}

			buf.push('\t</trackList>\n</playlist>\n');
			return buf.join('');
		},
		exportJson: function (songs, opts) {
			var data = {
				head: {
					version: "1.0",
					type: "magnatune-player",
					subtype: "playlist"
				},
				body: songs
			};
			if (opts.title) data.head.title = opts.title;
			return JSON.stringify(data);
		},
		exportHtml: function (songs, opts) {
			// using hAudio and hMedia microformats:
			// http://microformats.org/wiki/haudio
			// http://microformats.org/wiki/hmedia
			var buf = [
				'<?xml version="1.0" encoding="UTF-8"?>\n'+
				// don't declare a doctype so it's a valid XML document an can be
				// parsed using $.parseXML in IE, which does not support $.parseHTML
//				'<!DOCTYPE html>\n'+
				'<html lang="en">\n'+
				'<head>\n'+
				'<meta http-equiv="content-type" content="text/html; charset=utf-8"/>\n'+
				'<title>'+escapeXml(opts.title||"Music from Magnatune")+'</title>\n'+
				'<link rel="shortcut icon" type="image/x-icon" href="http://magnatune.com/favicon.ico"/>\n'+
				'<link rel="profile" href="http://microformats.org/profile/haudio"/>\n'+
				'<style type="text/css">\n'+
				'.number, .duration {\n'+
				'width: 3em; font-family: monospace; text-align: right;\n'+
				'}\n'+
				'</style>\n'+
				'</head>\n'+
				'<body>\n'+
				'<p>Buy this music on <a href="http://magnatune.com/">Magnatune.com</a>.</p>\n'
			];
			this._exportHtml(buf, songs, opts);
			buf.push('</body>\n</html>\n');

			return buf.join('');
		},
		_exportHtml: function (buf, songs, opts) {
			if (opts.title) buf.push('<h2>'+escapeXml(opts.title)+'</h2>\n');
			buf.push(
				'<table>\n'+
				'<thead>\n'+
				'<tr>\n'+
				'<th>Nr.</th>\n'+
				'<th>Title</th>\n'+
				'<th>Duration</th>\n'+
				'<th>Album</th>\n'+
				'<th>Artist</th>\n'+
				'<th>Preview</th>\n'+
				'</tr>\n'+
				'</thead>\n'+
				'<tbody>\n');

			var prefix, suffix;
			if (opts.member && Magnatune.authenticated) {
				prefix = "http://stream.magnatune.com/music/";
				suffix = "";
			}
			else {
				prefix = "http://he3.magnatune.com/music/";
				suffix = "_spoken";
			}

			for (var i = 0; i < songs.length; ++ i) {
				var song = songs[i];
				var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
				var folder = prefix+encodeURIComponent(artist)+"/"+encodeURIComponent(song.albumname)+"/";
				var duration = song.duration;

				if (isNaN(duration) || duration === Infinity || duration < 0) {
					duration = "??:??";
				}
				else {
					var secs = Math.round(duration);
					var mins = Math.floor(secs / 60);
					secs -= 60 * mins;
					var hours = Math.floor(mins / 60);
					mins -= 60 * hours;

					secs = secs < 10 ? '0'+secs : String(secs);
					if (hours > 0) {
						mins = mins < 10 ? '0'+mins : String(mins);
						duration = ('<span class="h">'+hours+
							'</span>:<span class="min">'+mins+
							'</span>:<span class="s">'+secs+
							'</span>');
					}
					else {
						duration = ('<span class="min">'+mins+
							'</span>:<span class="s">'+secs+
							'</span>');
					}
				}

				buf.push(
					'<tr class="haudio hmedia">\n'+
					'<td class="number">'+escapeXml(String(song.number))+'</td>\n'+
					'<td class="fn">'+escapeXml(song.desc)+'</td>\n'+
					'<td class="duration">'+duration+'</td>\n'+
					'<td class="album">'+escapeXml(song.albumname)+'</td>\n'+
					'<td class="contributor">'+escapeXml(artist)+'</td>\n'+
					'<td><audio controls="controls" preload="none" class="player">\n'+
					'<source type="audio/ogg" src="'+escapeXml(folder+encodeURIComponent(song.mp3.replace(/\.mp3$/i,suffix+'.ogg')))+'"/>\n'+
					'<source type="audio/mp4" src="'+escapeXml(folder+encodeURIComponent(song.mp3.replace(/\.mp3$/i,suffix+'.m4a')))+'"/>\n'+
					'<source type="audio/mpeg;codec=&quot;mp3&quot;" src="'+escapeXml(folder+encodeURIComponent(song.mp3.replace(/\.mp3$/i,suffix+'.mp3')))+'"/>\n'+
					'</audio></td>\n'+
					'</tr>\n');
			}

			buf.push('</tbody>\n</table>\n');
		},
		exportPlaylist: function (songs, opts) {
			switch (String(opts.playlist_format).toLowerCase()) {
				case "m3u":  return this.exportM3u(songs, opts);
				case "xspf": return this.exportXspf(songs, opts);
				case "json": return this.exportJson(songs, opts);
				case "html": return this.exportHtml(songs, opts);
				case "pls":  return this.exportPls(songs, opts);
				default: throw new Error("Unknown playlist format: "+opts.playlist_format);
			}
		},
		exportSaved: function () {
			return JSON.stringify({
				head: {
					version: "1.0",
					type: "magnatune-player",
					subtype: "playlists"
				},
				body: this._getSavedPlaylists()
			});
		},
		showExport: function () {
			var what = $('#export-what').val();

			switch (what) {
				case "current":
					return this.showExportCurrent({
						playlist_format: $('#export-playlist-format').val(),
						track_format: $('#export-track-format').val(),
						member: $('#export-member').is(':checked')
					});

				case "saved":
					return this.showExportSaved();

				default:
					throw new Error("Unknown export selection: "+what);
			}
		},
		showExportCurrent: function (opts) {
			this.hideExportMenu();
			showSave(
				this.exportPlaylist(this.songs(), opts),
				"Playlist."+opts.playlist_format,
				DOWNLOAD_MIME_TYPE_MAP[opts.playlist_format]);
		},
		showExportSaved: function () {
			this.hideExportMenu();
			showSave(this.exportSaved(),"Playlists.json");
		},
		importFiles: function (files, index) {
			if (!files) return;
			for (var i = files.length - 1; i >= 0; -- i) {
				this.importFile(files[0], index);
			}
		},
		importFile: function (file, index) {
			if (!file) return;
			var mimeType = (file.type || "application/octet-stream").split(";")[0];
			if (this.SupportedMimeTypesMap[mimeType] === true) {
				read(file, function () {
					try {
						Magnatune.Playlist.importString(this.result, mimeType, index);
					}
					catch (e) {
						alert("Error reading file: "+e.toString());
					}
				});
			}
			else if (file.name) {
				alert("Unrecognized file type \u00bb"+file.type+"\u00ab of file \u00bb"+file.name+"\u00ab.");
			}
			else {
				alert("Unrecognized file type \u00bb"+file.type+"\u00ab.");
			}
		},
		importString: function (data, mimeType, index) {
			var imported;
			
			try {
				switch ((mimeType || "text/plain").split(";")[0]) {
					case "application/octet-stream":
					case "text/plain":
					case "Text":
						imported = this.parseAny(data);
						break;

					case "application/json":
					case "text/x-json":
					case "text/json":
						imported = this.parseJson(data);
						break;

					case "audio/mpegurl":
					case "audio/x-mpegurl":
					case "text/uri-list": // basically the same, even has # comments
						imported = this.parseM3u(data);
						break;

					case "text/xml":
						imported = this.parseXml(data);
						break;

					case "application/xspf+xml":
						imported = this.parseXspf(data);
						break;

					case "text/html":
					case "application/xhtml+xml":
						imported = this.parseHtml(data);
						break;

					case "audio/x-scpls":
						imported = this.parsePls(data);
						break;

					default:
						alert("Unrecognized file type \u00bb"+mimeType+"\u00ab.");
						return;
				}
			}
			catch (e) {
				alert("Error reading playlist: "+e.toString());
				return;
			}

			var count = 0;
			if (imported.songs) {
				this.enqueue(imported.songs, index, true);
				count = imported.songs.length;
			}

			if (imported.playlists) {
				var playlists = this._getSavedPlaylists();
				var conflict = [];
				for (var name in imported.playlists) {
					if (name in playlists) {
						conflict.push(name);
					}
					count += imported.playlists[name].length;
				}
				conflict.sort();
				if (conflict.length === 0 || confirm(
						"The folowing saved playlists already exist. Do you want to overwrite them?\n\n \u2022 "+
						conflict.join("\n \u2022 "))) {
					$.extend(playlists, imported.playlists);

					if ($('#playlists-menu').is(':visible')) {
						this._loadPlaylistMenu(playlists);
					}

					if (typeof(localStorage) !== "undefined") {
						localStorage.setItem('playlist.saved', JSON.stringify(playlists));
					}
				}
			}
			if (imported.unknown > 0) {
				alert($.format("Could not detect {unknown} of {all} Magnatune playlist entries.", {
					unknown: imported.unknown,
					all: count + imported.unknown
				}));
			}
		},
		parseAny: function (data) {
			if (/^#EXTM3U\b/.test(data)) {
				return this.parseM3u(data);
			}
			else if (/^\s*\{/.test(data)) {
				return this.parseJson(data);
			}
			else if (/^\s*(<\?.*?\?>\s*|<!--.*?-->|<!.*?>\s*)*<(\S+:)?playlist\b/.test(data)) {
				return this.parseXspf(data);
			}
			else if (/^\s*(<\?.*?\?>\s*|<!--.*?-->|<!.*?>\s*)*<html\b/i.test(data)) {
				return this.parseHtml(data);
			}
			else if (/^(\s*(;[^\n]*)?\n)*\[playlist\]\s*\n/i.test(data)) {
				return this.parsePls(data);
			}
			else {
				throw new Error("Failed to detect file type.");
			}
		},
		parseXml: function (data) {
			if (/^\s*(<\?.*?\?>\s*|<!--.*?-->|<!.*?>\s*)*<(\S+:)?playlist\b/.test(data)) {
				return this.parseXspf(data);
			}
			else if (/^\s*(<\?.*?\?>\s*|<!--.*?-->|<!.*?>\s*)*<html\b/i.test(data)) {
				return this.parseHtml(data);
			}
			else {
				throw new Error("Failed to detect file type.");
			}
		},
		parseXspf: function (data) {
			var doc = $.parseXML(data);
			var root = doc.documentElement;
			var localName = root.localName;
			if (!localName) {
				// IE
				if (root.prefix) {
					localName = root.nodeName.slice(root.prefix.length + 1);
				}
				else {
					localName = root.nodeName;
				}
			}
			if (root.namespaceURI !== "http://xspf.org/ns/0/" || localName !== "playlist") {
				throw new Error("Unrecognized file format.");
			}

			// The default base should be the URL of the XSPF file, but this is inaccessible here.
			var base = absurl($(root).attr("xml:base")||"","http://stream.magnatune.com/");
			var unknown = 0;
			var songs = [];

			var trackLists = $(root).find("> trackList");
			for (var trackListIndex = 0; trackListIndex < trackLists.length; ++ trackListIndex) {
				var trackList = $(trackLists[trackListIndex]);
				var trackListBase = absurl(trackList.attr("xml:base")||"",base);
				var tracks = trackList.find("> track");
				
				for (var i = 0; i < tracks.length; ++ i) {
					var track = $(tracks[i]);
					var trackBase = absurl(track.attr("xml:base")||"",trackListBase);
					var song = {
						albumname: track.find('> album').text(),
						artist:    track.find('> creator').text(),
						desc:      track.find('> title').text(),
						duration:  parseFloat(track.find('> duration').text()),
						number:    parseInt(track.find('> trackNum').text(),10)
					};

					var location = track.find('> location');
					var locationBase = absurl(location.attr("xml:base")||"",trackBase);
					location = absurl(location.text(),locationBase);
					var mp3 = /^https?:\/\/(?:download|stream|he3)\.magnatune\.com\/(?:all|music\/[^\/=?&#]+\/[^\/=?&#]+)\/((?:(\d+)-)?[^\/=?&#]*?)(?:_nospeech|-lofi|_spoken|_hq)?\.(?:mp3|ogg|m4a|flac|wav)$/.exec(location);

					var album;
					if (!mp3 || !song.albumname || !song.desc ||
						(isNaN(song.number) && (!mp3[2] || isNaN(song.number = parseInt(mp3[2],10)))) ||
						song.number <= 0 || !(album = Magnatune.Collection.Albums[song.albumname]) ||
						album.artist.artist !== song.artist) {
						++ unknown;
					}
					else {
						song.mp3 = decodeURIComponent(mp3[1])+'.mp3';
						songs.push(song);
					}
				}
			}

			return {songs: songs, unknown: unknown};
		},
		parseHtml: function (data) {
			var doc;
			if ($.parseHTML) {
				doc = $.parseHTML(data);
			}
			else {
				// IE, try xml
				try {
					doc = $.parseXML(data);
				}
				catch (e) {
					throw new Error("Your browser does not support parsing HTML files in JavaScript.");
				}
			}

			// first try to parse HTML with hAudio/hMedia microformats:
			var tracks = $(doc.documentElement).find('.haudio, .hmedia');
			var unknown = 0;
			var songs = [];

			for (var i = 0; i < tracks.length; ++ i) {
				var track = $(tracks[i]);
				var song = {
					albumname: track.find('.album').text(),
					artist:    track.find('.contributor').text(),
					desc:      track.find('.fn').text(),
					number:    parseInt(track.find('.number').text(), 10),
					duration:  NaN
				};

				var duration = track.find('.duration');
				var hours = parseInt(duration.find('.h').text(),10);
				var mins  = parseInt(duration.find('.min').text(),10);
				var secs  = parseFloat(duration.find('.s').text());

				if (isNaN(hours) && isNaN(mins) && isNaN(secs)) {
					if (duration.is('abbr')) {
						// parse ISO 8601 duration (with some extensions)
						duration = (duration.attr('title')||'').trim();
						var match;

						if ((match = /^P(?:Y(\d+))?(?:M(\d+))?(?:D(\d+))?(?:T(?:H(\d+))?(?:M(\d+))?(?:S(\d+(?:\.\d+)?(?:[eE][-+]?\d+)?))?)?$/.exec(duration)) ||
							(match = /^P?(\d+)-(\d+)-(\d+)(?:T|\s+)(\d+):(\d+):(\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)$/.exec(duration)) ||
							(match = /^P(\d\d\d\d)(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d(?:\.\d+)?(?:[eE][-+]?\d+)?)$/.exec(duration))) {
							song.duration = (((parseInt(match[1]||0,10)*365 + parseInt(match[2]||0,10)*(365/12) + parseInt(match[3]||0,10))*24 +
								parseInt(match[4]||0,10))*60 + parseInt(match[5]||0,10))*60 + parseFloat(match[6]||0);
						}
						else if ((match = /^PW(\d+)$/.exec(duration))) {
							song.duration = parseInt(duration[1]) * 7 * 24 * 60 * 60;
						}
					}
				}
				else if (!isNaN(hours) || !isNaN(mins) || !isNaN(secs)) {
					song.duration = ((hours||0)*60 + (mins||0))*60 + (secs||0);
				}

				var mp3 = track.find('a[rel="enclosure"], a[rel="sample"]');
				
				if (mp3.length > 0) {
					mp3 = mp3.attr('href');
				}
				else {
					var audio = track.find('audio.player, audio.enclosure, audio.sample');
					mp3 = audio.attr('src');
					if (!mp3) {
						mp3 = audio.find('source').attr('src');
					}
				}
				
				mp3 = /^http:\/\/(?:download|stream|he3)\.magnatune\.com\/(?:all|music\/[^\/=?&#]+\/[^\/=?&#]+)\/((?:(\d+)-)?[^\/=?&#]*?)(?:_nospeech|-lofi|_spoken|_hq)?\.(?:mp3|ogg|m4a|flac|wav)$/.exec(mp3||'');

				var album;
				if (!mp3 || !song.albumname || !song.desc ||
					(isNaN(song.number) && (!mp3[2] || isNaN(song.number = parseInt(mp3[2],10)))) ||
					song.number <= 0 || !(album = Magnatune.Collection.Albums[song.albumname]) ||
					album.artist.artist !== song.artist) {
					++ unknown;
				}
				else {
					song.mp3 = decodeURIComponent(mp3[1])+'.mp3';
					songs.push(song);
				}
			}

			if (songs.length === 0 && unknown === 0) {
				// if that fails just search for links to audio files
				tracks = $(doc.documentElement).find('a[href]');
				for (var i = 0; i < tracks.length; ++ i) {
					var url = tracks[i].href;
					var song = this._guessSongFromUrl(url);
					if (song) {
						songs.push(song);
					}
					else if (/https?:\/\/(?:download|stream|he3)\.magnatune\.com\/(?:music|all)\/[^?&#]*\.(?:mp3|ogg|m4a|flac|wav)$/i.test(url)) {
						// don't complain about links that do not point to Magnatune songs
						++ unknown;
					}
				}
			}

			return {songs: songs, unknown: unknown};
		},
		_guessSongFromUrl: function (url) {
			var guess = /^https?:\/\/(?:download|stream|he3)\.magnatune\.com\/music\/([^\/=?&#]+)\/([^\/=?&#]+)\/((\d+)-[^\/=?&#]*?)(?:_nospeech|-lofi|_spoken|_hq)?\.(?:mp3|ogg|m4a|flac|wav)$/.exec(url);

			if (!guess) return null;

			var file = decodeURIComponent(guess[3]);
			return {
				desc:      file.replace(/^\d+-/,''),
				artist:    decodeURIComponent(guess[1]),
				albumname: decodeURIComponent(guess[2]),
				mp3:       file+'.mp3',
				number:    parseInt(guess[4],10)
			};
		},
		parseM3u: function (data) {
			var lines = data.split(/\r?\n/g);
			var songs = [];
			var extm3u = lines[0] === "#EXTM3U";
			var unknown = 0;

			var duration = NaN;
			var desc = null;
			for (var i = extm3u ? 1 : 0; i < lines.length; ++ i) {
				var line = lines[i];

				if (!line) continue;

				if (extm3u && /^#EXTINF:/.test(line)) {
					var info = /^#EXTINF:([^,]*)(?:,(.*))?$/.exec(line);
					desc = info[2];
					duration = parseInt(info[1], 10);
					if (duration < 0) duration = NaN;
				}
				else if (!/^#/.test(line)) {
					var song = this._guessSongFromUrl(line);

					if (song) {
						song.duration = duration;
						if (desc) {
							var prefix = song.artist.replace(/\s*[-:\n]+\s*/g,' ')+' - ';
							if (desc.slice(0,prefix.length).toLowerCase() === prefix.toLowerCase()) {
								desc = desc.slice(prefix.length);
							}
							song.desc = desc;
						}
						songs.push(song);
					}
					else {
						++ unknown;
					}

					duration = NaN;
					desc = null;
				}
			}

			return {songs: songs, unknown: unknown};
		},
		parsePls: function (data) {
			var lines = data.split(/\r?\n/g);
			var songs = [];
			var unknown = 0;

			var ini = {'': {}};
			var section = ini[''];
			
			// hopefully not to simple ini parser:
			for (var i = 0; i < lines.length; ++ i) {
				var line = lines[i];
				
				if (/^\s*(;.*)?$/.test(line)) {
					continue;
				}

				var match;
				if ((match = /^\[(.*?)\]\s*$/.exec(line))) {
					var name = match[1].trim().toLowerCase();
					if (name in ini) {
						section = ini[name];
					}
					else {
						section = ini[name] = {};
					}
				}
				else {
					match = /^(.*?)(?:=(.*))?$/.exec(line);
					section[match[1].trim().toLowerCase()] = match[2]||'';
				}
			}

			var playlist = ini.playlist;
			var length;

			if (!playlist || !playlist.version || parseInt(playlist.version,10) !== 2 ||
				!playlist.numberofentries || isNaN(length = parseInt(playlist.numberofentries, 10)) ||
				length < 0 || length === Infinity) {
				throw new Error("Unrecognized file format.");
			}

			for (var i = 1; i < length + 1; ++ i) {
				var desc = playlist["title"+i]||'';
				var url  = playlist["file"+i]||'';
				var duration = parseFloat(playlist["length"+i]||'');

				var song = this._guessSongFromUrl(url);
				if (song) {
					song.duration = duration;
					if (desc) song.desc = desc;
					songs.push(song);
				}
				else {
					++ unknown;
				}
			}

			return {songs: songs, unknown: unknown};
		},
		parseJson: function (data) {
			data = JSON.parse(data);

			if (!data || !data.head || data.head.type !== "magnatune-player" || !data.body) {
				throw new Error("Unrecognized file format.");
			}

			switch (data.head.subtype) {
				case "playlist":
					if (!$.isArray(data.body)) {
						throw new Error("Unrecognized file format.");
					}
					// TODO: verify songs
					return {songs: data.body, unknown: 0};

				case "playlists":
					if (typeof(data.body) !== "object") {
						throw new Error("Unrecognized file format.");
					}
					for (var name in data.body) {
						if (!$.isArray(data.body[name])) {
							throw new Error("Unrecognized file format.");
						}
						// TODO: verify songs
					}
					return {playlists: data.body, unknown: 0};

				default:
					throw new Error("Unrecognized file format.");
			}
		},
		showPlaylistMenu: function () {
			this.loadPlaylistMenu();
			showPopup($('#playlists-button'),$('#playlists-menu'));
		},
		hidePlaylistMenu: function () {
			$('#playlists-menu').fadeOut('fast');
		},
		togglePlaylistMenu: function () {
			if ($('#playlists-menu').is(':visible')) {
				this.hidePlaylistMenu();
			}
			else {
				this.showPlaylistMenu();
			}
		},
		showSaveDialog: function () {
			$('#save-playlist-name').val('');
			showPopup($('#save-button'),$('#save-popup'));
		},
		hideSaveDialog: function () {
			$('#save-popup').fadeOut('fast', function () {
				$('#save-playlist-name').val('');
			});
		},
		toggleSaveDialog: function () {
			if ($('#save-popup').is(':visible')) {
				this.hideSaveDialog();
			}
			else {
				this.showSaveDialog();
			}
		},
		dialogSave: function () {
			var name = $('#save-playlist-name').val().trim();

			if (!name) {
				alert("Please enter a playlist name.");
				return;
			}
						
			if (name in this._getSavedPlaylists() && !confirm("A playlist with the name \u00bb"+name+"\u00ab already exists. Do you want to replace it?")) {
				return;
			}
			
			this.hideSaveDialog();
			this.save(name);
		},
		save: function (name) {
			if (typeof(localStorage) !== "undefined") {
				var playlists = this._getSavedPlaylists();
				playlists[name] = this.songs();
				localStorage.setItem('playlist.saved', JSON.stringify(playlists));
			}
		},
		load: function (name) {
			var playlist = this._getSavedPlaylists()[name];
			if (playlist) {
				this.replace(playlist);
			}
		},
		removePlaylist: function (name) {
			if (typeof(localStorage) !== "undefined") {
				var playlists = Magnatune.Playlist._getSavedPlaylists();
				delete playlists[name];
				if ($('#playlists-menu').is(':visible')) {
					Magnatune.Playlist._loadPlaylistMenu(playlists);
				}
				localStorage.setItem('playlist.saved', JSON.stringify(playlists));
			}
		},
		_getSavedPlaylists: function () {
			if (typeof(localStorage) !== "undefined") {
				var playlists = localStorage.getItem('playlist.saved');
				if (typeof(playlists) === "string") {
					try {
						return JSON.parse(playlists);
					}
					catch (e) {
						console.error(e);
						return {};
					}
				}
			}
			return {};
		},
		loadPlaylistMenu: function () {
			this._loadPlaylistMenu(this._getSavedPlaylists());
		},
		_loadPlaylistMenu: function (playlists) {
			var names = [];
			for (var name in playlists) {
				names.push(name);
			}
			names.sort();

			var menu = $('#playlists-menu > tbody');
			menu.empty();

			if (names.length === 0) {
				menu.append(tag('tr',{'class':'first last'},tag('td',tag('span',{'class':'empty'},'(No Saved Playlists)'))));
			}
			else {
				for (var i = 0; i < names.length; ++ i) {
					var name = names[i];
					var attrs = {};
					var classes = [];

					if (i === 0) {
						classes.push('first');
					}
					if (i + 1 === names.length) {
						classes.push('last');
					}
					if (classes.length > 0) {
						attrs['class'] = classes.join(' ');
					}

					menu.append(tag('tr',attrs,
						tag('td',{'class':'load'},
							tag('a',{
								href:'#/playlist/'+encodeURIComponent(name),
								onclick:'Magnatune.Playlist.hidePlaylistMenu();'}, name)),
						tag('td',{'class':'remove'},
							tag('a',{href:'javascript:void(0)',
							         title:'Remove Playlist',
							         onclick:this._click_remove_playlist.bind(this,name)},
								'\u00d7'))));
				}
			}
		},
		_click_remove_playlist: function (name,event) {
			event.stopPropagation();
			event.preventDefault();

			this.removePlaylist(name);
		},
		toggleSelectAll: function () {
			if ($("#playlist > tbody > tr.selected").length > 0) {
				this.selectNone();
			}
			else {
				this.selectAll();
			}
		},
		selectNone: function () {
			var tbody = $("#playlist > tbody");
			tbody.find("> tr").removeClass("selected").removeClass("selection-start");
		},
		selectAll: function () {
			var tbody = $("#playlist > tbody");
			tbody.find("> tr").addClass("selected");
			tbody.find("> tr.selection-start").removeClass("selection-start");
			tbody.find("> tr:first").addClass("selection-start");
		},
		addSelection: function (fromIndex, toIndex) {
			if (toIndex === undefined) toIndex = fromIndex + 1;
			var tbody = $("#playlist > tbody");
			var tracks = tbody.find("> tr");
			var start = $(tracks[fromIndex]);
			(toIndex < fromIndex ?
				start.prevUntil(tracks[toIndex]) :
				start.nextUntil(tracks[toIndex])).andSelf().addClass('selected');
			if (tbody.find("> tr.selection-start").length === 0) {
				start.addClass('selection-start');
			}
		},
		removeSelection: function (fromIndex, toIndex) {
			if (toIndex === undefined) toIndex = fromIndex + 1;
			var tbody = $("#playlist > tbody");
			var tracks = tbody.find("> tr");
			var start = $(tracks[fromIndex]);
			(toIndex < fromIndex ?
				start.prevUntil(tracks[toIndex]) :
				start.nextUntil(tracks[toIndex])).andSelf().removeClass('selected');
			if (tbody.find("> tr.slected").length === 0) {
				tbody.find("> tr.selection-start").removeClass("selection-start");
			}
		},
		remove: function (fromIndex, toIndex) {
			if (toIndex === undefined) toIndex = fromIndex + 1;
			var tbody = $("#playlist > tbody");
			var tracks = tbody.find("> tr");
			var start = $(tracks[fromIndex]);
			(toIndex < fromIndex ?
				start.prevUntil(tracks[toIndex]) :
				start.nextUntil(tracks[toIndex])).andSelf().remove();
			var selected = tbody.find("> tr.selected:first");
			if (selected.length > 0 && tbody.find("> tr.selection-start").length === 0) {
				selected.addClass("selection-start");
			}
		},
		move: function (fromIndex, toIndex, targetIndex) {
			var tracks = $('#playlist > tbody > tr');
			if (tracks.length === 0) return;
			if (fromIndex   >= tracks.length) fromIndex   = tracks.length;
			if (toIndex     >  tracks.length) toIndex     = tracks.length;
			if (targetIndex >  tracks.length) targetIndex = tracks.length;
			if (toIndex <= fromIndex || (targetIndex >= fromIndex && targetIndex < toIndex)) return;
			$(tracks[fromIndex]).nextUntil(tracks[toIndex]).andSelf().insertBefore(tracks[targetIndex]);
		},
		_toggle_select: function (element) {
			var playlist = $("#playlist");
			if (element.hasClass('selected')) {
				element.removeClass('selected');
				
				if (element.hasClass('selection-start')) {
					element.removeClass('selection-start');
					playlist.find('> tbody > tr.selected').first().addClass('selection-start');
				}
			}
			else {
				if (playlist.find('> tbody > tr.selected').length === 0) {
					element.addClass('selected selection-start');
				}
				else {
					element.addClass('selected');
				}
			}
		},
		_touch_song: function (event) {
			if (event.originalEvent.touches.length !== 1) return;
			setTimeout(function () {
				// hack so it won't deselect when starting to drag
				if (!Magnatune.DnD.handler) {
					Magnatune.Playlist._toggle_select($(this));
				}
			}.bind(this), 250);
		},
		_click_song: function (event) {
			if (event.ctrlKey) {
				Magnatune.Playlist._toggle_select($(this));
			}
			else if (event.shiftKey) {
				var playlist = $("#playlist");
				var element = $(this);
				var start = playlist.find('> tbody > tr.selection-start');
				if (start.length === 0) {
					element.addClass('selected selection-start');
				}
				else {
					playlist.find('> tbody > tr.selected').removeClass('selected');
					var selection;
					if (start.index() < element.index()) {
						selection = start.nextUntil(element).andSelf().add(element);
					}
					else {
						selection = start.prevUntil(element).andSelf().add(element);
					}
					selection.addClass('selected');
				}
			}
			else {
				($("#playlist").find('> tbody > tr.selected').
					removeClass('selected').
					removeClass('selection-start'));
				$(this).addClass('selected selection-start');
			}
		},
		_dblclick_song: function (event) {
			Magnatune.Playlist.setCurrentIndex($(this).index(), true);
		},
		_buildTrack: function (song, selected, selection_start) {
			var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
			var attrs = {dataset:song};
			if (selected && selection_start) attrs['class'] = "selected selection-start";
			else if (selected)               attrs['class'] = "selected";
			if (Magnatune.TouchDevice) {
				attrs.ontouchstart = Magnatune.Playlist._touch_song;
			}
			else {
				attrs.onclick    = Magnatune.Playlist._click_song;
				attrs.ondblclick = Magnatune.Playlist._dblclick_song;
			}
			var tr = tag('tr',attrs,
				tag('td',{'class':'number'},song.number),
				tag('td',song.desc),
				tag('td',{'class':'duration'},tag.time(song.duration)),
				tag('td',tag('a',{href:'#/album/'+encodeURIComponent(song.albumname)},song.albumname)),
				tag('td',tag('a',{href:'#/artist/'+encodeURIComponent(artist)},artist)),
				tag('td',{'class':'play'},
					tag('a',{href:'javascript:void(0)',
					         title: 'Play Track',
					         onclick:'Magnatune.Playlist.setCurrentIndex($(this).parent().parent().index(), true);'},
					'\u25B6')),
				tag('td',{'class':'remove'},
					tag('a',{href:'javascript:void(0)',
					         title: 'Remove Track',
					         onclick:'$(this).parents("tr").first().remove();'},
					'\u00d7')));
			Magnatune.DnD.draggable(tr, Magnatune.Playlist.DraggableOptions);
			return tr;
		},
		randomAlbum: function (albums) {
			if (!albums) albums = Magnatune.Collection.SortedAlbums;

			var minchoose = Infinity;
			for (var i = 0; i < albums.length; ++ i) {
				var album = albums[i];
				if (!('choose_count' in album)) {
					album.choose_count = minchoose = 0;
				}
				else if (album.choose_count < minchoose) {
					minchoose = album.choose_count;
				}
			}
			var filtered = [];
			for (var i = 0; i < albums.length; ++ i) {
				var album = albums[i];
				if (album.choose_count === minchoose) {
					filtered.push(album);
				}
			}

			var chosen = filtered[Math.round(Math.random() * (filtered.length - 1))];

			chosen.choose_count = (chosen.choose_count||0) + 1;
			
			Magnatune.Collection.withSongs(chosen, function (album) {
				for (var i = 0; i < album.songs.length; ++ i) {
					album.songs[i].albumname = album.albumname;
				}
				Magnatune.Playlist.replace(album.songs,true);
			});
		},
		randomAlbumOfGenre: function (genreName) {
			var genre = Magnatune.Collection.Genres[genreName];
			if (!genre) throw new Error("No such genre: "+genreName);
			this.randomAlbum(genre.albums);
		},
		enqueue: function (songs, index, select) {
			var tbody = $('#playlist > tbody');
			var target;
			if (index !== undefined) {
				target = tbody.find('> tr')[index];
			}

			if (select) this.selectNone();
			if (target) {
				target = $(target);
				for (var i = 0; i < songs.length; ++ i) {
					target.before(this._buildTrack(songs[i],select,i===0));
				}
			}
			else {
				for (var i = 0; i < songs.length; ++ i) {
					tbody.append(this._buildTrack(songs[i],select,i===0));
				}
			}
		},
		_scroll_state: 'none',
		dropIndex: function () {
			var playlist = $('#playlist');
			var target = playlist.find('.drop');
			var before = target.hasClass('before');

			if (target.length > 0) {
				if (target.parent().is('thead')) {
					return 0;
				}
				else if (before) {
					return target.index();
				}
				else {
					return target.index() + 1;
				}
			}

			return playlist.find('> tbody > tr').length;
		},
		_dragend: function (event) {
			($('#playlist .drop').
				removeClass('drop').
				removeClass('before').
				removeClass('after'));
			if (Magnatune.Playlist._scroll_state !== "none") {
				$('#playlist-container .tab-content').stop(true);
				Magnatune.Playlist._scroll_state = "none";
			}
		},
		_dragover: function (event) {
			var playlist = $('#playlist');
			var container = playlist.parent();
			var container_el = container[0];
			var track, before = false;
			var tbody = playlist.find('> tbody');
			var pos = tbody.offset();
			var y = event.pageY;
			var x = event.pageX;
			var container_top = container.offset().top;
			var container_bottom = container_top + container_el.offsetHeight;
			var new_state = "none";

			if (y >= container_top - 5 && y <= container_top + 30) {
				if (container_el.scrollTop > 0) {
					new_state = "up";

					if (Magnatune.Playlist._scroll_state !== "up") {
						container.stop(true).animate({scrollTop: 0}, {
							duration: container_el.scrollTop * 5
						});
					}
				}
			}
			else if (y <= container_bottom + 5 && y >= container_bottom - 30) {
				var endpos = container_el.scrollHeight - container_el.offsetHeight;
				var scroll_top = container_el.scrollTop;
				if (scroll_top < endpos) {
					new_state = "down";

					if (Magnatune.Playlist._scroll_state !== "down") {
						container.stop(true).animate({scrollTop: endpos}, {
							duration: (endpos - scroll_top) * 5
						});
					}
				}
			}

			if (new_state === "none" && Magnatune.Playlist._scroll_state !== "none") {
				container.stop(true);
			}

			Magnatune.Playlist._scroll_state = new_state;
			
			if (!Magnatune.TouchDevice && (track = $(event.target).closest('tr')) && track.parent().parent().is(playlist)) {
				// on browsers that support "pointer-events: none"
				if (track.parent().is("thead")) {
					var first_track = tbody.find("> tr:first");
					if (first_track.length === 0) {
						before = false;
					}
					else {
						before = true;
						track = first_track;
					}
				}
				else {
					var track_pos = track.offset();
					var track_height = track.outerHeight();
					if (y > (track_pos.top + track_height * 0.5)) {
						before = false;
					}
					else {
						var prev = track.prev();
						if (prev.length > 0) {
							before = false;
							track = prev;
						}
						else {
							before = true;
						}
					}
				}
			}
			else if (x < pos.left || x > (pos.left + playlist.outerWidth()) || !$('#playlist-container').is(':visible')) {
				track = $();
			}
			else if (y <= pos.top) {
				if (y < container_top) {
					track = $();
				}
				else {
					track = tbody.find('> tr:first');
					if (track.length === 0) {
						track = playlist.find('> thead > tr');
						before = false;
					}
					else {
						before = true;
					}
				}
			}
			else if (y >= (pos.top + tbody.outerHeight())) {
				if (y > container_top + container.outerHeight()) {
					track = $();
				}
				else {
					before = false;
					track = tbody.find('> tr:last');
					if (track.length === 0) {
						track = playlist.find('> thead > tr');
					}
				}
			}
			else if (Magnatune.TouchDevice || $(event.target).closest('.dragged').length > 0) {
				// fallback for browsers that do not support "pointer-events: none"
				var tracks = tbody.find('> tr');
				
				// binary search:
				var start = 0;
				var end = tracks.length;
				while (start !== end) {
					var index = Math.floor((start + end) * 0.5);
					track = $(tracks[index]);
					var track_pos = track.offset();
					var track_height = track.height();
					
					if (y < track_pos.top) {
						end = index;
					}
					else if (y > (track_pos.top + track_height)) {
						start = index + 1;
					}
					else {
						if (y > (track_pos.top + track_height * 0.5)) {
							before = false;
						}
						else if (index > 0) {
							before = false;
							track = $(tracks[index-1]);
						}
						else {
							before = true;
						}
						break;
					}
				}
				if (start === end) track = $();
			}
			(playlist.find('> * > tr.drop').
				removeClass('drop').
				removeClass('before').
				removeClass('after'));
			track.addClass(before ? 'drop before' : 'drop after');
		},
		DraggableOptions: {
			visual: true,
			distance: 4,
			create: function (event) {
				return {
					render: function () {
						var playlist = $('#playlist');
						var track = $(this);
						var selection;
						if (!track.hasClass('selected')) {
							playlist.find('> tbody > tr.selected').removeClass('selected').removeClass('selection-start');
							track.addClass('selected selection-start');
							selection = track;
						}
						else {
							selection = playlist.find('> tbody > tr.selected');
						}

						return tag('table',{'class':'playlist',
							style:{width:playlist.width()+'px'}},
							tag('tbody',selection.clone()));
					},
					drag: Magnatune.Playlist._dragover,
					drop: function (event) {
						Magnatune.Playlist._moveSelected($('#playlist .drop'));
						Magnatune.Playlist._dragend(event);
					},
					cancel: Magnatune.Playlist._dragend
				};
			}
		},
		replace: function (songs, forceplay, select) {
			this.clear();
			this.enqueue(songs, undefined, select);
			if (forceplay) this.setCurrentIndex(0, forceplay);
		},
		clear: function () {
			$('#playlist > tbody').empty();
		},
		songs: function () {
			return this._songs('#playlist > tbody > tr');
		},
		selected: function () {
			return this._songs('#playlist > tbody > tr.selected');
		},
		removeSelected: function () {
			$('#playlist > tbody > tr.selected').remove();
		},
		moveSelected: function (index) {
			var tracks = $('#playlist > tbody > tr');
			if (tracks.length > 0) {
				var target, before;
				if (index >= tracks.length) {
					target = $(tracks[tracks.length-1]);
					before = false;
				}
				else {
					target = $(tracks[index < 0 ? 0 : index]);
					before = true;
				}
				this._moveSelected(target, before);
			}
		},
		_moveSelected: function (target, before) {
			if (target.length > 0) {
				var tbody = $('#playlist > tbody');
				var selection = tbody.find('> tr.selected');
				if (target.parent().is('thead')) {
					tbody.append(selection);
				}
				else {
					var realTarget = target;
					if (before === undefined) {
						before = target.hasClass('before');
					}
					if (realTarget.is('.selected')) {
						realTarget = realTarget.prevAll(':not(.selected):first');
						if (realTarget.length === 0) {
							realTarget = target.nextAll(':not(.selected):first');
							before = true;
						}
						else {
							before = false;
						}
					}
					if (realTarget.length > 0) {
						if (before) {
							selection.insertBefore(realTarget);
						}
						else {
							selection.insertAfter(realTarget);
						}
					}
				}
			}
		},
		showCurrent: function () {
			var current = $('#playlist .current')[0];
			if (current) {
				if (current.scrollIntoViewIfNeeded) {
					current.scrollIntoViewIfNeeded();
				}
				else {
					current.scrollIntoView();
				}
			}
		},
		_songs: function (selector) {
			var rows = $(selector);
			var songs = [];
			for (var i = 0; i < rows.length; ++ i) {
				var song = $(rows[i]).dataset();
				song.number = parseInt(song.number,10);
				song.duration = parseFloat(song.duration);
				songs.push(song);
			}
			return songs;
		},
		_song: function (selector) {
			var row = $(selector);
			if (row.length === 0) {
				return null;
			}
			var song = row.dataset();
			song.number = parseInt(song.number,10);
			song.duration = parseFloat(song.duration);
			return song;
		},
		first: function () {
			return this._song('#playlist > tbody > tr:first');
		},
		last: function () {
			return this._song('#playlist > tbody > tr:last');
		},
		current: function () {
			return this._song('#playlist > tbody > tr.current');
		},
		currentIndex: function () {
			return $('#playlist > tbody > tr.current').index();
		},
		setCurrentIndex: function (index,forceplay) {
			var playlist = $("#playlist");
			var current = playlist.find("> tbody > tr")[index];
			playlist.find("> tbody > tr.current").removeClass("current");
			if (current) {
				$(current).addClass('current');
			}
			this._updatePlayer(forceplay);
		},
		_updatePlayer: function (forceplay) {
			if (forceplay || Magnatune.Player.playing()) {
				Magnatune.Player.play(true);
			}
			else {
				Magnatune.Player._update(true);
			}
		},
		length: function () {
			return $('#playlist > tbody > tr').length;
		},
		next: function (forceplay) {
			var tbody = $('#playlist > tbody');
			var current = tbody.find('> tr.current');

			var next;
			if (current.length === 0) {
				next = tbody.find('> tr:first');
			}
			else {
				next = current.next();
			}

			current.removeClass('current');
			next.addClass('current');
			this._updatePlayer(forceplay);
		},
		previous: function (forceplay) {
			var tbody = $('#playlist > tbody');
			var current = tbody.find('> tr.current');

			var prev;
			if (current.length === 0) {
				prev = tbody.find('> tr:last');
			}
			else {
				prev = current.prev();
			}

			current.removeClass('current');
			prev.addClass('current');
			this._updatePlayer(forceplay);
		}
	},
	Collection: {
		_state: 'init',
		GenreNameSorter: function (a, b) {
			return a.genre < b.genre ? -1 : a.genre > b.genre ? 1 : 0;
		},
		ArtistNameSorter: function (a,b) {
			return a.artist < b.artist ? -1 : a.artist > b.artist ? 1 : 0;
		},
		AlbumNameSorter: function  (a,b) {
			return a.albumname < b.albumname ? -1 : a.albumname > b.albumname ? 1 : 0;
		},
		ArtistDateSorter: function (a,b) {
			return b.latestdate - a.latestdate;
		},
		AlbumDateSorter: function (a,b) {
			return b.launchdate - a.launchdate;
		},
		request: function (opts) {
			return $.ajax({
				url: 'cgi-bin/query.cgi',
				data: $.extend({changed:this.Changed}, opts.args),
				dataType: 'json',
				success: function (data) {
					if (data.head && data.head.changed != Magnatune.Collection.Changed) {
						$.extend(Magnatune.Collection, Magnatune.Collection.build(data.head.index));
						Magnatune.Collection.Changed = data.head.changed;
						Magnatune.Navigation.FilterInput.update();
					}
					if (opts.success) {
						opts.success.call(this,data);
					}
				},
				error:    opts.error,
				complete: opts.complete
			});
		},
		load: function () {
			if (this._state !== 'init') {
				throw new Error('illegal state');
			}

			this._state = 'loading';
			$.ajax({
				url: 'cgi-bin/query.cgi',
				data: {action: 'index'},
				dataType: 'json',
				success: function (data) {
					$.extend(Magnatune.Collection, Magnatune.Collection.build(data.body));
					Magnatune.Collection.Changed = data.head.changed;

					Magnatune.Collection._state = 'ready';
					Magnatune.Collection.trigger('ready');
				},
				error: function (request, textStatus, errorThrown) {
					alert(errorHeadline(textStatus, errorThrown)+
						"\n\nCannot receive album index from server.");
				}
			});
		},
		build: function (data) {
			var C = {};

			var sorted_artists = C.SortedArtists = data.artists;
			var sorted_genres  = C.SortedGenres  = data.genres;
			var sorted_albums  = C.SortedAlbums  = data.albums;
					
			var artists = C.Artists = {};
			var genres  = C.Genres  = {};
			var albums  = C.Albums  = {};

			// resolve associations
			for (var i = 0; i < sorted_artists.length; ++ i) {
				var artist = {
					artist: sorted_artists[i],
					albums: [],
					genres: {}
				};
				sorted_artists[i] = artists[artist.artist] = artist;
			}
					
			for (var i = 0; i < sorted_albums.length; ++ i) {
				var album = sorted_albums[i];
				var artist = album.artist = artists[album.artist];
				album.genres = [];
				artist.albums.push(album);
				albums[album.albumname] = album;
			}

			for (var i = 0; i < sorted_genres.length; ++ i) {
				var genre = sorted_genres[i];
				var genre_artists = {};
				for (var j = 0; j < genre.albums.length; ++ j) {
					var album = genre.albums[j] = albums[genre.albums[j]];
					album.genres.push(genre);
					genre_artists[album.artist.artist] = album.artist;
					album.artist.genres[genre.genre] = genre;
				}
				genre.artists = [];
				for (var artist_name in genre_artists) {
					genre.artists.push(genre_artists[artist_name]);
				}
				genre.artists.sort(this.ArtistNameSorter);
				genres[genre.genre] = genre;
			}
			
			for (var i = 0; i < sorted_artists.length; ++ i) {
				var artist = sorted_artists[i];
				var artist_genres = artist.genres;
				artist.genres = [];
				for (var genre_name in artist_genres) {
					artist.genres.push(genres[genre_name]);
				}
				artist.genres.sort(this.GenreNameSorter);
				var latestdate = -Infinity;
				for (var j = 0; j < artist.albums.length; ++ j) {
					var launchdate = artist.albums[j].launchdate;
					if (launchdate > latestdate) {
						latestdate = launchdate;
					}
				}
				artist.latestdate = latestdate;
			}

			return C;
		},
		ready: function (f) {
			if (this._state === 'ready') {
				f.call(this);
			}
			else {
				this.on('ready',f);
			}
		},
		withSongs: function (album, callback) {
			if (typeof(album) === "string") {
				var albumname = album;
				album = Magnatune.Collection.Albums[album];
				if (!album) {
					alert("Album \u00bb"+albumname+"\u00ab was not found.");
					return;
				}
			}
			if (album.songs) {
				callback(album);
			}
			else {
				Magnatune.Collection.request({
					args: {action: 'album', name: album.albumname},
					success: function (data) {
						if (!data.body) {
							alert("Album \u00bb"+album.albumname+"\u00ab was not found.");
							return;
						}
						callback(data.body);
					},
					error: function (request, textStatus, errorThrown) {
						alert(errorHeadline(textStatus, errorThrown)+
							"\n\nCannot receive information of album \u00bb"+
							album.albumname+"\u00ab.\n");
					}
				});
			}
		}
	},
	Navigation: {
		show: function (skipAnimation) {
			if (skipAnimation) {
				$('#content').stop().css({left:'390px'});
				$('#navigation').stop().css({left:'10px'});
			}
			else {
				var d = Magnatune.Options.AnimationDuration;
				$('#content').stop().animate({left:'390px'},d);
				$('#navigation').stop().animate({left:'10px'},d);
			}
			$('#navigation-hide').show();
			$('#navigation-show').hide();
		},
		hide: function (skipAnimation) {
			if (skipAnimation) {
				$('#content').stop().css({left:'20px'});
				$('#navigation').stop().css({left:'-360px'});
			}
			else {
				var d = Magnatune.Options.AnimationDuration;
				$('#content').stop().animate({left:'20px'},d);
				$('#navigation').stop().animate({left:'-360px'},d);
			}
			$('#navigation-hide').hide();
			$('#navigation-show').show();
		},
		visible: function () {
			return $('#navigation-hide').is(':visible');
		},
		clear: function () {
			this.filter('');
		},
		sortedGenres: function () {
			return Magnatune.Collection.SortedGenres;
		},
		sortedArtists: function () {
			if (this.order() === "name") {
				return Magnatune.Collection.SortedArtists;
			}
			else {
				var artists = Magnatune.Collection.SortedArtists.slice();
				artists.sort(Magnatune.Collection.ArtistDateSorter);
				return artists;
			}
		},
		sortedAlbums: function () {
			if (this.order() === "name") {
				return Magnatune.Collection.SortedAlbums;
			}
			else {
				var albums = Magnatune.Collection.SortedAlbums.slice();
				albums.sort(Magnatune.Collection.AlbumDateSorter);
				return albums;
			}
		},
		genreSorter: function () {
			return Magnatune.Collection.GenreNameSorter;
		},
		artistSorter: function () {
			if (this.order() === "name") {
				return Magnatune.Collection.ArtistNameSorter;
			}
			else {
				return Magnatune.Collection.ArtistDateSorter;
			}
		},
		albumSorter: function () {
			if (this.order() === "name") {
				return Magnatune.Collection.AlbumNameSorter;
			}
			else {
				return Magnatune.Collection.AlbumDateSorter;
			}
		},
		FilterInput: {
			timer: null,
			Delay: 500,
			update: function () {
				if (Magnatune.Navigation.FilterInput.timer !== null) {
					clearTimeout(Magnatune.Navigation.FilterInput.timer);
				}
				Magnatune.Navigation.filter($('#search').val());
			},
			delayedUpdate: function () {
				if (Magnatune.Navigation.FilterInput.timer !== null) {
					clearTimeout(Magnatune.Navigation.FilterInput.timer);
				}
				Magnatune.Navigation.FilterInput.timer = setTimeout(function () {
					Magnatune.Navigation.filter($('#search').val());
				}, Magnatune.Navigation.FilterInput.Delay);
			}
		},
		_filter_request: null,
		filter: function (query) {
			// TODO: keep expansion state and scroll position
			query = query.trim();
			$('#search').val(query);
			var tree = $('#tree');
			if (this._filter_request) {
				try {
					this._filter_request.abort();
				}
				catch (e) {
					console.error(e);
				}
			}
			switch (this.mode()) {
				case 'album':
					this._filter_request = Magnatune.Navigation.Modes.Album.filter(tree, query);
					break;

				case 'artist/album':
					this._filter_request = Magnatune.Navigation.Modes.ArtistAlbum.filter(tree, query);
					break;

				case 'genre/album':
					this._filter_request = Magnatune.Navigation.Modes.GenreAlbum.filter(tree, query);
					break;

				case 'genre/artist/album':
					this._filter_request = Magnatune.Navigation.Modes.GenreArtistAlbum.filter(tree, query);
					break;

				default:
					this._filter_request = null;
			}
		},
		loadVisibleImages: function () {
			loadVisibleImages($("#tree"));
		},
		Modes: {
			_requestComplete: function (request) {
				Magnatune.Navigation._filter_request = null;
			},
			_tooShort: function (tree) {
				tree.append(tag('div',{'class':'error tooshort'},"Search term(s) are to short."));
			},
			_noResults: function (tree) {
				tree.append(tag('div',{'class':'error empty'},"No results found."));
			},
			_ajaxError: function (tree,textStatus,errorThrown) {
				tree.append(tag('div',{'class':'error ajaxerror'},errorHeadline(textStatus,errorThrown)+"."));
			},
			GenreArtistAlbum: {
				render: function (parent, genres) {
					function album_filter (album) {
						for (var i = 0; i < album.genres.length; ++ i) {
							if (album.genres[i].genre === this.genre) {
								return true;
							}
						}
						return false;
					}

					var list = $(tag('ul',{'class':'genres'}));

					for (var i = 0; i < genres.length; ++ i) {
						var genre = genres[i];
						var hash = '#/genre/'+encodeURIComponent(genre.genre);
						list.append(tag.expander({
							label: genre.genre,
							head_attrs: {
								href: hash,
								onclick: Magnatune.Info.load.bind(Magnatune.Info,hash,{keeptab:true})
							},
							render: function (parent) {
								var artists = this.artists.slice();
								artists.sort(Magnatune.Navigation.artistSorter());
								Magnatune.Navigation.Modes.ArtistAlbum.render(parent, artists, album_filter.bind(this));
							}.bind(genre)
						}));
					}

					$(parent).append(list);
				},
				filter: function (parent, query) {
					if (!query) {
						parent.empty();
						this.render(parent, Magnatune.Collection.SortedGenres);
						Magnatune.Navigation.loadVisibleImages();
					}
					else {
						return Magnatune.Collection.request({
							args: {action: 'search', query: query, mode: 'genre/artist/album'},
							success: function (data) {
								parent.empty();
								if (!data.body) {
									Magnatune.Navigation.Modes._tooShort(parent);
									return;
								}

								function add_artist (artist,artist_genres) {
									artists[artist.artist] = artist;
									for (var j = 0; j < artist_genres.length; ++ j) {
										var genre = artist_genres[j];
										if (Object.prototype.hasOwnProperty.call(genres, genre.genre)) {
											genres[genre.genre].artists.push(artist);
										}
										else {
											var new_genre = genres[genre.genre] = {
												genre: genre.genre,
												artists: [artist]
											};
										}
									}
								}

								function add_album (album,artist) {
									var new_artist;
									albums[album.albumname] = album;
									if (Object.prototype.hasOwnProperty.call(artists, artist.artist)) {
										new_artist = artists[artist.artist];
										new_artist.albums.push(album);
									}
									else {
										new_artist = {
											artist: artist.artist,
											albums: [album]
										};
										add_artist(new_artist, album.genres);
									}
									return new_artist;
								}

								var genres  = {};
								var artists = {};
								var albums  = {};
								
								for (var i = 0; i < data.body.genres.length; ++ i) {
									var genre = Magnatune.Collection.Genres[data.body.genres[i]];
									genres[genre.genre] = genre;
								}

								for (var i = 0; i < data.body.artists.length; ++ i) {
									var artist = Magnatune.Collection.Artists[data.body.artists[i]];
									add_artist(artist,artist.genres);
								}

								for (var i = 0; i < data.body.albums.length; ++ i) {
									var album = Magnatune.Collection.Albums[data.body.albums[i]];
									add_album(album,album.artist);
								}

								for (var albumname in data.body.songs) {
									var album = Magnatune.Collection.Albums[albumname];
									var new_album = {
										albumname: albumname,
										songs: data.body.songs[albumname],
										genres: album.genres,
										launchdate: album.launchdate
									};
									new_album.artist = add_album(new_album,album.artist);
								}

								var sorted_genres = [];
								for (var genre in genres) {
									sorted_genres.push(genres[genre]);
								}

								if (sorted_genres.length === 0) {
									Magnatune.Navigation.Modes._noResults(parent);
								}
								else {
									sorted_genres.sort(Magnatune.Navigation.genreSorter());
									Magnatune.Navigation.Modes.GenreArtistAlbum.render(parent, sorted_genres);
									Magnatune.Navigation.loadVisibleImages();
								}
							},
							error: function (request, textStatus, errorThrown) {
								if (textStatus === "abort") return;
								parent.empty();
								Magnatune.Navigation.Modes._ajaxError(parent, textStatus, errorThrown);
							},
							complete: Magnatune.Navigation.Modes._requestComplete
						});
					}
				}
			},
			ArtistAlbum: {
				render: function (parent, artists, album_filter) {
					var list = $(tag('ul',{'class':'artists'}));

					for (var i = 0; i < artists.length; ++ i) {
						var artist = artists[i];
						var hash = '#/artist/'+encodeURIComponent(artist.artist);
						list.append(tag.expander({
							label: artist.artist,
							head_attrs: {
								href: hash,
								onclick: Magnatune.Info.load.bind(Magnatune.Info,hash,{keeptab:true}),
								title: artist.artist
							},
							render: function (parent) {
								var albums = album_filter ? this.albums.filter(album_filter) : this.albums.slice();
								albums.sort(Magnatune.Navigation.albumSorter());
								Magnatune.Navigation.Modes.Album.render(parent, albums);
							}.bind(artist),
							rendered: Magnatune.Navigation.loadVisibleImages
						}));
					}

					$(parent).append(list);
				},
				filter: function (parent, query) {
					if (!query) {
						parent.empty();
						this.render(parent, Magnatune.Navigation.sortedArtists());
						Magnatune.Navigation.loadVisibleImages();
					}
					else {
						return Magnatune.Collection.request({
							args: {action: 'search', query: query, mode: 'artist/album'},
							success: function (data) {
								parent.empty();
								if (!data.body) {
									Magnatune.Navigation.Modes._tooShort(parent);
									return;
								}

								function add_album (album,artist) {
									var new_artist;
									albums[album.albumname] = album;
									if (Object.prototype.hasOwnProperty.call(artists, artist.artist)) {
										new_artist = artists[artist.artist];
										new_artist.albums.push(album);
									}
									else {
										new_artist = {
											artist: artist.artist,
											albums: [album]
										};
										artists[artist.artist] = new_artist;
									}
									return new_artist;
								}

								var artists = {};
								var albums  = {};
							
								for (var i = 0; i < data.body.artists.length; ++ i) {
									var artist = Magnatune.Collection.Artists[data.body.artists[i]];
									artists[artist.artist] = artist;
								}

								for (var i = 0; i < data.body.albums.length; ++ i) {
									var album = Magnatune.Collection.Albums[data.body.albums[i]];
									add_album(album,album.artist);
								}

								for (var albumname in data.body.songs) {
									var album = Magnatune.Collection.Albums[albumname];
									var new_album = {
										albumname: albumname,
										songs: data.body.songs[albumname],
										launchdate: album.launchdate
									};
									new_album.artist = add_album(new_album,album.artist);
								}

								var sorted_artists = [];
								for (var artist in artists) {
									sorted_artists.push(artists[artist]);
								}

								if (sorted_artists.length === 0) {
									Magnatune.Navigation.Modes._noResults(parent);
								}
								else {
									sorted_artists.sort(Magnatune.Navigation.artistSorter());
									Magnatune.Navigation.Modes.ArtistAlbum.render(parent, sorted_artists);
									Magnatune.Navigation.loadVisibleImages();
								}
							},
							error: function (request, textStatus, errorThrown) {
								if (textStatus === "abort") return;
								parent.empty();
								Magnatune.Navigation.Modes._ajaxError(parent, textStatus, errorThrown);
							},
							complete: Magnatune.Navigation.Modes._requestComplete
						});
					}
				}
			},
			GenreAlbum: {
				render: function (parent, genres) {
					function album_filter (album) {
						for (var i = 0; i < album.genres.length; ++ i) {
							if (album.genres[i].genre === this.genre) {
								return true;
							}
						}
						return false;
					}

					var list = $(tag('ul',{'class':'genres'}));

					for (var i = 0; i < genres.length; ++ i) {
						var genre = genres[i];
						var hash = '#/genre/'+encodeURIComponent(genre.genre);
						list.append(tag.expander({
							label: genre.genre,
							head_attrs: {
								href: hash,
								onclick: Magnatune.Info.load.bind(Magnatune.Info,hash,{keeptab:true})
							},
							render: function (parent) {
								var albums = this.albums.filter(album_filter.bind(this));
								albums.sort(Magnatune.Navigation.albumSorter());
								Magnatune.Navigation.Modes.Album.render(parent, albums);
							}.bind(genre),
							rendered: Magnatune.Navigation.loadVisibleImages
						}));
					}

					$(parent).append(list);
				},
				filter: function (parent, query) {
					if (!query) {
						parent.empty();
						this.render(parent, Magnatune.Collection.SortedGenres);
						Magnatune.Navigation.loadVisibleImages();
					}
					else {
						return Magnatune.Collection.request({
							args: {action: 'search', query: query, mode: 'genre/artist/album'},
							success: function (data) {
								parent.empty();
								if (!data.body) {
									Magnatune.Navigation.Modes._tooShort(parent);
									return;
								}
								
								function add_album (album) {
									albums[album.albumname] = album;

									for (var i = 0; i < album.genres.length; ++ i) {
										var genre = album.genres[i];
										if (Object.prototype.hasOwnProperty.call(genres, genre.genre)) {
											genres[genre.genre].albums.push(album);
										}
										else {
											var new_genre = genres[genre.genre] = {
												genre: genre.genre,
												albums: [album]
											};
										}
									}
								}

								var genres = {};
								var albums = {};
								
								for (var i = 0; i < data.body.genres.length; ++ i) {
									var genre = Magnatune.Collection.Genres[data.body.genres[i]];
									genres[genre.genre] = genre;
								}
								
								for (var i = 0; i < data.body.albums.length; ++ i) {
									var album = Magnatune.Collection.Albums[data.body.albums[i]];
									add_album(album);
								}

								for (var albumname in data.body.songs) {
									var album = Magnatune.Collection.Albums[albumname];
									var new_album = {
										albumname: albumname,
										artist: album.artist,
										songs: data.body.songs[albumname],
										genres: album.genres,
										launchdate: album.launchdate
									};
									add_album(new_album);
								}
								
								var sorted_genres = [];
								for (var genre in genres) {
									sorted_genres.push(genres[genre]);
								}

								if (sorted_genres.length === 0) {
									Magnatune.Navigation.Modes._noResults(parent);
								}
								else {
									sorted_genres.sort(Magnatune.Navigation.genreSorter());
									Magnatune.Navigation.Modes.GenreAlbum.render(parent, sorted_genres);
									Magnatune.Navigation.loadVisibleImages();
								}
							},
							error: function (request, textStatus, errorThrown) {
								if (textStatus === "abort") return;
								parent.empty();
								Magnatune.Navigation.Modes._ajaxError(parent, textStatus, errorThrown);
							},
							complete: Magnatune.Navigation.Modes._requestComplete
						});
					}
				}
			},
			Album: {
				render: function (parent, albums) {
					var list = $(tag('ul',{'class':'albums'}));

					for (var i = 0; i < albums.length; ++ i) {
						var album = albums[i];
						var launchdate = new Date();
						launchdate.setTime(album.launchdate * 1000);
						launchdate = '('+launchdate.getFullYear()+')';
						var label = tag('table',
							{'class':'album',dataset:{albumname:album.albumname}},
							tag('tbody',
								tag('tr',
									tag('td',
										tag('img',{
											alt:'',draggable:false,
											'data-src':'http://he3.magnatune.com/music/'+
												encodeURIComponent(album.artist.artist)+'/'+
												encodeURIComponent(album.albumname)+'/cover_50.jpg'})),
									tag('td',{'class':'albumname'},album.albumname),
									tag('td',{'class':'launchdate'}, launchdate))));
						Magnatune.DnD.draggable(label, Magnatune.DnD.albumOptions(album));

						var hash = '#/album/'+encodeURIComponent(album.albumname);
						list.append(tag.expander({
							label: label,
							head_attrs: {
								'class': 'album-head',
								href: hash,
								onclick: Magnatune.Info.load.bind(Magnatune.Info,hash,{keeptab:true}),
								ondblclick: Magnatune.Collection.withSongs.bind(Magnatune.Collection, album, function (album) {
									var songs = album.songs;
									for (var i = 0; i < songs.length; ++ i) {
										songs[i].albumname = album.albumname;
									}
									Magnatune.Playlist.replace(songs, true);
								}),
								title: album.albumname+' '+launchdate
							},
							render: function (parent) {
								Magnatune.Collection.withSongs(this, function (album) {
									Magnatune.Navigation.Modes.Song.render(parent, album);
								});
							}.bind(album)
						}));
					}

					$(parent).append(list);
				},
				filter: function (parent, query) {
					if (!query) {
						parent.empty();
						this.render(parent, Magnatune.Navigation.sortedAlbums());
						Magnatune.Navigation.loadVisibleImages();
					}
					else {
						return Magnatune.Collection.request({
							args: {action: 'search', query: query, mode: 'album'},
							success: function (data) {
								parent.empty();
								if (!data.body) {
									Magnatune.Navigation.Modes._tooShort(parent);
									return;
								}

								var sorted_albums = [];
								for (var i = 0; i < data.body.albums.length; ++ i) {
									sorted_albums.push(Magnatune.Collection.Albums[data.body.albums[i]]);
								}

								for (var albumname in data.body.songs) {
									var album = Magnatune.Collection.Albums[albumname];
									var new_album = {
										albumname: albumname,
										songs: data.body.songs[albumname],
										launchdate: album.launchdate
									};
									new_album.artist = Magnatune.Collection.Albums[albumname].artist;
									sorted_albums.push(new_album);
								}

								if (sorted_albums.length === 0) {
									Magnatune.Navigation.Modes._noResults(parent);
								}
								else {
									sorted_albums.sort(Magnatune.Navigation.albumSorter());
									Magnatune.Navigation.Modes.Album.render(parent, sorted_albums);
									Magnatune.Navigation.loadVisibleImages();
								}
							},
							error: function (request, textStatus, errorThrown) {
								if (textStatus === "abort") return;
								parent.empty();
								Magnatune.Navigation.Modes._ajaxError(parent, textStatus, errorThrown);
							},
							complete: Magnatune.Navigation.Modes._requestComplete
						});
					}
				}
			},
			Song: {
				render: function (parent, album) {
					var list = $(tag('ul',{'class':'songs'}));

					for (var i = 0; i < album.songs.length; ++ i) {
						var song = album.songs[i];
						song.albumname = album.albumname;
						var item = tag('li', {
							dataset:song,
							title:song.desc,
							ondblclick: Magnatune.Playlist.replace.bind(Magnatune.Playlist,[song],true)},
							song.desc);
						Magnatune.DnD.draggable(item, Magnatune.DnD.SongOptions);
						list.append(item);
					}

					$(parent).append(list);
				}
			}
		},
		setMode: function (mode) {
			this._setMode(mode);
			this.filter($('#search').val());
		},
		_setMode: function (mode) {
			mode = mode.trim().toLowerCase();
			$('#tree-mode-select').hide();
			
			switch (mode) {
				case 'album':
				case 'artist/album':
				case 'genre/album':
				case 'genre/artist/album':
					$('#tree-mode-select li.active').removeClass('active');
					$('#mode-'+mode.replace(/\//g,'-')).addClass('active');
					break;

				default:
					throw new Error("Illegal mode: "+mode);
			}
		},
		setOrder: function (order) {
			this._setOrder(order);
			this.filter($('#search').val());
		},
		_setOrder: function (order) {
			order = order.trim().toLowerCase();
			$('#tree-order-select').hide();

			switch (order) {
				case 'name':
				case 'date':
					$('#tree-order-select li.active').removeClass('active');
					$('#order-by-'+order).addClass('active');
					break;

				default:
					throw new Error("Illegal order: "+order);
			}
		},
		setConfig: function (order, mode) {
			this._setOrder(order);
			this._setMode(mode);
			this.filter($('#search').val());
		},
		mode: function () {
			return $('#tree-mode-select li.active').attr('id').replace(/^mode-/,'').replace(/-/g,'/');
		},
		order: function () {
			return $('#tree-order-select li.active').attr('id').replace(/^order-by-/,'');
		},
		showModeSelect: function () {
			showPopup($('#tree-mode-button'),$('#tree-mode-select'));
		},
		hideModeSelect: function () {
			$('#tree-mode-select').fadeOut('fast');
		},
		toggleModeSelect: function () {
			if ($('#tree-mode-select').is(':visible')) {
				this.hideModeSelect();
			}
			else {
				this.showModeSelect();
			}
		},
		showOrderSelect: function () {
			showPopup($('#tree-order-button'),$('#tree-order-select'));
		},
		hideOrderSelect: function () {
			$('#tree-order-select').fadeOut('fast');
		},
		toggleOrderSelect: function () {
			if ($('#tree-order-select').is(':visible')) {
				this.hideOrderSelect();
			}
			else {
				this.showOrderSelect();
			}
		}
	},
	showHash: function () {
		if (window.location.hash && Magnatune.Info.hash() === window.location.hash) {
			if (!Magnatune.Info.visible()) {
				Magnatune.Info.show();
			}
			return true;
		}
		else {
			return Magnatune.Info.load(window.location.hash);
		}
	},
	DnD: {
		touch: null,
		relatedTouch: function (event) {
			for (var i = 0; i < event.changedTouches.length; ++ i) {
				var touch = event.changedTouches[i];
				if (this.touch === touch.identifier) {
					return touch;
				}
			}
			return null;
		},
		convertEvent: function (event) {
			var type, touch, detail;

			switch (event.type) {
				case "touchstart":
					if (event.touches.length !== 1) return null;
					detail = 1;
					type = "mousedown";
					touch = event.changedTouches[0];
					this.touch = touch.identifier;
					break;

				case "touchmove":
					touch = this.relatedTouch(event);
					if (!touch) return null;
					if (event.touches.length === 1) {
						detail = 0;
						type = "mousemove";
					}
					else {
						detail = 1;
						type = "mouseup";
						this.touch = null;
					}
					break;

				case "touchend":
				case "touchcancel":
					touch = this.relatedTouch(event);
					if (!touch) return null;
					detail = 1;
					type = "mouseup";
					this.touch = null;
					break;

				default:
					return event;
			}

			// I don't need a real event anyway
			return $.Event(event, {
				target: touch.target, // not the target I want but the only one I can get
				type: type,
				detail: detail,
				eventType: 'on'+type, // IE
				button:   $.browser.msie ? 1 : 0,
				buttons:  1,
				screenX:  touch.screenX,
				screenY:  touch.screenY,
				clientX:  touch.clientX,
				clientY:  touch.clientY,
				pageX:    touch.pageX,
				pageY:    touch.pageY,
				ctrlKey:  !!event.ctrlKey,
				altKey:   !!event.altKey,
				shiftKey: !!event.shiftKey,
				metaKey:  !!event.metaKey
			});
		},
		source:  null,
		handler: null,
		draggable: function (element, options) {
			$(element).on('selectstart', function (event) {
				// IE
				if (!options.condition || options.condition(event)) {
					event.preventDefault();
				}
			}).addClass('draggable').on(Magnatune.TouchDevice ? 'touchstart' : 'mousedown', function (event) {
				if (Magnatune.DnD.source) return;

				if (event.type === 'touchstart') {
					event = Magnatune.DnD.convertEvent(event.originalEvent);
					if (!event) return;
				}
				else if (event.which !== 1) {
					return;
				}
				else if (options.condition && !options.condition(event)) {
					return;
				}
				else {
					event.preventDefault();
				}

				Magnatune.DnD.source = this;

				if (options.distance) {
					var startEvent = event;
					Magnatune.DnD.handler = {
						drag: function (event) {
							var dx = event.pageX - startEvent.pageX;
							var dy = event.pageY - startEvent.pageY;
							if (Math.sqrt(dx * dx + dy * dy) >= options.distance) {
								Magnatune.DnD.start.call(this,startEvent,options);
								if (Magnatune.DnD.handler.drag) {
									Magnatune.DnD.handler.drag.call(this,event);
								}
							}
						}
					};
				}
				else {
					Magnatune.DnD.start.call(this,event,options);
				}
			});
			element = null;
		},
		start: function (event, options) {
			var offset = $(this).offset();
			var handler = options.create.call(this,event);
			if (!handler) {
				Magnatune.DnD.source = null;
			}
			else if (options.visual || (!('visual' in options) && handler.render)) {
				if (handler.render) {
					Magnatune.DnD.element = $(handler.render.call(this));
					Magnatune.DnD.element.addClass('dragged').css({
						left: offset.left+'px',
						top:  offset.top+'px'
					});
				}
				else {
					var clone = this.cloneNode(true);
					if ($.nodeName(clone,'td')) {
						clone = tag('table',tag('tbody',tag('tr',clone)));
					}
					else if ($.nodeName(clone,'th')) {
						clone = tag('table',tag('thead',tag('tr',clone)));
					}
					else if ($.nodeName(clone,'tr')) {
						clone = tag('table',tag('tbody',clone));
					}
					else if ($.nodeName(clone,'tbody') || $.nodeName(clone,'thead')) {
						clone = tag('table',clone);
					}
					else if ($.nodeName(clone,'li')) {
						clone = tag('ul',clone);
					}
					Magnatune.DnD.element = $(clone);
					Magnatune.DnD.element.addClass('dragged').css({
						left: offset.left+'px',
						top:  offset.top+'px',
						width:  $(this).width()+'px',
						height: $(this).height()+'px'
					});
				}
				offset.left -= event.pageX;
				offset.top  -= event.pageY;
				$(document.body).append(Magnatune.DnD.element);

				Magnatune.DnD.handler = {
					drag: function (event) {
						Magnatune.DnD.element.css({
							left: (event.pageX + offset.left)+'px',
							top:  (event.pageY + offset.top)+'px'
						});
						if (handler.drag) handler.drag.call(this,event);
					},
					drop: function (event) {
						Magnatune.DnD.element.remove();
						Magnatune.DnD.element = null;
						if (handler.drop) handler.drop.call(this,event);
					},
					cancel: function (event) {
						Magnatune.DnD.element.remove();
						Magnatune.DnD.element = null;
						if (handler.cancel) handler.cancel.call(this,event);
					}
				};
			}
			else {
				Magnatune.DnD.handler = handler;
			}
		},
		albumOptions: function (album) {
			return {
				visual: true,
				distance: 4,
				create: function (event) {
					var was_visible = Magnatune.Playlist.visible();
					if (!was_visible) Magnatune.Playlist.show();
					return {
						drag: Magnatune.Playlist._dragover,
						drop: function (event) {
							var playlist = $('#playlist');
							var target = playlist.find('.drop');
							var before = target.hasClass('before');

							if (target.length > 0) {
								Magnatune.Collection.withSongs(album, function (album) {
									var tracks = $();
									var songs = album.songs;
									Magnatune.Playlist.selectNone();
									for (var i = 0; i < songs.length; ++ i) {
										var song = $.extend({},songs[i]);
										song.albumname = album.albumname;
										tracks.push(Magnatune.Playlist._buildTrack(song,true,i===0));
									}
									if (target.parent().is('thead')) {
										playlist.find('> tbody').append(tracks);
									}
									else {
										if (before) {
											tracks.insertBefore(target);
										}
										else {
											tracks.insertAfter(target);
										}
									}
								});
							}
							Magnatune.Playlist._dragend(event);
							if (!was_visible) Magnatune.Info.show();
						},
						cancel: function (event) {
							Magnatune.Playlist._dragend(event);
							if (!was_visible) Magnatune.Info.show();
						}
					};
				}
			};
		},
		SongOptions: {
			visual: true,
			distance: 4,
			create: function (event) {
				var was_visible = Magnatune.Playlist.visible();
				if (!was_visible) Magnatune.Playlist.show();
				var song = $(this).dataset();
				return {
					render: function () {
						return tag('span',song.desc+' - '+song.albumname+' - '+
							Magnatune.Collection.Albums[song.albumname].artist.artist);
					},
					drag: Magnatune.Playlist._dragover,
					drop: function (event) {
						var playlist = $('#playlist');
						var target = playlist.find('.drop');

						if (target.length > 0) {
							Magnatune.Playlist.selectNone();
							var track = $(Magnatune.Playlist._buildTrack(song,true,true));
							if (target.parent().is('thead')) {
								playlist.find('> tbody').append(track);
							}
							else {
								if (target.hasClass('before')) {
									track.insertBefore(target);
								}
								else {
									track.insertAfter(target);
								}
							}
						}
						Magnatune.Playlist._dragend(event);
						if (!was_visible) Magnatune.Info.show();
					},
					cancel: function (event) {
						Magnatune.Playlist._dragend(event);
						if (!was_visible) Magnatune.Info.show();
					}
				};
			}
		}
	},
	BrowserAuthenticates: !$.browser.webkit,
	authenticated: false,
	login: function () {
		var onload, onerror, script, src, onreadystatechange;
		var path = "/info/changed.txt?"+(new Date().getTime());
		if (Magnatune.BrowserAuthenticates) {
			// HTTP Auth hack for Firefox and Opera
			src = "http://stream.magnatune.com"+path;
			onerror = function (event) {
				if (event.originalEvent.target === script) {
					Magnatune.authenticated = false;
					Magnatune.Player.setMember(false);
					$(window).off('error',onerror);
					$(this).off('readystatechange', onreadystatechange).remove();
				}
			};

			onload = function (event) {
				Magnatune.authenticated = true;
				$(window).off('error',onerror);
				$(this).off('readystatechange', onreadystatechange).remove();
			};
		}
		else {
			// HTTP Auth hack for Chrome/WebKit
			// changed.txt just contains a decimal number so it is a valid JavaScript
			// if onload fires this means the login was ok.
			// onerror will be fired if the login was not ok because scripts may not
			// be transferred with the HTTP status 401. And even if they could be
			// transferred that way the returned document contains HTML which would
			// raise a JavaScript SyntaxError and will fire the onerror event on window.
			var username = $('#username').val();
			var password = $('#password').val();

			if (!username || !password) {
				alert("Please enter your username and password.");
				return;
			}

			var spinner = $('#login-spinner');
			var spin = function () {
				spinner.show().rotate({
					angle: 0,
					animateTo: 360,
					easing: function (x,t,b,c,d) {
						return c*(t/d)+b;
					},
					callback: function () {
						if (spinner.is(':visible')) {
							spin();
						}
					}
				});
			};
			spin();

			src = "http://"+encodeURIComponent(username)+":"+
				encodeURIComponent(password)+"@stream.magnatune.com"+path;
			onerror = function (event) {
				if (event.originalEvent.target === script) {
					Magnatune.authenticated = false;
					spinner.hide();
					Magnatune.Player._showCredentials();
					$(window).off('error',onerror);
					$(this).off('readystatechange', onreadystatechange).remove();
					alert("Wrong username or password or connection problem.");
				}
			};

			onload = function (event) {
				Magnatune.authenticated = true;
				Magnatune.Player.hideCredentials();
				$(window).off('error',onerror);
				$(this).off('readystatechange', onreadystatechange).remove();
				if (typeof(localStorage) !== "undefined" && getBoolean('login.remember')) {
					// login.remember is set by hideCredentials
					localStorage.setItem('login.username',username);
					localStorage.setItem('login.password',password);
				}
			};
		}

		$(window).on('error',onerror);

		onreadystatechange = function (event) {
			if (this.readyState === "loaded" || this.readyState === "complete") {
				$(this).off('load',onload).off('error',onerror);
				// cannot detect error in MSIE
				onload.call(this,event);
			}
		};

		script = tag('script',{
			type:'text/javascript',
			src: src,
			onload: onload,
			onerror: onerror,
			onabort: onerror
		});

		if ($.browser.msie) {
			$(script).on('readystatechange',onreadystatechange);
		}

		document.body.appendChild(script);
	},
	Tour: {
		Pages: {
			info: {
				text: "This is the information area. Here is information about genres, albums and artists displayed.",
				context: "#info-content",
				placed: {left: 20, top: 60},
				arrow: 'up',
				next: "collection",
				onshow: function () {
					Magnatune.Info.load('#/about');
					Magnatune.Navigation.setConfig("name","genre/artist/album");
					try { Magnatune.Player.stop(); } catch (e) { console.error(e); }
				}
			},
			collection: {
				text: "Here you can browse the music collection of "+
				      "<a href='http://magnatune.com/' target='_blank'>Magnatune.com</a>.",
				context: "#navigation",
				placed: {left: 300, top: 100},
				arrow: 'left',
				onshow: function () {
					Magnatune.Navigation.show(true);
				},
				next: 'player'
			},
			player: {
				text: "<p>Here you can control music playback.</p>"+
				      "<p>Per default the songs will contain spoken text that prompts you to buy a "+
				      "Magnatune membership. If you are already a member you can check the Member-"+
				      "option and enter your username and password. This setting will become "+
				      "effective for the next song you play.</p>"+
				      "<p>Your username and password will never be sent to anyone else than Magnatune "+
				      "and won't even be cached by this website. However, your browser will "+
				      "only sign-out of Magnatune when you close the last browser window.</p>",
				context: "#player",
				placed: "below",
				onshow: function () {
					Magnatune.Player.show(true);
				},
				next: 'search_hidden'
			},
			search_hidden: {
				text: "<p>Using the search field you can filter the collection. "+
				      "A search term musst be at least 2 characters long.</p>"+
				      "<p>You can order the results alphabetically by name or by the release "+
				      "date of the albums and you can group the results by several different ways.</p>",
				context: '#search',
				placed: 'below',
				onshow: function () {
					Magnatune.Navigation.filter("hidden");
				},
				onbackward: function () {
					Magnatune.Navigation.clear();
				},
				next: 'nav_hidden_sky'
			},
			nav_hidden_sky: {
				text: "When you navigate through the results context information is displayed in the information area.",
				context: "#tree a[href='#/album/Hidden%20Sky']",
				placed: {left: 200},
				arrow: 'left',
				onshow: function () {
					tag.expander.expand("#tree a[href='#/genre/Ambient']");
					tag.expander.expand("#tree a[href='#/artist/Jami%20Sieber']");
					var album = $(this.context);
					tag.expander.expand(album);
					window.location = album.attr("href");
				},
				onbackward: function () {
					tag.expander.collapse("#tree a[href='#/genre/Ambient']");
				},
				next: 'playlist'
			},
			playlist: {
				text: "With this tabs you can switch between the context information and the playlist.",
				context: "#playlist-button a",
				placed: "below",
				onshow: function () {
					Magnatune.Playlist.clear();
					window.location = '#/playlist';
				},
				onbackward: function () {
					window.location = '#/album/Hidden%20Sky';
				},
				next: 'dnd_song'
			},
			dnd_song: {
				text: "You can drag single songs...",
				context: "#tree li[data-desc='Maenam']",
				placed: {left: 200},
				arrow: 'left',
				onshow: function () {
					if (!Magnatune.Playlist.visible()) window.location = '#/playlist';
					Magnatune.Playlist.replace([$(this.context).dataset()]);
				},
				onbackward: function () {
					Magnatune.Playlist.clear();
				},
				next: 'dnd_album'
			},
			dnd_album: {
				text: "...or whole albums from the collection into the playlist.",
				context: "#tree a[href='#/album/Hidden%20Sky']",
				placed: {left: 200},
				arrow: 'left',
				onshow: function () {
					if (!Magnatune.Playlist.visible()) window.location = '#/playlist';
					Magnatune.Playlist.selectNone();
				},
				onforward: function () {
					Magnatune.Collection.withSongs("Hidden Sky", function (album) {
						for (var i = 0; i < album.songs.length; ++ i) {
							album.songs[i].albumname = album.albumname;
						}
						Magnatune.Playlist.enqueue(album.songs, undefined, true);
					});
				},
				onbackward: function () {
					Magnatune.Playlist.remove(1,Magnatune.Playlist.length());
				},
				next: 'select_range'
			},
			html5_dnd: {
				text: "You can drop exported playlists from your file browser directly into "+
				      "this area instead of using the import button.",
				context: "#playlist",
				placed: {left: 20, top: 60},
				arrow: 'up',
				next: 'select_range'
			},
			select_range: {
				text: Magnatune.TouchDevice ?
					"Touch songs to select them." :
					"Click to select a single song. "+
					"Hold <code>Shift</code> and click a second song to select multiple songs.",
				context: '#playlist > tbody > tr[data-desc="Homage"]',
				placed: {left: 200},
				arrow: 'left',
				onshow: function () {
					if (!Magnatune.Playlist.visible()) window.location = '#/playlist';
					Magnatune.Playlist.selectNone();
					Magnatune.Playlist.addSelection(3,8);
				},
				next: 'deselect_one'
			},
			deselect_one: {
				text: Magnatune.TouchDevice ?
					"Touch a song a second time to deselect it." :
					"Hold <code>Ctrl</code> and click to select/deselect single songs.",
				context: '#playlist > tbody > tr[data-desc="Sukhothai Rain"]',
				placed: {left: 200},
				arrow: 'left',
				onshow: function () {
					if (!Magnatune.Playlist.visible()) window.location = '#/playlist';
					Magnatune.Playlist.selectNone();
					Magnatune.Playlist.addSelection(3,8);
					Magnatune.Playlist.removeSelection(4);
				},
				next: 'move_selection'
			},
			move_selection: {
				text: (Magnatune.TouchDevice ?
					"<p>Swipe over the selection and drag the songs to move them. "+
					"Note that you may do all this only with one finger, so you can "+
					"still scroll and zoom using two fingers.</p>" :
					"<p>Click into the selection and drag the songs to move them.</p>")+
					(typeof(localStorage) === "undefined" ? "" :
						"<p>The playlist is remembered in the local storage of your browser "+
						"and will be restored the next time you surf to this website.</p>"),
				context: '#playlist > tbody > tr[data-desc="Homage"]',
				placed: {left: 200},
				arrow: 'left',
				onshow: function () {
					if (!Magnatune.Playlist.visible()) window.location = '#/playlist';
				},
				onforward: function () {
					Magnatune.Playlist.selectNone();
					Magnatune.Playlist.addSelection(3,8);
					Magnatune.Playlist.removeSelection(4);
					Magnatune.Playlist.moveSelected(0);
				},
				onbackward: function () {
					Magnatune.Playlist.move(2,5,8);
					Magnatune.Playlist.move(1,2,4);
				},
				next: Magnatune.TouchDevice ? null : "play_dblclick"
			},
			play_dblclick: {
				text: "Double-click a song to play it.",
				context: '#playlist > tbody > tr[data-desc="Homage"]',
				placed: {left: 200},
				arrow: 'left',
				onshow: function () {
					if (!Magnatune.Playlist.visible()) window.location = '#/playlist';
					try { $(this.context).click().dblclick(); } catch (e) { console.error(e); }
				},
				onbackward: function () {
					Magnatune.Player.stop();
					Magnatune.Playlist.selectNone();
					Magnatune.Playlist.addSelection(1,5);
				}
			}
		},
		first: "info",
		history: [],
		element: null,
		_render_arrow: function (element, direction) {
			var arrow = tag('div',{'class':'tour-arrow'},' ');
			var page_element = $(element).find('> .tour-page');
			page_element.append(arrow);
			switch (direction) {
				case "right":
					arrow.className += ' tour-right-arrow';
					arrow.style.right = (-$(arrow).width())+'px';
					arrow.style.top   = Math.round((page_element.outerHeight() - $(arrow).height()) * 0.5)+'px';
					break;

				case "left":
					arrow.className += ' tour-left-arrow';
					arrow.style.left = (-$(arrow).width())+'px';
					arrow.style.top  = Math.round((page_element.outerHeight() - $(arrow).height()) * 0.5)+'px';
					break;

				case "down":
					arrow.className += ' tour-down-arrow';
					arrow.style.left   = Math.round((page_element.outerWidth() - $(arrow).width()) * 0.5)+'px';
					arrow.style.bottom = (-$(arrow).height())+'px';
					break;

				case "up":
					arrow.className += ' tour-up-arrow';
					arrow.style.left = Math.round((page_element.outerWidth() - $(arrow).width()) * 0.5)+'px';
					arrow.style.top  = (-$(arrow).height())+'px';
					break;
			}
			return arrow;
		},
		_trigger: function (page, event) {
			event = 'on'+event;
			if (page[event]) {
				page[event]();
			}
		},
		_render: function (page,opts) {
			if (!opts) opts = {};
			this._trigger(page,'show');
			var content = tag('div',{'class':'tour-page-content'});
			$(content).html(page.text);
			var element = tag('div',{'class':'tour-page-wrapper'},
				tag('div',{'class':'tour-page'},
					tag('a',{'class':'button close',
						href:'javascript:Magnatune.Tour.stop();void(0)'},
						'\u00d7'),
					content,
					tag('div',{'class':'tour-page-buttons'},
						opts.previous ?
							tag('a',{'class':'button',
								href:'javascript:Magnatune.Tour.previous();void(0)'},
								'\u00ab Previous') :
							null,
						page.next ?
							tag('a',{'class':'button',
								href:'javascript:Magnatune.Tour.next();void(0)'},
								'Next \u00bb') :
							tag('a',{'class':'button',
								href:'javascript:Magnatune.Tour.stop();void(0)'},
								'Finish'))));
			
			element.style.visibility = "hidden";
			$(document.body).append(element);

			var placed = page.placed || "below";
			var context = $(page.context||document.body);

			var context_el = context[0];
			if (context_el) {
				if (context_el.scrollIntoViewIfNeeded) {
					context_el.scrollIntoViewIfNeeded();
				}
				else if (context_el.scrollIntoView) {
					context_el.scrollIntoView();
				}
			}

			var ctx_pos = context.offset();
			var ctx_width  = context.outerWidth();
			var ctx_height = context.outerHeight();
			var el_width  = $(element).width();
			var el_height = $(element).height();
			var top, left, arrow_pos = page.arrow;
			
			if (typeof(placed) === "object") {
				if ('left' in placed) {
					left = ctx_pos.left + placed.left;
					if (!('top' in placed) && !('bottom' in placed)) {
						top = Math.round(ctx_pos.top + (ctx_height - el_height) * 0.5);
					}
				}
				if ('right' in placed) {
					left = ctx_pos.left + ctx_width - el_width - placed.right;
					if (!('top' in placed) && !('bottom' in placed)) {
						top = Math.round(ctx_pos.top + (ctx_height - el_height) * 0.5);
					}
				}
				if ('top' in placed) {
					top = ctx_pos.top + placed.top;
					if (!('left' in placed) && !('right' in placed)) {
						left = Math.round(ctx_pos.left + (ctx_width - el_width) * 0.5);
					}
				}
				if ('bottom' in placed) {
					top = ctx_pos.top + ctx_height - el_height - placed.bottom;
					if (!('left' in placed) && !('right' in placed)) {
						left = Math.round(ctx_pos.left + (ctx_width - el_width) * 0.5);
					}
				}
			}
			else {
				var distance = 20;
				switch (placed) {
					case "left":
						if (!arrow_pos) arrow_pos = 'right';
						left = ctx_pos.left - el_width - distance;
						top  = Math.round(ctx_pos.top + (ctx_height - el_height) * 0.5);
						break;

					case "right":
						if (!arrow_pos) arrow_pos = 'left';
						left = ctx_pos.left + ctx_width + distance;
						top  = Math.round(ctx_pos.top + (ctx_height - el_height) * 0.5);
						break;

					case "above":
						if (!arrow_pos) arrow_pos = 'down';
						left = Math.round(ctx_pos.left + (ctx_width - el_width) * 0.5);
						top  = ctx_pos.top - $(element).height() - distance;
						break;

					case "below":
						if (!arrow_pos) arrow_pos = 'up';
						left = Math.round(ctx_pos.left + (ctx_width - el_width) * 0.5);
						top  = ctx_pos.top + ctx_height + distance;
						break;
				}
			}

			if (left < 10) {
				left = 10;
			}
			else if (left + el_width > $(window).innerWidth() - 10) {
				left = $(window).innerWidth() - el_width - 10;
			}

			if (top < 10) {
				top = 10;
			}
			else if (top + el_height > $(window).innerHeight() - 10) {
				top = $(window).innerHeight() - el_height - 10;
			}

			element.style.left = left+'px';
			element.style.top  = top+'px';
			if (arrow_pos) {
				this._render_arrow(element, arrow_pos);
			}
			return element;
		},
		_transit: function (element) {
			if (this.element) {
				if (element) {
					var current = $(this.element);
					element = $(element);
					var cur_pos = current.position();
					var new_pos = element.position();
					current.remove();
					element.css({
						left: cur_pos.left+'px',
						top:  cur_pos.top+'px',
						visibility: ''
					}).animate({
						left: new_pos.left+'px',
						top:  new_pos.top+'px'
					}, 'slow');
				}
				else {
					$(this.element).fadeOut('fast',function () { $(this).remove(); });
				}
			}
			else {
				if (element) {
					$(element).hide().css("visibility","").fadeIn('fast');
				}
			}
			this.element = element;
		},
		start: function () {
			var page;
			if (this.history.length > 0) {
				page = this.Pages[this.history[this.history.length - 1]];
				this._trigger(page,'hide');
			}
			page = this.Pages[this.first];
			this._trigger(page,'forward');
			this._transit(this._render(page));
			this.history = [this.first];
		},
		stop: function () {
			if (this.history.length > 0) {
				var page = this.Pages[this.history[this.history.length - 1]];
				this._trigger(page,'hide');
			}
			this._transit(null);
			this.history = [];
		},
		next: function () {
			if (this.history.length > 0) {
				var page = this.Pages[this.history[this.history.length - 1]];
				this._trigger(page,'hide');
				if (page.next) {
					var next = this.Pages[page.next];
					this._trigger(next,'forward');
					this._transit(this._render(next,{previous:true}));
					this.history.push(page.next);
				}
				else {
					this._transit(null);
					this.history = [];
				}
			}
		},
		previous: function () {
			if (this.history.length > 0) {
				var page = this.Pages[this.history[this.history.length - 1]];
				this._trigger(page,'backward');
				this._trigger(page,'hide');
				this.history.pop();
			}
			if (this.history.length > 0) {
				var page = this.Pages[this.history[this.history.length - 1]];
				this._transit(this._render(page,{previous:this.history.length > 1}));
			}
			else {
				this._transit(null);
			}
		},
		show: function (pagename) {
			if (this.history.length > 0) {
				var page = this.Pages[this.history[this.history.length - 1]];
				this._trigger(page,'hide');
			}
			var page = this.Pages[pagename];
			this._trigger(page,'forward');
			this._transit(this._render(page,{previous:this.history.length > 0}));
			this.history.push(pagename);
		}
	},
	save: function () {
		if (typeof(localStorage) !== "undefined") {
			var remember = $('#remember-login').is(':checked');
			localStorage.setItem('login.remember',String(remember));
			if (!remember) {
				localStorage.removeItem('login.username');
				localStorage.removeItem('login.password');
			}
			localStorage.setItem('collection.changed',Magnatune.Collection.Changed);
			localStorage.setItem('info.hash',Magnatune.Info.hash()||'#/about');
			localStorage.setItem('playlist.songs',JSON.stringify(Magnatune.Playlist.songs()));
			localStorage.setItem('playlist.current',String(Magnatune.Playlist.currentIndex()));
			localStorage.setItem('playlist.visible',String(Magnatune.Playlist.visible()));
			localStorage.setItem('player.member',String(Magnatune.Player.member()));
			try {
				localStorage.setItem('player.volume',String(Magnatune.Player.volume()));
			}
			catch (e) {
				console.error(e);
			}
			localStorage.setItem('player.visible',String(Magnatune.Player.visible()));
			localStorage.setItem('navigation.visible',String(Magnatune.Navigation.visible()));
			localStorage.setItem('navigation.order',Magnatune.Navigation.order());
			localStorage.setItem('navigation.mode',Magnatune.Navigation.mode());
		}
	},
	load: function () {
		var remember, username = '', password = '', hash, songs, current, member,
		    volume, playerVisible, navigationVisible, playlistVisible, order, mode;
		if (typeof(localStorage) !== "undefined") {
			remember = getBoolean('login.remember');
			if (remember) {
				username = localStorage.getItem('login.username') || '';
				password = localStorage.getItem('login.password') || '';
			}
			hash = localStorage.getItem('info.hash') || '#/about';
			songs = localStorage.getItem('playlist.songs');
			if (songs !== null) {
				try {
					songs = JSON.parse(songs);
				}
				catch (e) {
					console.error(e);
					songs = null;
				}
			}
			current = parseInt(localStorage.getItem('playlist.current'),10);
			playlistVisible = getBoolean('playlist.visible');
			member = getBoolean('player.member');
			volume = parseFloat(localStorage.getItem('player.volume'));
			playerVisible = getBoolean('player.visible');
			navigationVisible = getBoolean('navigation.visible');
			order = localStorage.getItem('navigation.order') || 'name';
			mode = localStorage.getItem('navigation.mode') || 'genre/artist/album';
		}
		else {
			hash = '#/about';
			songs = [];
			current = -1;
			member = false;
			volume = 1.0;
			playerVisible = true;
			navigationVisible = true;
			playlistVisible = false;
			order = 'name';
			mode = 'genre/artist/album';
		}

		if (remember !== null) {
			$('#remember-login').attr('checked',remember);
		}

		if (member === false) {
			Magnatune.Player.setMember(false);
		}

		if (member && (Magnatune.BrowserAuthenticates || (remember && username && password))) {
			Magnatune.Player.setMember(true);
			// auto login
			if (!Magnatune.BrowserAuthenticates) {
				$('#username').val(username);
				$('#password').val(password);
			}
			Magnatune.login();
		}

		try {
			Magnatune.Navigation.setConfig(order, mode);
		}
		catch (e) {
			console.error(e);
			Magnatune.Navigation.setConfig('name', 'genre/artist/album');
		}
		
		if (/^#?$/.test(window.location.hash)) {
			if (playlistVisible) {
				Magnatune.Playlist.show();
				Magnatune.Info.load(hash,{keeptab:true});
				window.location.hash = '#/playlist';
			}
			else {
				Magnatune.Info.load(hash);
			}
		}
		else if (/^#\/playlist(?:\/.*)?/.test(window.location.hash)) {
			Magnatune.Info.load(window.location.hash);
			Magnatune.Info.load(hash,{keeptab:true});
		}
		else {
			Magnatune.Info.load(window.location.hash);
		}

		if (songs !== null) {
			try {
				Magnatune.Playlist.replace(songs);
			}
			catch (e) {
				console.error(e);
			}
		}
		
		if (!isNaN(current)) {
			Magnatune.Playlist.setCurrentIndex(current);
		}

		if (!isNaN(volume)) {
			Magnatune.Player.setVolume(volume);
		}

		if (playerVisible === true) {
			Magnatune.Player.show(true);
		}
		else if (playerVisible === false) {
			Magnatune.Player.hide(true);
		}
		
		if (navigationVisible === true) {
			Magnatune.Navigation.show(true);
		}
		else if (navigationVisible === false) {
			Magnatune.Navigation.hide(true);
		}
	}
});

Magnatune.Playlist.SupportedMimeTypesMap = (function () {
	var types = Magnatune.Playlist.SupportedMimeTypes;
	var map = {};
	for (var i = 0; i < types.length; ++ i) {
		map[types[i]] = true;
	}
	return map;
})();

Magnatune.Events.extend(Magnatune.Collection);

if (Magnatune.TouchDevice) {
	// assume touch devices don't have a mouse
	// in fact iOS sends sometimes bogus mouseover events

	$(document).on('touchmove', function (event) {
		if (Magnatune.DnD.handler && Magnatune.DnD.handler.drag) {
			var mouseEvent = Magnatune.DnD.convertEvent(event.originalEvent);
			if (!mouseEvent) return;
			event.preventDefault();
			if (mouseEvent.type === "mouseup") {
				// moved with more than one finger, so cancel
				if (Magnatune.DnD.handler.cancel) {
					Magnatune.DnD.handler.cancel.call(Magnatune.DnD.source, mouseEvent);
				}
				Magnatune.DnD.source  = null;
				Magnatune.DnD.handler = null;
			}
			else {
				Magnatune.DnD.handler.drag.call(Magnatune.DnD.source, mouseEvent);
			}
		}
	});

	$(document).on('touchend', function (event) {
		if (Magnatune.DnD.handler) {
			var mouseEvent = Magnatune.DnD.convertEvent(event.originalEvent);
			if (!mouseEvent) return;
			if (Magnatune.DnD.handler.drop) {
				Magnatune.DnD.handler.drop.call(Magnatune.DnD.source, mouseEvent);
			}
			Magnatune.DnD.source  = null;
			Magnatune.DnD.handler = null;
		}
	});

	$(document).on('touchcancel', function (event) {
		if (Magnatune.DnD.handler) {
			var mouseEvent = Magnatune.DnD.convertEvent(event.originalEvent);
			if (!mouseEvent) return;
			if (Magnatune.DnD.handler.cancel) {
				Magnatune.DnD.handler.cancel.call(Magnatune.DnD.source, mouseEvent);
			}
			Magnatune.DnD.source  = null;
			Magnatune.DnD.handler = null;
		}
	});
}
else {
	$(document).on('mousemove', function (event) {
		if (Magnatune.DnD.handler && Magnatune.DnD.handler.drag) {
			Magnatune.DnD.handler.drag.call(Magnatune.DnD.source, event);
		}
	});

	$(document).on('mouseup', function (event) {
		if (Magnatune.DnD.handler) {
			if (Magnatune.DnD.handler.drop) {
				Magnatune.DnD.handler.drop.call(Magnatune.DnD.source, event);
			}
			Magnatune.DnD.source  = null;
			Magnatune.DnD.handler = null;
		}
	});
}

$(document).ready(function () {
	Magnatune.Html5DnD = $("#export-drag")[0].draggable === true || ($.browser.msie && parseFloat($.browser.version) >= 5.5);

	if (!document.body.scrollIntoView && !document.body.scrollIntoViewIfNeeded) {
		$('#show-current').hide();
	}
	try {
		Magnatune.Player.initAudio();
	}
	catch (e) {}
	
	if (!Magnatune.VolumeControl) {
		$('#volume-button').hide();
	}

	function move_seek_tooltip (x, time) {
		var tooltip = $('#seek-tooltip');
		$('#seek-position').text(tag.time(time));
		if (tooltip.is(':visible')) {
			tooltip.css({
				left: Math.round(x - tooltip.width() * 0.5)+'px'
			});
		}
		else {
			tooltip.css({
				visibility: 'hidden',
				display: ''
			});
			tooltip.css({
				top: (-tooltip.height())+'px',
				left: Math.round(x - tooltip.width() * 0.5)+'px',
				visibility: ''
			});
		}
	}
	if (!Magnatune.TouchDevice) {
		// assume touch devices don't have a mouse
		// in fact iOS sends sometimes bogus mouseover events
		$('#play-progress-container').on('mousemove', function (event) {
			var target = $(event.target);
			if (target.is('#seek-tooltip') || target.parents().index('#seek-tooltip') !== -1) {
				$('#seek-tooltip').hide();
				return;
			}
			var container = $(this);
			var x = event.pageX - container.offset().left;
			var duration = Magnatune.Player.duration();
			var time = Math.max(0,
				Math.min(duration, duration * x / container.width()));
			move_seek_tooltip(x, time);
		});
	}
	$('#play-progress-container').on('mouseleave', function (event) {
		$('#seek-tooltip').hide();
	});
	$('#seek-tooltip').on('mouseenter', function (event) {
		$(this).hide();
	});
	Magnatune.DnD.draggable($('#play-progress-container'), {
		create: function (event) {
			Magnatune.DnD.seeking = true;
			var playing = Magnatune.Player.playing();
			var handler = {
				drag: function (event) {
					var container = $(this);
					var x = event.pageX - container.offset().left;
					var duration = Magnatune.Player.duration();
					var time = Math.max(0,
						Math.min(duration, duration * x / container.width()));
					if (!isNaN(time)) {
						Magnatune.Player.seek(time);
					}
					move_seek_tooltip(x, time);
				},
				drop: function (event) {
					$('#seek-tooltip').hide();
					Magnatune.DnD.seeking = false;
					if (playing) {
						var x = event.pageX - $(this).offset().left;
						if (x >= $(this).width()) {
							Magnatune.Playlist.next(true);
						}
					}
				},
				cancel: function (event) {
					$('#seek-tooltip').hide();
				}
			};
			handler.cancel = handler.drop;
			handler.drag.call(this,event);
			return handler;
		}
	});
	Magnatune.DnD.draggable($('#volume-bar-container'), {
		create: function (event) {
			var handler = {
				drag: function (event) {
					var height = $(this).height();
					var y = height - (event.pageY - $(this).offset().top);
					Magnatune.Player.setVolume(Math.max(0.0, Math.min(1.0, y / height)));
				}
			};
			handler.drag.call(this,event);
			return handler;
		}
	});
	if (typeof(localStorage) === "undefined") {
		$('#playlists-controls').hide();

		$('label[for="export-what"]').hide();
		$("#export-what").val('current').trigger('onchange').hide();
	}
	if (typeof(btoa) === "undefined") {
		if (Magnatune.Html5DnD) {
			$('#export-menu input[type="submit"]').hide();
		}
		else {
			$("#export-button").hide();
		}
	}
	Magnatune.Collection.on('ready', function () {
		Magnatune.load();
	});
	$('#search').on('paste cut drop', Magnatune.Navigation.FilterInput.delayedUpdate);
	$('#search').on('keydown', function (event) {
		if (event.which === 13) {
			Magnatune.Navigation.FilterInput.update();
		}
		else {
			var value = this.value;
			setTimeout(function () {
				if (this.value !== value) {
					Magnatune.Navigation.FilterInput.delayedUpdate();
				}
			}.bind(this), 0);
		}
	});
	$('#currently-playing').on('mouseenter', Magnatune.Player._titleAnim);
	$('#currently-playing').on('mouseleave', Magnatune.Player._stopTitleAnim);
	$('#member').on('change', function (event) {
		if (Magnatune.BrowserAuthenticates) {
			if ($(this).is(':checked')) {
				// force authentication dialog now:
				Magnatune.login();
			}
		}
		else {
			if ($(this).is(':checked')) {
				Magnatune.Player.showCredentials();
			}
			else {
				Magnatune.Player.cancelCredentials();
			}
		}
	});
	Magnatune.Collection.load();
	var unloaded = false;
	$(window).on('unload beforeunload',function (event) {
		// unload seems not to fire before load fires,
		// even if the page is left before it finishes loading.
		// And if all albums are shown load might not fire
		// for a very long time. But beforeunload seems to
		// fire anyway.
		if (!unloaded) {
			unloaded = true;
			Magnatune.save();
		}
	});
	$(window).on('hashchange',function (event) {
		Magnatune.showHash();
	});

	if (typeof(FileReader) === "undefined") {
		$('#import-button').hide();
	}

	$('#tree').on('scroll',Magnatune.Navigation.loadVisibleImages);
	$('#info-content').on('scroll',Magnatune.Info.loadVisibleImages);
	$(window).on('resize',Magnatune.Info.loadVisibleImages);
	
	if (Magnatune.Html5DnD) {
		Magnatune.Tour.Pages.dnd_album.next = "html5_dnd";
		
		$.event.fixHooks.dragenter = $.event.fixHooks.dragover = $.event.mouseHooks;
		$('#playlist-container .tab-content').on('dragenter dragover', function (event) {
			var accept = false;
			var types = event.originalEvent.dataTransfer.types;
			if (types) {
				var supported = Magnatune.Playlist.SupportedMimeTypesMap;
				for (var i = 0; i < types.length; ++ i) {
					var type = types[i];
					if (type === "Files" || supported[type] === true) {
						accept = true;
						break;
					}
				}
			}
			else if ($.browser.msie) {
				// IE has not types property!
				accept = true;
			}
		
			if (accept) {
				Magnatune.Playlist._dragover(event);
				event.originalEvent.dropEffect = 'copy';
				event.stopPropagation();
				event.preventDefault();
			}
			else {
				event.originalEvent.dropEffect = 'none';
			}
		}).on('dragleave', Magnatune.Playlist._dragend).on('drop', function (event) {
			var index = Magnatune.Playlist.dropIndex();

			Magnatune.Playlist._dragend(event.originalEvent);
			event.stopPropagation();
			event.preventDefault();

			var transfer = event.originalEvent.dataTransfer;

			if (transfer.files && transfer.files.length > 0) {
				Magnatune.Playlist.importFiles(transfer.files, index);
			}
			else {
				var supportedTypes = Magnatune.Playlist.SupportedMimeTypes;
				var types = transfer.types;
				if (types) {
					var typemap = {};
					for (var i = 0; i < types.length; ++ i) {
						typemap[types[i].split(";")[0]] = true;
					}

					for (var i = 0; i < supportedTypes.length; ++ i) {
						var type = supportedTypes[i];
						if (typemap[type] === true) {
							// safari is broken and returns undefined
							Magnatune.Playlist.importString(transfer.getData(type)||"", type, index);
							return;
						}
					}
				}
				else if ($.browser.msie) {
					// it seems that IE does not have the type object so I guess I just have to try:
					for (var i = 0; i < supportedTypes.length; ++ i) {
						var type = supportedTypes[i];
						try {
							var value = transfer.getData(type);
							if (value) {
								Magnatune.Playlist.importString(value, type, index);
								return;
							}
						}
						catch (e) {
							// if the type is not supported by the dataTransfer objet it throws an exception
							console.error(e);
						}
					}
				}

				if (types) {
					alert("Dropped data is not supported: "+Array.prototype.join.call(types, ", "));
				}
				else {
					alert("Dropped data is not supported.");
				}
			}
		});

		$("#export-drag").on("dragstart", function (event) {
			var transfer = event.originalEvent.dataTransfer;
			var what = $('#export-what').val();
			var data, type;

			switch (what) {
				case "current":
					var opts = {
						playlist_format: $('#export-playlist-format').val(),
						track_format: $('#export-track-format').val(),
						member: $('#export-member').is(':checked')
					};
					type = MIME_TYPE_MAP[opts.playlist_format];
					data = Magnatune.Playlist.exportPlaylist(Magnatune.Playlist.songs(), opts);
					break;

				case "saved":
					type = "application/json";
					data = Magnatune.Playlist.exportSaved();
					break;

				default:
					console.error("Unknown export selection: "+what);
			}

			if (data) {
				transfer.effectAllowed = 'copy';
				var formats = {"text/plain": 1};
				formats[type] = 1;
				if ($.browser.msie) { formats.Text = 1; }
				for (var format in formats) {
					try {
						transfer.setData(format, data);
					}
					catch (e) {
						console.error(e);
					}
				}
				if (transfer.setDragImage) {
					transfer.setDragImage(tag('img',{src:'images/dragicon.png'}), 0, 0);
				}
			}
			else {
				event.preventDefault();
			}
			event.stopPropagation();
		});
	}
	else {
		$("#export-drag").hide();
	}
});

// if installed as app window.moveTo and window.resizeTo are not blocked
// and it makes sense to implement custom move/resize so the player can
// be used without window decoration
if ((!window.matchMedia || window.matchMedia("not handheld").matches) &&
	window.chrome && window.chrome.app && window.chrome.app.isInstalled &&
	window.outerHeight - window.innerHeight < 62) {
	$.ajax('javascripts/move_and_resize.js',{dataType:'script',cache:true});
}

$(document).on('click touchend touchcancel', function (event) {
	var menus = $('.popup-menu');
	var target = event.target;
	var related = $(target).parents().andSelf();

	for (var i = 0; i < menus.length; ++ i) {
		var menu = $(menus[i]);
		var button = $('#'+menu.dataset('button'));
		
		if (menu.is(':visible') &&
			!related.is(button) &&
			!related.is(menu)) {
			var action = menu.dataset('hide-action');
			if (action === undefined) {
				menu.fadeOut('fast');
			}
			else {
				(new Function("event",action)).call(menus[i],event);
			}
		}
	}
});

})();
