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

	tag.expander = function (opts) {
		function expand (event) {
			var self = $(this).parent();
			var body = self.children('.body');
			var expander = self.find('> .head > .expander:first');

			if (body.length === 0) {
				expander.text('\u25BC');
				var newbody = tag('div',{'class':'body'},opts.body_attrs);
				opts.render(newbody);
				self.append(newbody);
			}
			else {
				expander.text('\u25B6');
				body.remove();
			}
			event.preventDefault();
		}

		var head = tag('a', {
			'class': 'head',
			href:'javascript:void(0)',
			onclick: expand},
			opts.head_attrs,
			tag('span',{'class':'expander'},'\u25B6'),
			' ',opts.label);

		try {
			if (opts.expanded) {
				expand.call(head,{preventDefault:function(){}});
			}
			return tag('li', opts.attrs, head);
		}
		finally {
			head = null;
		}
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
	popup.css({
		visibility: '',
		left: left+'px',
		top: top+'px'
	});
}

function showSave (data, name, mimetype) {
	window.open("data:"+(mimetype||"application/octet-stream")+";charset=utf-8;base64,"+$.base64Encode(data),name||"Download");
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
				var url = "http://he3.magnatune.com/all/"+encodeURIComponent(song.mp3);

				this._set_sources([
					{type:'audio/ogg',src:url.replace(/\.mp3$/i,'.ogg')},
					{type:'audio/mpeg;codecs="mp3"',src:url}
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
				control.hide();
			}
			else {
				var element = control;
				var button = $('#volume-button');
				var pos = button.position();
				control.css({
					visibility: 'hidden',
					display: ''
				});
				control.css({
					left: Math.round(pos.left+(button.outerWidth()-element.outerWidth())*0.5)+'px',
					top: (pos.top+button.outerHeight())+'px',
					visibility: ''
				});
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
			$('#credentials, #login-spinner').hide();
			// clear form so no one can spy the credentials when pants status down:
			$('#username, #password').val('');
	
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
		show: function () {
			$('#info-button').addClass('active');
			$('#playlist-button').removeClass('active');
			$('#playlist-container').hide();
			$('#info').show();
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
			return tag('tr',
				{title:album.albumname+' '+launchdate+' '+album.artist.artist},
				tag('td', tag('a',
					{href:'#/album/'+encodeURIComponent(album.albumname)},
					tag('img',{'class':'cover',
						src:'http://he3.magnatune.com/music/'+
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
		update: function (hash,breadcrumbs,content,keeptab) {
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
			
			if (!keeptab) this.show();
			if (!keeptab || Magnatune.Info.visible()) {
				window.location.hash = hash;
			}
		},
		pageNotFound: function (hash,content,keeptab) {
			var breadcrumbs = [{href: hash, text: 'Not Found'}];
			content = tag('div',{'class':'notfound'},
				tag('h2','Not Found'),
				content);
			this.update(hash,breadcrumbs,content,keeptab);
		},
		load: function (hash,opts) {
			var m = /^#?\/([^\/]+)(?:\/(.*))?/.exec(hash);
			
			if (!m) return false;

			if (!opts) opts = {};
			var page = m[1];
			if (typeof(m[2]) !== "undefined") {
				opts.id = decodeURIComponent(m[2]);
			}

			if (Object.prototype.hasOwnProperty.call(this.Pages,page)) {
				this.Pages[page](opts||{});
				return true;
			}
			else {
				this.pageNotFound(
					hash,
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
				// TODO: don't inline this HTML
				var page = tag('div',{'class':'about'});
				var install = '';
				if (window.chrome && window.chrome.app) {
					install = '<a class="button app" href="app/magnatune-player.crx">Install App</a>';
				}
				$(page).html(
					'<h2>Magnatune Player</h2>'+
					'<div class="about-float">'+
					'<a class="logo" title="Magnatune" href="http://magnatune.com/"><img alt="" src="logo.png"/></a>'+
					install+
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
				if (!genre) {
					Magnatune.Info.pageNotFound(
						hash,
						tag('p','Genre \u00bb'+opts.id+'\u00ab was not found.'),
						opts.keeptab);
					return;
				}
				var breadcrumbs = [{href:hash,text:genre.genre}];
				var albums = genre.albums.slice();
				albums.sort(Magnatune.Navigation.albumSorter());
				var page = tag('div',{'class':'genre'},
					tag('h2',tag('a',{'class':'genre',
						href:'http://magnatune.com/genres/'+genre.genre.replace(/\s/g,'').toLowerCase()+'/',
						target:'_blank'},
						genre.genre)),
					Magnatune.Info._albumsList(albums));
				Magnatune.Info.update(hash,breadcrumbs,page,opts.keeptab);
			},
			album: function (opts) {
				Magnatune.Collection.request({
					args: {action: 'album', name: opts.id},
					success: function (data) {
						var hash = '#/album/'+encodeURIComponent(opts.id);
						if (!data.body) {
							Magnatune.Info.pageNotFound(
								hash,
								tag('p','Album \u00bb'+opts.id+'\u00ab was not found.'),
								opts.keeptab);
							return;
						}
						var album = Magnatune.Collection.Albums[opts.id];
						var artist = album.artist;
						var breadcrumbs = [
							{href: '#/artist/'+encodeURIComponent(artist.artist), text: artist.artist},
							{href: hash, text: album.albumname}];
						var authenticated = Magnatune.authenticated && Magnatune.Player.member();
						var songs = $(tag('tbody'));
						var url_prefix = 'http://download.magnatune.com/music/'+
							encodeURIComponent(artist.artist)+'/'+
							encodeURIComponent(album.albumname)+'/';
						var album_prefix = "http://download.magnatune.com/membership/download?";
						for (var i = 0; i < data.body.songs.length; ++ i) {
							var song = data.body.songs[i];
						
							song.albumname = album.albumname;
							var row = $(tag('tr',
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
								href:'javascript:'+encodeURIComponent('Magnatune.Playlist.enqueue(['+
									JSON.stringify(song)+']);void(0)')},'+')));

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
									encodeURIComponent(artist.artist)+'/'+
									encodeURIComponent(album.albumname)+cover_file,
								alt: 'Cover'}),
							tag.textify(data.body.description),
							authenticated ? [tag('p',
								tag('div',{'class':'download-headline'},'Download the complete album:'),
								' ',
								tag('a',{target:'_blank',href:album_prefix+$.param({
									sku: sku,
									foramt: 'vbr',
									filename: sku+'-vbr.zip',
									path: url_prefix+sku+'-vbr.zip'})},'MP3 VBR'),
								', ',
								tag('a',{target:'_blank',href:album_prefix+$.param({
									sku: sku,
									foramt: 'wav',
									filename: 'wav.zip',
									path: url_prefix+'wav.zip'})},'WAV'),
								', ',
								tag('a',{target:'_blank',href:album_prefix+$.param({
									sku: sku,
									foramt: 'flac',
									filename: sku+'-flac.zip',
									path: url_prefix+sku+'-flac.zip'})},'FLAC'),
								', ',
								tag('a',{target:'_blank',href:album_prefix+$.param({
									sku: sku,
									foramt: 'ogg',
									filename: sku+'-ogg.zip',
									path: url_prefix+sku+'-ogg.zip'})},'OGG'),
								', ',
								tag('a',{target:'_blank',href:album_prefix+$.param({
									sku: sku,
									foramt: 'mp3',
									filename: 'mp3.zip',
									path: url_prefix+'mp3.zip'})},'128kb MP3'),
								', ',
								tag('a',{target:'_blank',href:album_prefix+$.param({
									sku: sku,
									foramt: 'acc',
									filename: sku+'-acc.zip',
									path: url_prefix+sku+'-aac.zip'})},'iTunes AAC')),
							tag('p',
								tag('span',{'class':'download-headline'},'Cover:'),
								' ',
								tag('a',{target:'_blank',href:url_prefix+'cover.jpg'},'JPG'),
								', ',
								tag('span',{'class':'download-headline'},'Artwork:'),
								' ',
								tag('a',{target:'_blank',href:url_prefix+'artwork.pdf'},'PDF'))] : null,
							tag('div',{dataset:{songs:JSON.stringify(data.body.songs)}},
								tag('a', {'class':'button',href:'javascript:void(0)',
									onclick:'Magnatune.Playlist.replace(JSON.parse($(this).parent().dataset("songs")),true);'},
									'\u25B6 Play Album'),
								' ',
								tag('a', {'class':'button',href:'javascript:void(0)',
									onclick:'Magnatune.Playlist.enqueue(JSON.parse($(this).parent().dataset("songs")),true);'},
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
							tag('table',
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
					error: function () {
						// TODO
					}
				});
			},
			artist: function (opts) {
				Magnatune.Collection.request({
					args: {action: 'artist', name: opts.id},
					success: function (data) {
						var hash = '#/artist/'+encodeURIComponent(opts.id);
						if (!data.body) {
							Magnatune.Info.pageNotFound(
								hash,
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
							tbody.append(tag('tr',
								tag('td', tag('a',
									{href:'#/album/'+encodeURIComponent(album.albumname)},
									tag('img',{'class':'cover',
										src:'http://he3.magnatune.com/music/'+
											encodeURIComponent(album.artist.artist)+'/'+
											encodeURIComponent(album.albumname)+'/cover_50.jpg'}))),
								tag('td', tag('a',
									{href:'#/album/'+encodeURIComponent(album.albumname)},
									album.albumname),
									' ',
									tag('span', {'class':'launchdate'}, '('+launchdate.getFullYear()+')'))));
						}
						var breadcrumbs = [{href: hash, text: artist.artist}];
						var page = tag('div',{'class':'artist'},
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
					error: function () {
						// TODO
					}
				});
			}
		}
	},
	Playlist: {
		show: function () {
			$('#playlist-button').addClass('active');
			$('#info-button').removeClass('active');
			$('#playlist-container').show();
			$('#info').hide();
		},
		visible: function () {
			return $('#playlist').is(':visible');
		},
		showExportMenu: function () {
			var menu = $('#export-menu');
			var button = $('#export-button');
			var pos = button.position();
			menu.css({
				visibility: 'hidden',
				display: ''
			});
			menu.css({
				left: pos.left+'px',
				top: (pos.top+button.outerHeight())+'px',
				visibility: ''
			});
		},
		hideExportMenu: function () {
			$('#export-menu').hide();
		},
		toggleExportMenu: function () {
			if ($('#export-menu').is(':visible')) {
				this.hideExportMenu();
			}
			else {
				this.showExportMenu();
			}
		},
		exportM3u: function (format) {
			var songs = this.songs();
			var buf = ["#EXTM3U\n"];
			var prefix = "http://he3.magnatune.com/all/";
			var get_file;
			switch (String(format).toLowerCase()) {
				case "mp3": get_file = encodeURIComponent; break;
				case "ogg": get_file = function (mp3) { return encodeURIComponent(mp3.replace(/\.mp3$/i,'.ogg')); }; break;
				default: throw new Error("Illegal format: "+format);
			}
			
			for (var i = 0; i < songs.length; ++ i) {
				var song = songs[i];
				var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
				buf.push("#EXTINF:"+song.duration+","+artist.replace(/\s*[-:\n]+\s*/g,' ')+" - "+song.desc.replace(/\n/g," ")+"\n");
				buf.push(prefix+get_file(song.mp3)+"\n");
			}

			return buf.join("");
		},
		exportAsMp3: function () {
			this.hideExportMenu();
			showSave(this.exportM3u("mp3"),"Playlist.m3u","audio/x-mpegurl");
		},
		exportAsOgg: function () {
			this.hideExportMenu();
			showSave(this.exportM3u("ogg"),"Playlist.m3u","audio/x-mpegurl");
		},
		exportAsJSON: function () {
			this.hideExportMenu();
			var playlist = JSON.stringify({
				head: {
					version: "1.0",
					type: "magnatune-player",
					subtype: "playlist"
				},
				body: this.songs()
			});
			showSave(playlist,"Playlist.json");
		},
		exportSavedAsJSON: function () {
			this.hideExportMenu();
			var playlists = JSON.stringify({
				head: {
					version: "1.0",
					type: "magnatune-player",
					subtype: "playlists"
				},
				body: this._getSavedPlaylists()
			});
			showSave(playlists,"Playlists.json");
		},
		importFiles: function (files) {
			if (!files) return;
			for (var i = 0; i < files.length; ++ i) {
				this.importFile(files[0]);
			}
		},
		importFile: function (file) {
			if (!file) return;
			switch (file.type || "application/octet-stream") {
				case "application/octet-stream":
				case "text/plain":
				case "application/json":
				case "text/x-json":
				case "text/json":
					var reader = new FileReader();
					reader.onerror = function (event) {
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

						alert("Error reading file: "+msg);
					};
					reader.onload = function (event) {
						var data;
						try {
							data = JSON.parse(this.result);
						}
						catch (e) {
							alert("Error parsing file: "+e.toString());
							return;
						}
						Magnatune.Playlist.importJSON(data);
					};
					reader.readAsText(file, "UTF-8");
					break;
				default:
					alert("Unrecognized file type: "+file.type);
			}
		},
		importJSON: function (data) {
			if (!data || !data.head || data.head.type !== "magnatune-player" || !data.body) {
				alert("Unrecognized file format.");
				return;
			}

			switch (data.head.subtype) {
				case "playlist":
					this.enqueue(data.body);
					break;

				case "playlists":
					if (typeof(localStorage) !== "undefined") {
						var playlists = this._getSavedPlaylists();
						$.extend(playlists, data.body);
						if ($('#playlists-menu').is(':visible')) {
							Magnatune.Playlist._loadPlaylistMenu(playlists);
						}
						localStorage.setItem('playlist.saved', JSON.stringify(playlists));
					}
					break;

				default: alert("Unsupported Format.");
			}
		},
		showPlaylistMenu: function () {
			this.loadPlaylistMenu();
			var menu = $('#playlists-menu');
			var button = $('#playlists-button');
			var pos = button.position();
			menu.css({
				visibility: 'hidden',
				display: ''
			});
			menu.css({
				left: pos.left+'px',
				top: (pos.top+button.outerHeight())+'px',
				visibility: ''
			});
		},
		hidePlaylistMenu: function () {
			$('#playlists-menu').hide();
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
			$('#save-popup').hide();
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
				alert("Please enter a name.");
				return;
			}
						
			if (name in this._getSavedPlaylists() && !confirm("A playlist with the name \u00bb"+name+"\u00ab already exists. Do you want to overwrite it?")) {
				return;
			}
			
			this.hideSaveDialog();
			this.save(name);
			$('#save-playlist-name').val('');
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
							         onclick:Magnatune.Playlist.removePlaylist.bind(Magnatune.Playlist,name)},
								'\u00d7'))));
				}
			}
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
		_buildTrack: function (song) {
			var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
			var attrs = {dataset:song};
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
		randomAlbum: function () {
			var albums = Magnatune.Collection.SortedAlbums;
			var album = albums[Math.round(Math.random() * (albums.length - 1))];

			Magnatune.Collection.withSongs(album, function (album) {
				for (var i = 0; i < album.songs.length; ++ i) {
					album.songs[i].albumname = album.albumname;
				}
				Magnatune.Playlist.replace(album.songs,true);
			});
		},
		enqueue: function (songs) {
			var tbody = $('#playlist > tbody');
			for (var i = 0; i < songs.length; ++ i) {
				tbody.append(this._buildTrack(songs[i]));
			}
		},
		_dragcancel: function (event) {
			($('#playlist .drop').
				removeClass('drop').
				removeClass('before').
				removeClass('after'));
		},
		_dragover: function (event) {
			var playlist = $('#playlist');
			var track, before = false;
			var tbody = playlist.find('> tbody');
			var pos = tbody.offset();
			var y = event.pageY;
			var x = event.pageX;
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
				var tab_content = $('#playlist-container .tab-content:first');
				if (y < tab_content.offset().top) {
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
				var tab_content = $('#playlist-container .tab-content:first');
				if (y > tab_content.offset().top + tab_content.outerHeight()) {
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
						var target = $('#playlist .drop');
						Magnatune.Playlist._moveSelected(target);

						(target.
							removeClass('drop').
							removeClass('before').
							removeClass('after'));
					},
					cancel: Magnatune.Playlist._dragcancel
				};
			}
		},
		replace: function (songs, forceplay) {
			this.clear();
			this.enqueue(songs);
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
			$.ajax({
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
				error: opts.error
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
				error: function () {
					// TODO
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
				album = Magnatune.Collection.Albums[album];
				// if (!album) error
			}
			if (album.songs) {
				callback(album);
			}
			else {
				Magnatune.Collection.request({
					args: {action: 'album', name: album.albumname},
					success: function (data) {
						if (!data.body) return; // TODO
						callback(data.body);
					},
					error: function () {
						// TODO
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
		filter: function (query) {
			// TODO: keep expansion state and scroll position
			query = query.trim();
			$('#search').val(query);
			var tree = $('#tree');
			switch (this.mode()) {
				case 'album':
					Magnatune.Navigation.Modes.Album.filter(tree, query);
					break;

				case 'artist/album':
					Magnatune.Navigation.Modes.ArtistAlbum.filter(tree, query);
					break;

				case 'genre/album':
					Magnatune.Navigation.Modes.GenreAlbum.filter(tree, query);
					break;

				case 'genre/artist/album':
					Magnatune.Navigation.Modes.GenreArtistAlbum.filter(tree, query);
					break;
			}
		},
		Modes: {
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
					}
					else {
						Magnatune.Collection.request({
							args: {action: 'search', query: query, mode: 'genre/artist/album'},
							success: function (data) {
								parent.empty();
								if (!data.body) return; // TODO

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
								sorted_genres.sort(Magnatune.Navigation.genreSorter());
								Magnatune.Navigation.Modes.GenreArtistAlbum.render(parent, sorted_genres);
							},
							error: function () {
								// TODO
							}
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
							}.bind(artist)
						}));
					}

					$(parent).append(list);
				},
				filter: function (parent, query) {
					if (!query) {
						parent.empty();
						this.render(parent, Magnatune.Navigation.sortedArtists());
					}
					else {
						Magnatune.Collection.request({
							args: {action: 'search', query: query, mode: 'artist/album'},
							success: function (data) {
								parent.empty();
								if (!data.body) return; // TODO

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
								sorted_artists.sort(Magnatune.Navigation.artistSorter());
								Magnatune.Navigation.Modes.ArtistAlbum.render(parent, sorted_artists);
							},
							error: function () {
								// TODO
							}
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
							}.bind(genre)
						}));
					}

					$(parent).append(list);
				},
				filter: function (parent, query) {
					if (!query) {
						parent.empty();
						this.render(parent, Magnatune.Collection.SortedGenres);
					}
					else {
						Magnatune.Collection.request({
							args: {action: 'search', query: query, mode: 'genre/artist/album'},
							success: function (data) {
								parent.empty();
								if (!data.body) return; // TODO
								
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
								sorted_genres.sort(Magnatune.Navigation.genreSorter());
								Magnatune.Navigation.Modes.GenreAlbum.render(parent, sorted_genres);
							},
							error: function () {
								// TODO
							}
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
											src:'http://he3.magnatune.com/music/'+
												encodeURIComponent(album.artist.artist)+'/'+
												encodeURIComponent(album.albumname)+'/cover_50.jpg'})),
									tag('td',{'class':'albumname'},album.albumname),
									tag('td',{'class':'launchdate'}, launchdate))));
						Magnatune.DnD.draggable(label, this.draggable(album));

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
					}
					else {
						Magnatune.Collection.request({
							args: {action: 'search', query: query, mode: 'album'},
							success: function (data) {
								parent.empty();
								if (!data.body) return; // TODO

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

								sorted_albums.sort(Magnatune.Navigation.albumSorter());
								Magnatune.Navigation.Modes.Album.render(parent, sorted_albums);
							},
							error: function () {
								// TODO
							}
						});
					}
				},
				draggable: function (album) {
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
											for (var i = 0; i < songs.length; ++ i) {
												var song = $.extend({},songs[i]);
												song.albumname = album.albumname;
												tracks.push(Magnatune.Playlist._buildTrack(song));
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
									(target.
										removeClass('drop').
										removeClass('before').
										removeClass('after'));
									if (!was_visible) Magnatune.Info.show();
								},
								cancel: function (event) {
									Magnatune.Playlist._dragcancel(event);
									if (!was_visible) Magnatune.Info.show();
								}
							};
						}
					};
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
						Magnatune.DnD.draggable(item, this.DraggableOptions);
						list.append(item);
					}

					$(parent).append(list);
				},
				DraggableOptions: {
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
									var track = $(Magnatune.Playlist._buildTrack(song));
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
								(target.
									removeClass('drop').
									removeClass('before').
									removeClass('after'));
								if (!was_visible) Magnatune.Info.show();
							},
							cancel: function (event) {
								Magnatune.Playlist._dragcancel(event);
								if (!was_visible) Magnatune.Info.show();
							}
						};
					}
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
			$('#tree-mode-select').hide();
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
			$('#tree-order-select').hide();
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
			$(element).attr('onselectstart','return false;'); // IE
			$(element).on(Magnatune.TouchDevice ? 'touchstart' : 'mousedown', function (event) {
				if (Magnatune.DnD.source) return;

				if (event.type === 'touchstart') {
					event = Magnatune.DnD.convertEvent(event.originalEvent);
					if (!event) return;
				}
				else if (event.which !== 1) {
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
			var handler = options.create.call(this,event);
			if (options.visual || (!('visual' in options) && handler.render)) {
				var offset = $(this).offset();
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
					var genre = $("#tree a[href='#/genre/Ambient']");
					if (!genre.next(".body").is(":visible")) genre.click();
					var artist = $("#tree a[href='#/artist/Jami%20Sieber']");
					if (!artist.next(".body").is(":visible")) artist.click();
					var album = $(this.context);
					if (!album.next(".body").is(":visible")) album.click();
				},
				onbackward: function () {
					var genre = $("#tree a[href='#/genre/Ambient']");
					if (genre.next(".body").is(":visible")) genre.click();
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
						Magnatune.Playlist.enqueue(album.songs);
					});
				},
				onbackward: function () {
					Magnatune.Playlist.remove(1,Magnatune.Playlist.length());
				},
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
			var context = $(page.context||"body");

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
		start: function () {
			var page = this.Pages[this.first];
			this._trigger(page,'forward');
			var element = this._render(page);
			this.stop();
			this.element = element;
			element.style.visibility = "";

			this.history = [this.first];
		},
		stop: function () {
			if (this.history.length > 0) {
				var page = this.Pages[this.history[this.history.length - 1]];
				this._trigger(page,'hide');
			}
			$(this.element).remove();
			this.element = null;
			this.history = [];
		},
		next: function () {
			if (this.history.length > 0) {
				var page = this.Pages[this.history[this.history.length - 1]];
				this._trigger(page,'hide');
				if (page.next) {
					var next = this.Pages[page.next];
					this._trigger(next,'forward');
					var element = this._render(next,{previous:true});
					$(this.element).remove();
					this.element = element;
					element.style.visibility = "";
					this.history.push(page.next);
				}
				else {
					$(this.element).remove();
					this.element = null;
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
				var element = this._render(page,{previous:this.history.length > 1});
				$(this.element).remove();
				this.element = element;
				element.style.visibility = "";
			}
			else {
				$(this.element).remove();
				this.element = null;
			}
		},
		show: function (pagename) {
			if (this.history.length > 0) {
				var page = this.Pages[this.history[this.history.length - 1]];
				this._trigger(page,'hide');
			}
			var page = this.Pages[pagename];
			this._trigger(page,'forward');
			var element = this._render(page,{previous:this.history.length > 0});
			$(this.element).remove();
			this.element = element;
			element.style.visibility = "";
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
	}
	if (typeof(btoa) === "undefined") {
		$("#export-button").hide();
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
	$(window).unload(function (event) {
		Magnatune.save();
	});
	$(window).on('hashchange',function (event) {
		Magnatune.showHash();
	});

	if (typeof(FileReader) === "undefined") {
		$('#import-button').hide();
	}
});

$(document).on('click touchend touchcancel', function (event) {
	var menus = $('.popup-menu');
	var target = event.target;
	var parents = $(target).parents();

	for (var i = 0; i < menus.length; ++ i) {
		var menu = $(menus[i]);
		var button = $('#'+menu.dataset('button'));
		
		if (menu.is(':visible') &&
			!menu.is(target) &&
			!button.is(target) &&
			parents.index(button) === -1 &&
			parents.index(menu) === -1) {
			var action = menu.dataset('hide-action');
			if (action === undefined) {
				menu.hide();
			}
			else {
				(new Function("event",action)).call(menus[i],event);
			}
		}
	}
});

})();
