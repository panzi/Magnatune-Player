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
				// TODO: remaining time
				$('#current-duration').text(tag.time(Magnatune.Player.duration()));
			},
			waiting: function (event) {
				$('#waiting').css("visibility","visible");
			},
			error: function (event) {
				// TODO
				$('#waiting').css("visibility","hidden");
			},
			canplay: function (event) {
				$('#waiting').css("visibility","hidden");
			},
			playing: function (event) {
				$('#play-image').hide();
				$('#pause-image').show();
			},
			emptied: function (event) {
				$('#waiting').css("visibility","hidden");
			},
			pause: function (event) {
				$('#play-image').show();
				$('#pause-image').hide();
			},
			ended: function (event) {
				$('#play-image').show();
				$('#pause-image').hide();
				$('#waiting').css("visibility","hidden");
				if (!Magnatune.Drag.seeking) {
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
			$(this.audio).css('display','none');
			this.audio.volume = volume;
			this.audio.preload = "auto";
			this.audio.controls = true;
			for (var event in this.Handlers) {
				$(this.audio).on(event, this.Handlers[event]);
			}
			// seeking only works when in document! wtf?
			$(document.body).append(this.audio);
		},
		play: function () {
			var song = Magnatune.Playlist.current();
			if (!song) {
				song = Magnatune.Playlist.first();
				$('#playlist > tbody > tr:first').addClass('current');
			}
			if (!song) return;

			this.initAudio();
			this._song = song;
			var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
			this.audio.appendChild(tag('source',{
				type:'audio/ogg',
				src:"http://he3.magnatune.com/all/"+encodeURIComponent(song.mp3.replace(/\.mp3$/i,'.ogg'))}));
			this.audio.appendChild(tag('source',{
				type:'audio/mpeg;codecs="mp3"',
				src:"http://he3.magnatune.com/all/"+encodeURIComponent(song.mp3)}));
			this.audio.load();

			$('#play-progress').css('width','0px');
			var buffered = $('#buffer-progress')[0];
			var ctx = buffered.getContext('2d');
			ctx.clearRect(0,0,buffered.width,buffered.height);

			var album_url = '#/album/'+encodeURIComponent(song.albumname);
			var currently_playing = $('#currently-playing');
			var song_label = song.desc+' - '+song.albumname+' - '+artist;
			currently_playing.attr('title',song_label);
			currently_playing.find('> a').attr('href',album_url).text(song_label);

			$('#current-duration').text(tag.time(Magnatune.Player.duration()));
			$('html > head > title').text(song.desc+' - '+artist+' - Magnatune Player');
			
			this.audio.play();
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
		hide: function () {
			var d = Magnatune.Options.AnimationDuration;
			$('#player-show').show();
			$('#player-hide').hide();
			$('#player-wrapper').stop().animate({top:'-60px'},d);
			var currently_playing = $('#currently-playing').stop();
			Magnatune.Player._stopTitleAnim();
			currently_playing.animate({bottom:'6px',width:'265px'},d);
			$('#navigation, #content').stop().animate({top:'50px'},d);
		},
		show: function () {
			var d = Magnatune.Options.AnimationDuration;
			$('#player-show').hide();
			$('#player-hide').show();
			$('#player-wrapper').stop().animate({top:'0px'},d);
			var currently_playing = $('#currently-playing').stop();
			Magnatune.Player._stopTitleAnim();
			currently_playing.animate({bottom:'60px',width:'430px'},d);
			$('#navigation, #content').stop().animate({top:'110px'},d);
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
				if (scroll >= diff) {
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
					top: (button.offsetTop+button.offsetHeight+5)+'px',
					visibility: ''
				});
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
				$.ajax({
					url: 'cgi-bin/query.cgi',
					data: {action: 'embed', album: albumname},
					dataType: 'json',
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
				var album = albums[i];
				tbody.append(tag('tr',
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
						tag('br'),
						tag('a',
							{href:'#/artist/'+encodeURIComponent(album.artist.artist)},
							album.artist.artist))));
			}

			return tag('table', {'class':'albums'}, tbody);
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
		load: function (page,opts) {
			if (Object.prototype.hasOwnProperty.call(this.Pages,page)) {
				this.Pages[page](opts||{});
				return true;
			}
			else {
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
				// TODO
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
					'work at all.</p>'+
					'<p>I\'m not happy with the current color scheme and will most likely redo the visual style.</p>'+
					'<p>You can download the source code of this web page on '+
					'<a href="https://bitbucket.org/panzi/magnatune-player">bitbucket</a>.</p>'+
					'<p>Other experiments done by me can be found <a '+
					'href="http://web.student.tuwien.ac.at/~e0427417/">here</a>.</p>');
				Magnatune.Info.update('#/about',breadcrumbs,page,opts.keeptab);
			},
			genre: function (opts) {
				var genre = Magnatune.Collection.Genres[opts.id];
				var hash = '#/genre/'+encodeURIComponent(opts.id);
				var breadcrumbs = [{href:hash,text:genre.genre}];
				var page = tag('div',{'class':'genre'},
					tag('h2',tag('a',{'class':'genre',
						href:'http://magnatune.com/genres/'+genre.genre.replace(/\s/g,'').toLowerCase()+'/',
						target:'_blank'},
						genre.genre)),
					Magnatune.Info._albumsTable(genre.albums));
				Magnatune.Info.update(hash,breadcrumbs,page,opts.keeptab);
			},
			album: function (opts) {
				$.ajax({
					url: 'cgi-bin/query.cgi',
					data: {action: 'album', name: opts.id},
					dataType: 'json',
					success: function (data) {
						if (!data.body) return; // TODO
						var album = Magnatune.Collection.Albums[opts.id];
						var artist = album.artist;
						var hash = '#/album/'+encodeURIComponent(album.albumname);
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
									title: 'Enqueue',
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
									'Play Album'),
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
				$.ajax({
					url: 'cgi-bin/query.cgi',
					data: {action: 'artist', name: opts.id},
					dataType: 'json',
					success: function (data) {
						if (!data.body) return; // TODO
						var artist = Magnatune.Collection.Artists[opts.id];
						var tbody = $(tag('tbody'));
						for (var i = 0; i < artist.albums.length; ++ i) {
							var album = artist.albums[i];
							tbody.append(tag('tr',
								tag('td', tag('a',
									{href:'#/album/'+encodeURIComponent(album.albumname)},
									tag('img',{'class':'cover',
										src:'http://he3.magnatune.com/music/'+
											encodeURIComponent(album.artist.artist)+'/'+
											encodeURIComponent(album.albumname)+'/cover_50.jpg'}))),
								tag('td', tag('a',
									{href:'#/album/'+encodeURIComponent(album.albumname)},
									album.albumname))));
						}
						var hash = '#/artist/'+encodeURIComponent(artist.artist);
						var breadcrumbs = [{href: hash, text: artist.artist}];
						var page = tag('div',{'class':'artist'},
							tag('h2', tag('a', {'class':'artist',
								href:'http://magnatune.com/artists/'+data.body.homepage,
								target:'_blank'},
								artist.artist)),
							data.body.bandphoto && tag('img', {'class': 'bandphoto',
								src: 'http://magnatune.com/'+data.body.bandphoto,
								alt: 'Bandphoto'}),
							tag('table', tbody),
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
		setCurrentIndex: function (index,forceplay) {
			var playlist = $("#playlist");
			var current = playlist.find("> tbody > tr")[index];
			if (current) {
				playlist.find("> tbody > tr.current").removeClass("current");
				$(current).addClass('current');
				if (forceplay || Magnatune.Player.playing()) {
					Magnatune.Player.play();
				}
			}
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
			Magnatune.Drag.draggable(tr, Magnatune.Playlist.DraggableOptions);
			return tr;
		},
		enqueue: function (songs) {
			var tbody = $('#playlist > tbody');
			for (var i = 0; i < songs.length; ++ i) {
				tbody.append(this._buildTrack(songs[i]));
			}
		},
		_dragover: function (event) {
			var playlist = $('#playlist');
			var tbody = playlist.find('> tbody');
			(tbody.find('> tr.drop')
				.removeClass('drop')
				.removeClass('before')
				.removeClass('after'));
			var pos = tbody.offset();
			var y = event.pageY;
			var x = event.pageX;
			if (x < pos.left || x > (pos.left + tbody.width())) {
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
				var prev = null;
				for (var i = 0; i < tracks.length; ++ i) {
					var track = $(tracks[i]);
					var track_pos = track.offset();
					var track_height = track.height();
					if (track_pos.top <= y && (track_pos.top + track_height) >= y) {
						if (y > (track_pos.top + track_height * 0.5)) {
							track.addClass('drop after');
						}
						else if (prev) {
							prev.addClass('drop after');
						}
						else {
							track.addClass('drop before');
						}
						break;
					}
					prev = track;
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
			if (forceplay || Magnatune.Player.playing()) Magnatune.Player.play();
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
		length: function () {
			return $('#playlist > tbody > tr').length;
		},
		next: function (forceplay) {
			var tbody = $('#playlist > tbody');
			var current = tbody.find('> tr.current');

			var next;
			if (current.length === 0) {
				next = $('#playlist > tbody > tr:first');
			}
			else {
				next = current.next();
			}

			if (next.length > 0) {
				current.removeClass('current');
				next.addClass('current');
				if (forceplay || Magnatune.Player.playing()) Magnatune.Player.play();
			}
		},
		previous: function (forceplay) {
			var tbody = $('#playlist > tbody');
			var current = tbody.find('> tr.current');

			var prev;
			if (current.length === 0) {
				prev = $('#playlist > tbody > tr:first');
			}
			else {
				prev = current.prev();
			}

			if (prev.length > 0) {
				current.removeClass('current');
				prev.addClass('current');
				if (forceplay || Magnatune.Player.playing()) Magnatune.Player.play();
			}
		}
	},
	Collection: {
		_state: 'init',
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
				genre.artists.sort(function (a,b) {
					return a.artist < b.artist ? -1 : a.artist > b.artist ? 1 : 0;
				});
				genres[genre.genre] = genre;
			}
			
			for (var i = 0; i < sorted_artists.length; ++ i) {
				var artist = sorted_artists[i];
				var artist_genres = artist.genres;
				artist.genres = [];
				for (var genre_name in artist_genres) {
					artist.genres.push(genres[genre_name]);
				}
				artist.genres.sort(function (a,b) {
					return a.genre < b.genre ? -1 : a.genre > b.genre ? 1 : 0;
				});
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
				$.ajax({
					url: 'cgi-bin/query.cgi',
					data: {action: 'album', name: album.albumname},
					dataType: 'json',
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
		show: function () {
			var d = Magnatune.Options.AnimationDuration;
			$('#content').stop().animate({left:'390px'},d);
			$('#navigation').stop().animate({left:'10px'},d);
			$('#navigation-hide').show();
			$('#navigation-show').hide();
		},
		hide: function () {
			var d = Magnatune.Options.AnimationDuration;
			$('#content').stop().animate({left:'20px'},d);
			$('#navigation').stop().animate({left:'-360px'},d);
			$('#navigation-hide').hide();
			$('#navigation-show').show();
		},
		clear: function () {
			$('#search').val('');
			this.filter('');
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
						list.append(tag.expander({
							label: genre.genre,
							head_attrs: {
								href: '#/genre/'+encodeURIComponent(genre.genre),
								onclick: Magnatune.Info.load.bind(Magnatune.Info,
									'genre',{id:genre.genre,keeptab:true})
							},
							render: function (parent) {
								Magnatune.Navigation.Modes.ArtistAlbum.render(parent, this.artists, album_filter.bind(this));
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
						$.ajax({
							url: 'cgi-bin/query.cgi',
							data: {action: 'search', query: query, mode: 'genre/artist/album'},
							dataType: 'json',
							success: function (data) {
								parent.empty();
								if (!data.body) return; // TODO

								var genres_to_sort  = [];
								var artists_to_sort = [];

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
											genres_to_sort.push(new_genre);
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
										artists_to_sort.push(new_artist);
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
										genres: album.genres
									};
									new_album.artist = add_album(new_album,album.artist);
								}

								for (var i = 0; i < genres_to_sort.length; ++ i) {
									genres_to_sort[i].artists.sort(function (a,b) {
										return a.artist < b.artist ? -1 : a.artist > b.artist ? 1 : 0;
									});
								}

								for (var i = 0; i < artists_to_sort.length; ++ i) {
									artists_to_sort[i].albums.sort(function (a,b) {
										return a.albumname < b.albumname ? -1 : a.albumname > b.albumname ? 1 : 0;
									});
								}

								var sorted_genres = [];
								for (var genre in genres) {
									sorted_genres.push(genres[genre]);
								}
								sorted_genres.sort(function (a,b) {
									return a.genre < b.genre ? -1 : a.genre > b.genre ? 1 : 0;
								});
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
						list.append(tag.expander({
							label: artist.artist,
							head_attrs: {
								href: '#/artist/'+encodeURIComponent(artist.artist),
								onclick: Magnatune.Info.load.bind(Magnatune.Info,
									'artist',{id:artist.artist,keeptab:true}),
								title: artist.artist
							},
							render: function (parent) {
								Magnatune.Navigation.Modes.Album.render(parent,
									album_filter ? this.albums.filter(album_filter) : this.albums);
							}.bind(artist)
						}));
					}

					$(parent).append(list);
				},
				filter: function (parent, query) {
					// TODO
					if (!query) {
						parent.empty();
						this.render(parent, Magnatune.Collection.SortedArtists);
					}
					else {
						$.ajax({
							url: 'cgi-bin/query.cgi',
							data: {action: 'search', query: query, mode: 'artist/album'},
							dataType: 'json',
							success: function (data) {
								parent.empty();
								if (!data.body) return; // TODO

								var artists_to_sort = [];

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
										artists_to_sort.push(new_artist);
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
										songs: data.body.songs[albumname]
									};
									new_album.artist = add_album(new_album,album.artist);
								}

								for (var i = 0; i < artists_to_sort.length; ++ i) {
									artists_to_sort[i].albums.sort(function (a,b) {
										return a.albumname < b.albumname ? -1 : a.albumname > b.albumname ? 1 : 0;
									});
								}

								var sorted_artists = [];
								for (var artist in artists) {
									sorted_artists.push(artists[artist]);
								}
								sorted_artists.sort(function (a,b) {
									return a.artist < b.artist ? -1 : a.artist > b.artist ? 1 : 0;
								});

								Magnatune.Navigation.Modes.ArtistAlbum.render(parent, sorted_artists);
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
									tag('td',{'class':'albumname'},album.albumname))));
						Magnatune.Drag.draggable(label, this.draggable(album));

						list.append(tag.expander({
							label: label,
							head_attrs: {
								'class': 'album-head',
								href: '#/album/'+encodeURIComponent(album.albumname),
								onclick: Magnatune.Info.load.bind(Magnatune.Info,
									'album',{id:album.albumname,keeptab:true}),
								ondblclick: Magnatune.Collection.withSongs.bind(Magnatune.Collection, album, function (album) {
									var songs = album.songs;
									for (var i = 0; i < songs.length; ++ i) {
										songs[i].albumname = album.albumname;
									}
									Magnatune.Playlist.replace(songs, true);
								}),
								title: album.albumname
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
						this.render(parent, Magnatune.Collection.SortedAlbums);
					}
					else {
						$.ajax({
							url: 'cgi-bin/query.cgi',
							data: {action: 'search', query: query, mode: 'album'},
							dataType: 'json',
							success: function (data) {
								parent.empty();
								if (!data.body) return; // TODO

								var sorted_albums = [];
								for (var i = 0; i < data.body.albums.length; ++ i) {
									sorted_albums.push(Magnatune.Collection.Albums[data.body.albums[i]]);
								}

								for (var albumname in data.body.songs) {
									var album = {
										albumname: albumname,
										songs: data.body.songs[albumname]
									};
									album.artist = Magnatune.Collection.Albums[albumname].artist;
									sorted_albums.push(album);
								}

								sorted_albums.sort(function (a,b) {
									return a.albumname < b.albumname ? -1 : a.albumname > b.albumname ? 1 : 0;
								});

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
						Magnatune.Drag.draggable(item, this.DraggableOptions);
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
			mode = mode.trim().toLowerCase();
			$('#tree-mode-select').hide();
			
			// TODO: filter and keep expand and scroll state
			switch (mode) {
				case 'album':
				case 'artist/album':
				case 'genre/artist/album':
					$('#tree-mode-select li').removeClass('active');
					$('#mode-'+mode.replace(/\//g,'-')).addClass('active');

					this.filter($('#search').val());
					break;

				default:
					throw new Error("Illegal mode: "+mode);
			}	
		},
		mode: function () {
			return $('#tree-mode-select li.active')[0].id.replace(/^mode-/,'').replace(/-/g,'/');
		},
		toggleModeSelect: function () {
			var mode = $('#tree-mode-select');
			if (mode.is(':visible')) {
				mode.hide();
			}
			else {
				var button = $('#tree-mode-button');
				var pos = button.position();
				mode.css({
					left: (pos.left+button.width()-mode.width())+'px',
					top: (pos.top+button.height())+'px'
				});
				mode.show();
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

		var m = /^#?\/([^\/]+)(?:\/(.*))?/.exec(window.location.hash);

		if (m) {
			var page = m[1];
			var opts = {};
			if (typeof(m[2]) !== "undefined") {
				opts.id = decodeURIComponent(m[2]);
			}
			return Magnatune.Info.load(page, opts);
		}

		return false;
	},
	Drag: {
		source:  null,
		handler: null,
		draggable: function (element, options) {
			$(element).on('mousedown', function (event) {
				if (Magnatune.Drag.source || event.which !== 1) return;
				Magnatune.Drag.source = this;

				if (options.distance) {
					var startEvent = event;
					Magnatune.Drag.handler = {
						drag: function (event) {
							var dx = event.pageX - startEvent.pageX;
							var dy = event.pageY - startEvent.pageY;
							if (Math.sqrt(dx * dx + dy * dy) >= options.distance) {
								Magnatune.Drag.start.call(this,startEvent,options);
								if (Magnatune.Drag.handler.drag) {
									Magnatune.Drag.handler.drag.call(this,event);
								}
							}
						}
					};
				}
				else {
					Magnatune.Drag.start.call(this,event,options);
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
					Magnatune.Drag.element = $(handler.render.call(this));
					Magnatune.Drag.element.addClass('dragged').css({
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
					Magnatune.Drag.element = $(clone);
					Magnatune.Drag.element.addClass('dragged').css({
						left: offset.left+'px',
						top:  offset.top+'px',
						width:  $(this).width()+'px',
						height: $(this).height()+'px'
					});
				}
				offset.left -= event.pageX;
				offset.top  -= event.pageY;
				$(document.body).append(Magnatune.Drag.element);

				Magnatune.Drag.handler = {
					drag: function (event) {
						Magnatune.Drag.element.css({
							left: (event.pageX + offset.left)+'px',
							top:  (event.pageY + offset.top)+'px'
						});
						if (handler.drag) handler.drag.call(this,event);
					},
					drop: function (event) {
						Magnatune.Drag.element.remove();
						Magnatune.Drag.element = null;
						if (handler.drop) handler.drop.call(this,event);
					}
				};
			}
			else {
				Magnatune.Drag.handler = options.create.call(this,event);
			}
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
	if (Magnatune.Drag.handler && Magnatune.Drag.handler.drag) {
		Magnatune.Drag.handler.drag.call(Magnatune.Drag.source, event);
	}
});

$(document).on('mouseup', function (event) {
	if (Magnatune.Drag.handler) {
		if (Magnatune.Drag.handler.drop) {
			Magnatune.Drag.handler.drop.call(Magnatune.Drag.source, event);
		}
		Magnatune.Drag.source  = null;
		Magnatune.Drag.handler = null;
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
	Magnatune.Drag.draggable($('#play-progress-container'), {
		create: function (event) {
			Magnatune.Drag.seeking = true;
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
					Magnatune.Drag.seeking = false;
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
	Magnatune.Drag.draggable($('#volume-bar-container'), {
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
		Magnatune.Navigation.setMode('genre/artist/album');
		if (/^#?$/.test(window.location.hash)) {
			window.location.hash = '#/about';
		}
		else {
			Magnatune.showHash();
		}
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
	Magnatune.Collection.load();
});

$(window).on('hashchange',function (event) {
	Magnatune.showHash();
});

$(document).click(function (event) {
	var mode = $('#tree-mode-select');
	if (!mode.is(event.target) && !$('#tree-mode-button').is(event.target) &&
		$(event.target).parents().index(mode) === -1) {
		mode.hide();
	}
	var volume = $('#volume-control');
	if (!volume.is(event.target) && !$('#volume-button').is(event.target) &&
		$(event.target).parents().index(volume) === -1) {
		volume.hide();
	}
});
