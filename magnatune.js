"use strict";

$.fx.interval = 40;

var tag = (function ($) {
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

	tag.expander = function (opts) {
		function expand (event) {
			var self = $(this).parent();
			var body = self.children('.body');
			var expander = self.find('> .head > .expander:first');

			if (body.length === 0) {
				expander.text('\u25BC');
				var body = tag('div',{'class':'body'},opts.body_attrs);
				opts.render(body);
				self.append(body)
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
	Options: {
		AnimationDuration: 500
	},
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
			var duration = this.audio.duration;
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
				var duration = Magnatune.Player.duration();
				var remaining = duration - this.currentTime;
				$('#time-left').text('-'+tag.time(remaining < 0 ? NaN : remaining));
				$('#current-time').text(tag.time(this.currentTime));
				$('#play-progress').css('width',Math.round(
					$('#play-progress-container').width() * this.currentTime / duration)+'px');
			},
			volumechange: function (event) {
				var maxheight = $('#volume-bar-container').height();
				var height = Math.round(maxheight * this.volume);
				$('#volume-bar').css('height', height+'px');
				$('#volume').text(Math.round(this.volume * 100)+'%');
			},
			durationchange: function (event) {
				var duration = Magnatune.Player.duration();
				var remaining = duration - this.currentTime;
				$('#time-left').text('-'+tag.time(remaining < 0 ? NaN : remaining));
				$('#current-duration').text(tag.time(duration));
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
				$('#play-image').hide();
				$('#pause-image').show();
			},
			emptied: function (event) {
				Magnatune.Player.hideSpinner();
			},
			pause: function (event) {
				$('#play-image').show();
				$('#pause-image').hide();
			},
			ended: function (event) {
				$('#play-image').show();
				$('#pause-image').hide();
				Magnatune.Player.hideSpinner();
				if (!Magnatune.DnD.seeking) {
					Magnatune.Playlist.next(true);
				}
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
		_update: function (norewind) {
			var song = Magnatune.Playlist.current();
			if (!song && !norewind) {
				song = Magnatune.Playlist.first();
				$('#playlist > tbody > tr:first').addClass('current');
			}

			$('#play-progress').css('width','0px');
			var buffered = $('#buffer-progress')[0];
			var ctx = buffered.getContext('2d');
			ctx.clearRect(0,0,buffered.width,buffered.height);

			var currently_playing = $('#currently-playing');

			// Replacing the source child elements did not work for me so I
			// have to create a new audio element for each play command!
			this.initAudio();
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
				$('html > head > title').text('Magnatune Player');

				return;
			}

			var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
			if (Magnatune.authenticated && this.member()) {
				this.audio.appendChild(tag('source',{
					type:'audio/ogg',
					src:"http://stream.magnatune.com/all/"+encodeURIComponent(song.mp3.replace(/\.mp3$/i,'_nospeech.ogg'))}));
				this.audio.appendChild(tag('source',{
					type:'audio/mp4',
					src:"http://stream.magnatune.com/music/"+encodeURIComponent(artist)+"/"+
						encodeURIComponent(song.albumname)+"/"+encodeURIComponent(song.mp3.replace(/\.mp3$/i,'.m4a'))}));
				this.audio.appendChild(tag('source',{
					type:'audio/mpeg;codecs="mp3"',
					src:"http://stream.magnatune.com/all/"+encodeURIComponent(song.mp3.replace(/\.mp3$/i,'_nospeech.mp3'))}));
			}
			else {
				this.audio.appendChild(tag('source',{
					type:'audio/ogg',
					src:"http://he3.magnatune.com/all/"+encodeURIComponent(song.mp3.replace(/\.mp3$/i,'.ogg'))}));
				this.audio.appendChild(tag('source',{
					type:'audio/mpeg;codecs="mp3"',
					src:"http://he3.magnatune.com/all/"+encodeURIComponent(song.mp3)}));
			}

			var album_url = '#/album/'+encodeURIComponent(song.albumname);
			var song_label = song.desc+' - '+song.albumname+' - '+artist;
			currently_playing.attr('title',song_label);
			currently_playing.find('> a').attr('href',album_url).text(song_label);

			var duration = Magnatune.Player.duration();
			$('#time-left').text('-'+tag.time(duration));
			$('#current-time').text(tag.time(0));
			$('#current-duration').text(tag.time(duration));
			$('html > head > title').text(song.desc+' - '+artist+' - Magnatune Player');
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
			if (!this.audio.paused && !this.audio.ended) {
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
			$('#player-show').show();
			$('#player-hide').hide();
			if (skipAnimation) {
				$('#player-wrapper').stop().css({top:'-60px'});
				var currently_playing = $('#currently-playing').stop();
				Magnatune.Player._stopTitleAnim();
				currently_playing.css({bottom:'6px',width:'300px'});
				$('#navigation, #content').stop().css({top:'50px'});
			}
			else {
				var d = Magnatune.Options.AnimationDuration;
				$('#player-wrapper').stop().animate({top:'-60px'},d);
				var currently_playing = $('#currently-playing').stop();
				Magnatune.Player._stopTitleAnim();
				currently_playing.animate({bottom:'6px',width:'300px'},d);
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
				var element = control[0];
				var button = $('#volume-button')[0];
				control.css({
					visibility: 'hidden',
					display: ''
				});
				control.css({
					left: Math.round(button.offsetLeft+(button.offsetWidth-element.offsetWidth)*0.5)+'px',
					top: (button.offsetTop+button.offsetHeight)+'px',
					visibility: ''
				});
			}
		},
		showCredentials: function () {
			var cred = $('#credentials');
			var member = $('#member-container');
			var pos = member.position();
			cred.css({
				left: pos.left+'px',
				top: (pos.top+member.height())+'px'
			}).show();
		},
		hideCredentials: function () {
			$('#credentials, #login-spinner').hide();
			// clear form so no one can spy the credentials when pants status down:
			$('#username, #password').val('');
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
		toggleEmbed: function (albumname) {
			var embed_container = $('#embed-container');
			if (embed_container.is(':visible')) {
				embed_container.hide();
			}
			else {
				embed_container.show();
				Magnatune.Collection.request({
					args: {action: 'embed', album: albumname},
					success: function (data) {
						$('#embed').val(data.html);
					},
					error: function () {
						// TODO
					}
				});
			}
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
			for (var i = 0; i < breadcrumbs.length; ++ i) {
				var el = breadcrumbs[i];
				list.append(tag('li', i === 0 ? {'class':'first'} : null,
					tag('a', {href:el.href}, el.text)));
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
			playlist: function () {
				// pseudopage
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
				var breadcrumbs = [{href:'#/about',text:'About'}];
				var page = tag('div',{'class':'about'});
				var install = '';
				if (window.chrome && window.chrome.app) {
					install = '<a class="button app" href="app/magnatune-player.crx">Install App</a>'
				}
				$(page).html(
					'<h2>About Magnatune Player</h2>'+
					'<div class="about-float">'+
					'<a class="logo" title="Magnatune" href="http://magnatune.com/"><img alt="" src="logo.png"/></a>'+
					install+
					'</div>'+
					'<p>This is a proof of concept interface to <a href="http://magnatune.com/">magnatune.com</a> '+
					'that is organized like a music player, written by Mathias Panzenb&ouml;ck. It uses the '+
					'<a href="http://www.sqlite.org/">SQLite</a> export from the '+
					'<a href="http://magnatune.com/info/api">Magnatune API</a> and the '+
					'<a href="http://dev.w3.org/html5/spec/the-audio-element.html">HTML5 Audio Element</a>. '+
					'Because depending on the browser HTML5 Audio is still not bug free, things like the buffer '+
					'progress display or seeking might not work 100% reliable. In Internet Explorer it doesn\'t '+
					'work at all. Please use <a href="http://www.firefox.com/">Mozilla Firefox</a>, '+
					'<a href="http://www.google.com/chrome/">Google Chrome</a>, '+
					'<a href="http://www.apple.com/safari/">Apple Safari</a> or '+
					'<a href="http://www.opera.com/">Opera</a>.</p>'+
					'<p>You can download the source code of this web page on '+
					'<a href="https://bitbucket.org/panzi/magnatune-player">bitbucket</a>.</p>'+
					'<p>Other experiments done by me can be found <a '+
					'href="http://web.student.tuwien.ac.at/~e0427417/">here</a>.</p>');
				Magnatune.Info.update('#/about',breadcrumbs,page,opts.keeptab);
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
						var songs = $(tag('tbody'));
						for (var i = 0; i < data.body.songs.length; ++ i) {
							var song = data.body.songs[i];
						
							song.albumname = album.albumname;
							songs.append(tag('tr',
								tag('td', {'class':'number'}, song.number),
								tag('td', song.desc),
								tag('td', {'class':'duration'}, tag.time(song.duration)),
								tag('td', tag('a',{
									title: 'Enqueue Track',
									href:'javascript:'+encodeURIComponent('Magnatune.Playlist.enqueue(['+
										JSON.stringify(song)+']);void(0)')},'+'))));
						}
						var genres = $(tag('ul'));
						for (var i = 0; i < album.genres.length; ++ i) {
							var genre = album.genres[i].genre;
							genres.append(tag('li', tag('a',
								{href:'#/genre/'+encodeURIComponent(genre)}, genre)));
						}
						var also = [];
						for (var i = 0; i < data.body.also.length; ++ i) {
							also.push(Magnatune.Collection.Albums[data.body.also[i]]);
						}
						var launchdate = new Date();
						launchdate.setTime(data.body.launchdate * 1000);
						var page = tag('div',{'class':'album'},
							tag('h2', tag('a', {'class':'albumname',
								href:'http://magnatune.com/artists/albums/'+data.body.sku+'/',
								target:'_blank'},
								album.albumname)),
							tag('div',{'class':'launchdate'}, launchdate.toLocaleDateString()),
							tag('table',
								tag('tbody',
									tag('tr',
										tag('td',
											tag('a',{
												'class':'buy button',
												title:'Buy Music from Magnatune',
												href:'https://magnatune.com/buy/choose?sku='+data.body.sku,
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
							tag('img', {'class':'cover',
								src: 'http://he3.magnatune.com/music/'+
									encodeURIComponent(artist.artist)+'/'+
									encodeURIComponent(album.albumname)+'/cover_300.jpg',
								alt: 'Cover'}),
							tag.textify(data.body.description),
							tag('div',
								tag('a', {'class':'button',href:'javascript:'+encodeURIComponent(
									'Magnatune.Playlist.replace('+JSON.stringify(data.body.songs)+',true);void(0)')},
									'\u25B6 Play Album'),
								' ',
								tag('a', {'class':'button',href:'javascript:'+encodeURIComponent(
									'Magnatune.Playlist.enqueue('+JSON.stringify(data.body.songs)+');void(0)')},
									'Enqueue Album'),
								' ',
								tag('a', {'class':'button',href:'javascript:'+encodeURIComponent(
									'Magnatune.Info.toggleEmbed('+JSON.stringify(album.albumname)+');void(0)')},
									'Embed Code')),
							tag('div',{'id':'embed-container','style':'display:none;'},
								tag('textarea',{'id':'embed',title:'Copy this HTML code into your website.',onclick:'this.select();'})),
							tag('table',
								tag('thead',
									tag('tr',
										tag('th','Nr.'),
										tag('th','Title'),
										tag('th','Duration'),
										tag('th',''))),
								songs),
							tag('h3','Genres'),
							genres,
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
		_click_song: function (event) {
			var playlist = $("#playlist");
			var element = $(this);
			if (event.ctrlKey) {
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
			}
			else if (event.shiftKey) {
				var start = playlist.find('> tbody > tr.selection-start');
				if (start.length === 0) {
					element.addClass('selected selection-start');
				}
				else {
					playlist.find('> tbody > tr.selected').removeClass('selected');
					var selection;
					if (start.index() < element.index()) {
						selection = start.nextUntil(element).add(start).add(element);
					}
					else {
						selection = start.prevUntil(element).add(start).add(element);
					}
					selection.addClass('selected');
				}
			}
			else {
				(playlist.find('> tbody > tr.selected')
					.removeClass('selected')
					.removeClass('selection-start'));
				element.addClass('selected selection-start');
			}
		},
		_dblclick_song: function (event) {
			Magnatune.Playlist.setCurrentIndex($(this).index(), true);
		},
		_buildTrack: function (song) {
			var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
			var tr = tag('tr',{dataset:song,
				onclick:Magnatune.Playlist._click_song,
				ondblclick:Magnatune.Playlist._dblclick_song},
				tag('td',{'class':'number'},song.number),
				tag('td',song.desc),
				tag('td',{'class':'duration'},tag.time(song.duration)),
				tag('td',tag('a',{href:'#/artist/'+encodeURIComponent(artist)},artist)),
				tag('td',tag('a',{href:'#/album/'+encodeURIComponent(song.albumname)},song.albumname)),
				tag('td',{'class':'remove'},
					tag('a',{href:'javascript:void(0)',onclick:'$(this).parents("tr").first().remove();'},
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
		_dragover: function (event) {
			var playlist = $('#playlist');
			(playlist.find('> * > tr.drop')
				.removeClass('drop')
				.removeClass('before')
				.removeClass('after'));
			var tbody = playlist.find('> tbody');
			var pos = tbody.offset();
			var y = event.pageY;
			var x = event.pageX;
			if (x < pos.left || x > (pos.left + tbody.width()) || !$('#playlist-container').is(':visible')) {
				return;
			}
			if (y <= pos.top) {
				var track = tbody.find('> tr:first');
				if (track.length === 0) {
					playlist.find('> thead > tr').addClass('drop after');
				}
				else {
					track.addClass('drop before');
				}
			}
			else if (y >= (pos.top + tbody.height())) {
				var track = tbody.find('> tr:last');
				if (track.length === 0) {
					playlist.find('> thead > tr').addClass('drop after');
				}
				else {
					track.addClass('drop after');
				}
			}
			else {
				var tracks = tbody.find('> tr');
				
				// binary search:
				var start = 0;
				var end = tracks.length;
				while (start !== end) {
					var index = Math.floor((start + end) * 0.5);
					var track = $(tracks[index]);
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
							track.addClass('drop after');
						}
						else if (index > 0) {
							$(tracks[index-1]).addClass('drop after');
						}
						else {
							track.addClass('drop before');
						}
						break;
					}
				}
			}
		},
		DraggableOptions: {
			visual: true,
			distance: 4,
			create: function (event) {
				return {
					render: function () {
						var playlist = $('#playlist');

						var track = $(event.target);
						if (!track.is('tr')) {
							track = track.parents('tr').first();
						}

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
					drag: function (event) {
						Magnatune.Playlist._dragover(event);
					},
					drop: function (event) {
						var playlist = $('#playlist');
						var target = playlist.find('.drop');

						if (target.length > 0) {
							var selection = playlist.find('> tbody > tr.selected');
							if (target.parent().is('thead')) {
								playlist.find('> tbody').append(selection);
							}
							else {
								var realTarget = target;
								var before = target.hasClass('before');
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

						(target
							.removeClass('drop')
							.removeClass('before')
							.removeClass('after'));
					}
				};
			}
		},
		replace: function (songs, forceplay) {
			this.clear();
			this.enqueue(songs);
			this.setCurrentIndex(0, forceplay);
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
					if (data.head.changed != Magnatune.Collection.Changed) {
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
			$('#search').val('');
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
							return {
								drag: function (event) {
									Magnatune.Playlist._dragover(event);
								},
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
									(target
										.removeClass('drop')
										.removeClass('before')
										.removeClass('after'));
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
						var song = $(event.target).dataset();
						return {
							render: function () {
								return tag('span',song.desc+' - '+song.albumname+' - '+
									Magnatune.Collection.Albums[song.albumname].artist.artist);
							},
							drag: function (event) {
								Magnatune.Playlist._dragover(event);
							},
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
								(target
									.removeClass('drop')
									.removeClass('before')
									.removeClass('after'));
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
		toggleModeSelect: function () {
			var mode = $('#tree-mode-select');
			if (mode.is(':visible')) {
				mode.hide();
			}
			else {
				var button = $('#tree-mode-button')[0];
				mode.css({
					visibility: 'hidden',
					display: ''
				});
				mode.css({
					visibility: '',
					left: (button.offsetLeft)+'px',
					top: (button.offsetTop+button.offsetHeight)+'px'
				});
			}
		},
		toggleOrderSelect: function () {
			var order = $('#tree-order-select');
			if (order.is(':visible')) {
				order.hide();
			}
			else {
				var button = $('#tree-order-button')[0];
				order.css({
					visibility: 'hidden',
					display: ''
				});
				order.css({
					visibility: '',
					left: (button.offsetLeft)+'px',
					top: (button.offsetTop+button.offsetHeight)+'px'
				});
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
		source:  null,
		handler: null,
		draggable: function (element, options) {
			$(element).on('mousedown', function (event) {
				if (Magnatune.DnD.source || event.which !== 1) return;
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

				event.preventDefault();
			});
			element = null;
		},
		start: function (event, options) {
			if (options.visual) {
				var handler = options.create.call(this,event);
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
					}
				};
			}
			else {
				Magnatune.DnD.handler = options.create.call(this,event);
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
			}
			spin();

			var username = $('#username').val();
			var password = $('#password').val();		
			src = "http://"+username+":"+password+"@stream.magnatune.com"+path;
			onerror = function (event) {
				if (event.originalEvent.target === script) {
					Magnatune.authenticated = false;
					spinner.hide();
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

		var script = tag('script',{
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
	// TODO: Hints/Tour
	save: function () {
		if (typeof(localStorage) !== "undefined") {
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
		var hash, songs, current, member, volume, playerVisible, navigationVisible, playlistVisible, order, mode;
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
		if (typeof(localStorage) !== "undefined") {
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
			// We cannot save username and password for security reasons which makes the member flag useless:
			member = null; // getBoolean('player.member');
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

		if (member === true) {
			Magnatune.Player.setMember(true);
		}
		else if (member === false) {
			Magnatune.Player.setMember(false);
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
};

Magnatune.Events.extend(Magnatune);
Magnatune.Events.extend(Magnatune.Player);
Magnatune.Events.extend(Magnatune.Info);
Magnatune.Events.extend(Magnatune.Playlist);
Magnatune.Events.extend(Magnatune.Collection);
Magnatune.Events.extend(Magnatune.Navigation);

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

$(document).ready(function () {
	if (!document.body.scrollIntoView && !document.body.scrollIntoViewIfNeeded) {
		$('#show-current').hide();
	}
	try {
		Magnatune.Player.initAudio();
	}
	catch (e) {}
	Magnatune.DnD.draggable($('#play-progress-container'), {
		create: function (event) {
			Magnatune.DnD.seeking = true;
			var playing = Magnatune.Player.playing();
			var handler = {
				drag: function (event) {
					var x = event.pageX - $(this).offset().left;
					var duration = Magnatune.Player.duration();
					var time = Math.max(0,
						Math.min(duration, duration * x / $(this).width()));
					if (!isNaN(time)) {
						Magnatune.Player.audio.currentTime = time;
					}
				},
				drop: function (event) {
					Magnatune.DnD.seeking = false;
					if (playing) {
						var x = event.pageX - $(this).offset().left;
						if (x >= $(this).width()) {
							Magnatune.Playlist.next(true);
						}
					}
				}
			};
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
					Magnatune.Player.audio.volume = Math.max(0.0, Math.min(1.0, y / height));
				}
			};
			handler.drag.call(this,event);
			return handler;
		}
	});
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
});

$(document).click(function (event) {
	var menus = $('.popup-menu');
	var parents = $(event.target).parents();

	for (var i = 0; i < menus.length; ++ i) {
		var menu = $(menus[i]);
		var button = $('#'+menu.dataset('button'));
		
		if (menu.is(':visible') &&
			!menu.is(event.target) &&
			!button.is(event.target) &&
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
