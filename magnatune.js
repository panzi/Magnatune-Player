"use strict";

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
					element.className = String(value);
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
	var link_pattern = /\b((?:https?|s?ftp|mailto|irc|file|ssh|telnet):[^\s\(\)\[\]!]+)|\b([_a-z0-9]+(?:[-_a-z0-9\.]+[_a-z0-9]+)?@[_a-z0-9]+(?:[-_a-z0-9\.]+[_a-z0-9]+)?)\b|((?:www\.|[-a-z0-9]+(?:[-a-z0-9\.]+[-a-z0-9]+)?\.(ac|ad|ae|aero|af|ag|ai|al|am|an|ao|aq|ar|arpa|as|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|info|int|io|iq|ir|is|it|je|jm|jo|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mo|mobi|mp|mq|mr|ms|mt|mu|museum|mv|mw|mx|my|mz|na|name|nc|ne|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--3e0b707e|xn--45brj9c|xn--80akhbyknj4f|xn--90a3ac|xn--9t4b11yi5a|xn--clchc0ea0b2g2a9gcd|xn--deba0ad|xn--fiqs8s|xn--fiqz9s|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--g6w251d|xn--gecrj9c|xn--h2brj9c|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--j6w193g|xn--jxalpdlp|xn--kgbechtv|xn--kprw13d|xn--kpry57d|xn--lgbbat1ad8j|xn--mgbaam7a8h|xn--mgbayh7gpa|xn--mgbbh1a71e|xn--mgbc0a9azcg|xn--mgberp4a5d4ar|xn--o3cw4h|xn--ogbpf8fl|xn--p1ai|xn--pgbs0dh|xn--s9brj9c|xn--wgbh1c|xn--wgbl6a|xn--xkc2al3hye2a|xn--xkc2dl3a5ee0h|xn--yfro4i67o|xn--ygbi2ammx|xn--zckzah|xxx|ye|yt|za|zm|zw)\b)[^\s\(\)\[\]!]+)/i;

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
		var ul_opts = $.extend({},opts);
		delete ul_opts.label;
		delete ul_opts.children;
		return tag('li', tag('a', {href:'javascript:void(0)', onclick: function () {
				var li = $(this).parent();
				var ul = li.children('ul');

				if (ul.length === 0) {
					var ul = $(tag('ul',ul_opts));
					var children = opts.children(ul);
					li.append(ul);
				}
				else {
					ul.remove();
				}
			}}, opts.label));
	};

	return tag;
})(jQuery);

