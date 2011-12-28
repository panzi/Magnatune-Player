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
		song: function () {
			var audio = $('#audio');
			if (audio.dataset('albumname') === undefined) {
				return null;
			}
			return audio.dataset();
		},
		duration: function () {
			var audio = $('#audio');
			var duration = audio[0].duration;
			if (duration === Infinity) {
				duration = audio.dataset('duration');
				if (duration === undefined) {
					duration = Infinity;
				}
			}
			return duration;
		},
		currentTime: function () {
			return $('#audio')[0].currentTime;
		},
		play: function (song) {
			var audio = $('#audio');
			var el = audio[0];

			if (!el.paused && !el.ended) {
				el.pause();
			}
			if (song) {
				audio.empty();
				audio.dataset(song);
				var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
				var url = "http://he3.magnatune.com/all/"+encodeURIComponent((
					(song.number < 10 ? '0'+song.number : song.number)+"-"+
					song.desc+'-'+artist).replace(/[:\/]/g,'_'));
				audio.append(tag('source',{type:'audio/mpeg;codecs="mp3"',src:url+'.mp3'}));
				audio.append(tag('source',{type:'audio/ogg',src:url+'.ogg'}));

				$('#current-song').text(song.desc);
				$('#current-album').text(song.albumname).attr('href','#/album/'+encodeURIComponent(song.albumname));
				$('#current-artist').text(artist).attr('href','#/artist/'+encodeURIComponent(artist));

				$('html > head > title').text(song.desc+' - '+artist+' - Magnatune Player');
			}
			else {
				if (!el.currentSrc) {
					// TODO: play playlist
				}
			}
			el.play();

//			this.trigger('play', song);
		},
		pause: function () {
//			this.trigger('pause');
		},
		stop: function () {
//			this.trigger('stop');
		},
		previous: function (forceplay) {
//			this.trigger('previous');
		},
		next: function (forceplay) {
//			this.trigger('next');
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
			$('#audio')[0].mute = true;
		},
		unmute: function () {
			$('#audio')[0].mute = false;
		},
		setVolume: function (volume) {
			$('#audio')[0].volume = volume;
		},
		volume: function () {
			return $('#audio')[0].volume;
		}
	},
	Info: {
		show: function (path,keeptab) {
			if (!keeptab) {
				$('#info-button').addClass('active');
				$('#playlist-button').removeClass('active');
				$('#playlist').hide();
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
			if (!keeptab) window.location.hash = hash;
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
								JSON.stringify(data.body.songs)+');void(0)'}, 'Play Album'),
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
			if (!keeptab) window.location.hash = hash;
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
			$('#playlist').show();
			$('#info').hide();
		},
		visible: function () {
			return $('#playlist').is(':visible');
		},
		enqueue: function (songs) {
			// TODO
			var tbody = $('#playlist > tbody');
			for (var i = 0; i < songs.length; ++ i) {
				var song = songs[i];
				var artist = Magnatune.Collection.Albums[song.albumname].artist.artist;
				tbody.append(tag('tr',
					tag('td',{'class':'number'},song.number),
					tag('td',song.desc),
					tag('td',{'class':'duration'},tag.time(song.duration)),
					tag('td',tag('a',{href:'#/artist/'+encodeURIComponent(artist)},artist)),
					tag('td',tag('a',{href:'#/album/'+encodeURIComponent(song.albumname)},song.albumname)),
					tag('td',tag('a',{href:'javascript:void(0)',onclick:'$(this).parents("tr").first().remove();'},'\u00d7'))));
			}
		},
		replace: function (songs) {
			this.clear();
			this.enqueue(songs);
		},
		clear: function () {
			// TODO
			$('#playlist > tbody').empty();
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
				case 'artist':
					break;

				case 'artist/album':
					break;

				case 'album':
					break;

				case 'genre/artist':
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
														album.albumname],
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
	Mouse: {
		x: 0,
		y: 0
	},
	Drag: {
		element: null,
		type:    null,
		object:  null
	}
};

Magnatune.Events.extend(Magnatune);
Magnatune.Events.extend(Magnatune.Player);
Magnatune.Events.extend(Magnatune.Info);
Magnatune.Events.extend(Magnatune.Playlist);
Magnatune.Events.extend(Magnatune.Collection);
Magnatune.Events.extend(Magnatune.Navigation);

$(document).on('mousemove', function (event) {
	if (Magnatune.Drag.element) {
		var dx = event.pageX - Magnatune.Mouse.x;
		var dy = event.pageY - Magnatune.Mouse.y;
		var element = $(Magnatune.Drag.element);
		var position = element.offset();
		element.css({
			left: (position.x + dx)+'px',
			top:  (position.y + dy)+'px',
		});
	}
	Magnatune.Mouse.x = event.pageX;
	Magnatune.Mouse.y = event.pageY;
});

$(document).on('mouseup', function (event) {
	if (Magnatune.Drag.element) {
		// TODO
		$(Magnatune.Drag.element).remove();
		Magnatune.Drag.element = null;
		Magnatune.Drag.type    = null;
		Magnatune.Drag.object  = null;
	}
});

$(document).ready(function () {
	var audio = $('#audio');
	var time = $('#current-time');
	var duration = $('#current-duration');
	var playprogress = $('#play-progress');
	var playprogress_container = $('#play-progress-container');
	var buffered = $('#buffer-progress')[0];
	playprogress_container.on('click', function (event) {
		var x = event.pageX - playprogress_container.offset().left;
		audio[0].currentTime = Magnatune.Player.duration() * x / playprogress_container.width();
	});
	audio.on('progress', function (event) {
		var duration = Magnatune.Player.duration();
		var ranges = audio[0].buffered;
		var ctx = buffered.getContext('2d');
		ctx.fillStyle = '#a0a0ff';
		ctx.clearRect(0,0,buffered.width,buffered.height);
		for (var i = 0; i < ranges.length; ++ i) {
			var start = ranges.start(i);
			var x     = Math.round(buffered.width * start / duration);
			var width = Math.round(buffered.width * (ranges.end(i) - start) / duration);
			ctx.fillRect(x,0,width,buffered.height);
		}
	});
	audio.on('seeked', function (event) {
		
	});
	audio.on('timeupdate', function (event) {
		var currentTime = audio[0].currentTime;
		var duration = Magnatune.Player.duration();
		time.text(tag.time(currentTime));
		playprogress.css('width',Math.round(playprogress_container.width()*currentTime/duration)+'px');
	});
	audio.on('volumechange', function (event) {
		
	});
	audio.on('stalled', function (event) {
		
	});
	audio.on('canplay', function (event) {
		
	});
	audio.on('playing', function (event) {
		
	});
	audio.on('loadedmetadata', function (event) {
		
	});
	audio.on('durationchange', function (event) {
		// TODO: remaining time
		duration.text(tag.time(audio[0].duration));
	});
	audio.on('waiting', function (event) {
		
	});
	audio.on('error', function (event) {
		
	});
	audio.on('ended', function (event) {
		console.log("ended");
		Magnatune.Player.next(true);
	});
	audio.on('emptied', function (event) {
		
	});
	$('#volume-bar-container, #play-progress-container').on('mousedown',function(event) {
		event.preventDefault();
	});
	// TODO
	Magnatune.Collection.on('ready', function () {
		Magnatune.Navigation.setMode('genre/artist/album');
		Magnatune.showHash();
	});
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