var Magnatune = {
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
		},
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
				ctx.fillStyle = '#a0a0ff';
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
			emptied: function (event) {
				$('#waiting').css("visibility","hidden");
			},
			ended: function (event) {
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
			this.audio.appendChild(tag('source',{type:'audio/ogg',src:"http://he3.magnatune.com/all/"+encodeURIComponent(song.mp3.replace(/\.mp3$/i,'.ogg'))}));
			this.audio.appendChild(tag('source',{type:'audio/mpeg;codecs="mp3"',src:"http://he3.magnatune.com/all/"+encodeURIComponent(song.mp3)}));
			this.audio.load();

			$('#play-progress').css('width','0px');
			var buffered = $('#buffer-progress')[0];
			var ctx = buffered.getContext('2d');
			ctx.clearRect(0,0,buffered.width,buffered.height);

			var album_url = '#/album/'+encodeURIComponent(song.albumname);
			$('#currently-playing').attr('title',song.desc+' - '+song.albumname+' - '+artist);
			$('#current-song').text(song.desc).attr('href',album_url);
			$('#current-album').text(song.albumname).attr('href',album_url);
			$('#current-artist').text(artist).attr('href','#/artist/'+encodeURIComponent(artist));
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
		toggleVolume: function () {
			var volume = $('#volume-control');
			if (volume.is(':visible')) {
				volume.hide();
			}
			else {
				var button = $('#volume-button');
				var pos = button.position();
				volume.css({
					left: pos.left+'px',
					top: (pos.top+button.height())+'px'
				});
				volume.show();
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
		show: function (path,keeptab) {
			if (!keeptab) {
				$('#info-button').addClass('active');
				$('#playlist-button').removeClass('active');
				$('#playlist-container').hide();
				$('#info').show();
			}

			if (path) {
				var breadcrumbs = $('#breadcrumbs');
				breadcrumbs.empty();
				for (var i = 0; i < path.length; ++ i) {
					var el = path[i];
					breadcrumbs.append(tag('li', i === 0 ? {'class':'first'} : null,
						tag('a', {href:el.href}, el.text)));
				}
			}
		},
		visible: function () {
			return $('#info').is(':visible');
		},
		showingAlbum: function (albumname) {
			if (!this.visible()) return false;
			var content = $("#info-content > div").first();
			return content.hasClass('album') && content.find('h2 .albumname').text() === albumname;
		},
		showingArtist: function (artist) {
			if (!this.visible()) return false;
			var content = $("#info-content > div").first();
			return content.hasClass('artist') && content.find('h2 .artist').text() === artist;
		},
		showAbout: function () {
			$("#info-content").html(tag('div',{'class':'about'},
				tag('h2','About Magnatune Player'),
				tag('p','TODO: About text.')));
			this.show([{href:'#/about',text:'About'}]);
		},
		showAlbum: function (albumname,keeptab) {
			var info = $("#info-content");
			var hash = '#/album/'+encodeURIComponent(albumname);
			if (!keeptab || Magnatune.Info.visible()) window.location.hash = hash;
			$('#info-button > a').attr('href',hash);
			$.ajax({
				url: 'cgi-bin/query.cgi',
				data: {action: 'album', name: albumname},
				dataType: 'json',
				success: function (data) {
					if (!data.body) return; // TODO
					var artist = Magnatune.Collection.Albums[albumname].artist;
					var breadcrumbs = [
						{href: '#/artist/'+encodeURIComponent(artist.artist), text: artist.artist},
						{href: hash, text: albumname}];
					Magnatune.Info.show(breadcrumbs,keeptab);
					var songs = [];
					for (var i = 0; i < data.body.songs.length; ++ i) {
						var song = data.body.songs[i];
						
						song.albumname = data.body.albumname;
						songs.push(tag('tr',
							tag('td', {'class':'number'}, song.number),
							tag('td', song.desc),
							tag('td', {'class':'duration'}, tag.time(song.duration)),
							tag('td', tag('a',{
								title: 'Enqueue',
								href:'javascript:Magnatune.Playlist.enqueue(['+
									JSON.stringify(song)+']);void(0)'},'+'))));
					}

					info.html(tag('div',{'class':'album'},
						tag('h2', tag('a', {'class':'albumname',
							href:'http://magnatune.com/artists/albums/'+data.body.sku+'/'},
							data.body.albumname)),
						tag('div',{'class':'buy',title:'Buy this Album'},
							tag('a',{href:'https://magnatune.com/buy/choose?sku='+data.body.sku},'Buy')),
						tag('img', {'class':'cover',
							src: 'http://he3.magnatune.com/music/'+
								encodeURIComponent(data.body.artist)+'/'+
								encodeURIComponent(data.body.albumname)+'/cover_300.jpg',
							alt: 'Cover'}),
						tag.textify(data.body.description),
						tag('div',
							tag('a', {href:'javascript:Magnatune.Playlist.replace('+
								JSON.stringify(data.body.songs)+',true);void(0)'}, 'Play Album'),
							' ',
							tag('a', {href:'javascript:Magnatune.Playlist.enqueue('+
								JSON.stringify(data.body.songs)+');void(0)'}, 'Enqueue Album')),
						tag('table',
							tag('thead',
								tag('tr',
									tag('th','Nr'),
									tag('th','Title'),
									tag('th','Duration'),
									tag('th',''))),
							tag('tbody', songs))));
				},
				error: function () {
					// TODO
				}
			});
		},
		showArtist: function (artist,keeptab) {
			var info = $("#info-content");
			var hash = '#/artist/'+encodeURIComponent(artist);
			if (!keeptab || Magnatune.Info.visible()) window.location.hash = hash;
			$('#info-button > a').attr('href',hash);
			$.ajax({
				url: 'cgi-bin/query.cgi',
				data: {action: 'artist', name: artist},
				dataType: 'json',
				success: function (data) {
					if (!data.body) return; // TODO
					var breadcrumbs = [{href: hash, text: artist}];
					Magnatune.Info.show(breadcrumbs,keeptab);
					var albums = Magnatune.Collection.Artists[artist].albums;
					var album_rows = [];
					for (var i = 0; i < albums.length; ++ i) {
						var album = albums[i];
						album_rows.push(tag('tr',
							tag('td', tag('a',
								{href:'#/album/'+encodeURIComponent(album.albumname)},
								tag('img',{'class':'cover',
									src:'http://he3.magnatune.com/music/'+
										encodeURIComponent(artist)+'/'+
										encodeURIComponent(album.albumname)+'/cover_50.jpg'}))),
							tag('td', tag('a',
								{href:'#/album/'+encodeURIComponent(album.albumname)},
								album.albumname))));
					}
					info.html(tag('div',{'class':'artist'},
						tag('h2', tag('a', {'class':'artist',
							href:'http://magnatune.com/artists/'+data.body.homepage},
							data.body.artist)),
						data.body.bandphoto && tag('img', {'class': 'bandphoto',
							src: 'http://magnatune.com/'+data.body.bandphoto, alt: 'Bandphoto'}),
						tag('table', tag('tbody', album_rows)),
						tag.textify(data.body.bio)));
				},
				error: function () {
					// TODO
				}
			});
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
		enqueue: function (songs) {
			var tbody = $('#playlist > tbody');
			for (var i = 0; i < songs.length; ++ i) {
				var song = songs[i];
				var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
				var tr = tag('tr',{dataset:song,
					onclick:Magnatune.Playlist._click_song,
					ondblclick:Magnatune.Playlist._dblclick_song},
					tag('td',{'class':'number'},song.number),
					tag('td',song.desc),
					tag('td',{'class':'duration'},tag.time(song.duration)),
					tag('td',tag('a',{href:'#/artist/'+encodeURIComponent(artist)},artist)),
					tag('td',tag('a',{href:'#/album/'+encodeURIComponent(song.albumname)},song.albumname)),
					tag('td',tag('a',{href:'javascript:void(0)',onclick:'$(this).parents("tr").first().remove();'},'\u00d7')));
				Magnatune.Drag.draggable(tr, Magnatune.Playlist.DraggableOptions);
				tbody.append(tr);
			}
		},
		_dragover: function (event) {
			var playlist = $('#playlist');
			(playlist.find('> tbody > tr.drop')
				.removeClass('drop')
				.removeClass('before')
				.removeClass('after'));
			var pos = playlist.offset();
			var y = event.pageY;
			var x = event.pageX;
			if (x < pos.left || x > (pos.left + playlist.width())) {
				return;
			}
			if (y <= pos.top) {
				playlist.find('> tbody > tr:first').addClass('drop before');
			}
			else if (y >= (pos.top + playlist.height())) {
				playlist.find('> tbody > tr:last').addClass('drop after');
			}
			else {
				var tracks = playlist.find('> tbody > tr');
				for (var i = 0; i < tracks.length; ++ i) {
					var track = $(tracks[i]);
					var track_pos = track.offset();
					var track_height = track.height();
					if (track_pos.top <= y && (track_pos.top + track_height) >= y) {
						if (y > (track_pos.top + track_height * 0.5)) {
							track.addClass('drop after');
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
					clone: function () {
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
						var target = playlist.find('> tbody > tr.drop');

						if (target.length > 0) {
							var selection = playlist.find('> tbody > tr.selected');
							var realTarget = target;
							var before = target.hasClass('before');
							if (selection.index(realTarget) > -1) {
								realTarget = selection.first().prev();
								before = false;
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
					var sorted_artists = Magnatune.Collection.SortedArtists = data.body.artists;
					var sorted_genres  = Magnatune.Collection.SortedGenres  = data.body.genres;
					var sorted_albums  = Magnatune.Collection.SortedAlbums  = data.body.albums;
					
					var artists = Magnatune.Collection.Artists = {};
					var genres  = Magnatune.Collection.Genres  = {};
					var albums  = Magnatune.Collection.Albums  = {};

					// resolve associations
					for (var i = 0; i < sorted_artists.length; ++ i) {
						var artist = sorted_artists[i];
						artists[artist.artist] = artist;
					}
					
					for (var i = 0; i < sorted_albums.length; ++ i) {
						var album = sorted_albums[i];
						var artist = album.artist = artists[album.artist];
						if (!artist.albums) artist.albums = [];
						artist.albums.push(album);
						albums[album.albumname] = album;
					}

					for (var i = 0; i < sorted_genres.length; ++ i) {
						var genre = sorted_genres[i];
						var genre_artists = {};
						for (var j = 0; j < genre.albums.length; ++ j) {
							var album = genre.albums[j] = albums[genre.albums[j]];
							if (!album.genres) album.genres = [];
							album.genres.push(genre);
							genre_artists[album.artist.artist] = album.artist;
						}
						genre.artists = [];
						for (var artist_name in genre_artists) {
							genre.artists.push(genre_artists[artist_name]);
						}
						genre.artists.sort(function (a,b) { return a.artist < b.artist ? -1 : a.artist > b.artist ? 1 : 0; });
						genres[genre.genre] = genre;
					}

					Magnatune.Collection._state = 'ready';
					Magnatune.Collection.trigger('ready');
				},
				error: function () {
					// TODO
				}
			});
		},
		ready: function (f) {
			if (this._state === 'ready') {
				f.call(this);
			}
			else {
				this.on('ready',f);
			}
		}
	},
	Navigation: {
		clear: function () {
			$('#search').val('');
			this.filter('');
		},
		filter: function (text) {
			// TODO
		},
		setMode: function (mode) {
			var id = mode.replace(/\//g,'-');
			$('#tree-mode-select').hide();
			
			// TODO
			var tree = $('#tree');
			tree.empty();
			switch (mode) {
				case 'album':
					break;

				case 'artist/album':
					break;

				case 'genre/artist/album':
					// XXX: can't filter tihs way!
					var genres = Magnatune.Collection.SortedGenres;
					for (var i = 0; i < genres.length; ++ i) {
						var genre = genres[i];
						tree.append(tag.expander({
							label: genre.genre,
							'class': 'artists',
							children: function (parent) {
								for (var i = 0; i < this.artists.length; ++ i) {
									var artist = this.artists[i];
									parent.append(tag.expander({
										label: artist.artist,
										'class': 'albums',
										children: function (parent) {
											Magnatune.Info.showArtist(this.artist,true);
											for (var i = 0; i < this.albums.length; ++ i) {
												var album = this.albums[i];
												parent.append(tag.expander({
													label: [tag('img',{alt:'',draggable:false,
														src:'http://he3.magnatune.com/music/'+
															encodeURIComponent(this.artist)+'/'+
															encodeURIComponent(album.albumname)+'/cover_50.jpg'}),
														' ',album.albumname],
													'class': 'songs',
													children: function (parent) {
														Magnatune.Info.showAlbum(this.albumname,true);
														$.ajax({
															url: 'cgi-bin/query.cgi',
															data: {action: 'album', name: this.albumname},
															dataType: 'json',
															success: function (data) {
																if (!data.body) return; // TODO
																var songs = data.body.songs;
																for (var i = 0; i < songs.length; ++ i) {
																	var song = songs[i];
																	// TODO
																	parent.append(tag('li', song.desc));
																}
															},
															error: function () {
																// TODO
															}
														});
													}.bind(album)
												}));
											}
										}.bind(artist)
									}));
								}
							}.bind(genre)
						}));
					}
					break;

				default:
					throw new Error("illegal mode: "+mode);
			}
			
			this.trigger('modechange',mode);
			$('#tree-mode-select li').removeClass('active');
			$('#mode-'+id).addClass('active');
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
					left: pos.left+'px',
					top: (pos.top+button.height())+'px'
				});
				mode.show();
			}
		}
	},
	showHash: function () {
		var m = /^#?\/([^\/]+)(?:\/(.*))?/.exec(window.location.hash);

		if (m) {
			switch (m[1]) {
				case 'info':
					Magnatune.Info.show();
					return true;

				case 'album':
					var albumname = decodeURIComponent(m[2]);
					if (!Magnatune.Info.showingAlbum(albumname)) {
						Magnatune.Info.showAlbum(albumname);
					}
					return true;

				case 'artist':
					var artist = decodeURIComponent(m[2]);
					if (!Magnatune.Info.showingArtist(artist)) {
						Magnatune.Info.showArtist(artist);
					}
					return true;

				case 'playlist':
					Magnatune.Playlist.show();
					return true;

				case 'about':
					Magnatune.Info.showAbout();
					return true;
			}
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
				if (handler.clone) {
					Magnatune.Drag.element = $(handler.clone.call(this));
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
	Magnatune.Player.initAudio();
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
	// TODO: delay filtering
	var search = $('#search');
	search.on('change paste cut drop', function (event) {
		Magnatune.Navigation.filter(this.value);
	});
	search.on('keyup', function (event) {
		var value = this.value;
		setTimeout(function () {
			if (this.value !== value) {
				Magnatune.Navigation.filter(this.value);
			}
		}.bind(this), 0);
	});
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
