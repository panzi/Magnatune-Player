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

if ($.browser.msie) {
	$(document).on('selectstart dragstart', function (event) {
		if (Magnatune.DnD.handler) {
			event.preventDefault();
		}
	});
	
	$(document).ready(function () {
		// data url foo is not working in IE
		$('#export-button').hide();
	});
}

// overload standard functions with IE stuff
if ($.browser.msie && parseInt($.browser.version.split(/\./g)[0],10) < 9) {
	// use ActiveX nonsense when HTML5 audio is not supported
	$.extend(Magnatune.Player, {
		_ie_time_update_interval: null,
		_ie_start_playing: function () {
			this.hideSpinner();
			this._playing();

			// there seems to be no time update event so we have to poll:
			if (this._ie_time_update_interval === null) {
				var update = function () {
					this._time_update(this.currentTime());
				}.bind(this);
				update();
				this._ie_time_update_interval = setInterval(update, 250);
			}
		},
		_ie_stop_playing: function () {
			this._time_update(this.currentTime());
			if (this._ie_time_update_interval !== null) {
				clearInterval(this._ie_time_update_interval);
				this._ie_time_update_interval = null;
			}
		},
		Handlers: {
			PlayStateChange: function (state) {
				switch (state) {
					case 1: // stopped
					case 2: // paused
						Magnatune.Player._not_playing();
						Magnatune.Player._ie_stop_playing();
						break;

					case 3: // playing
						Magnatune.Player._ie_start_playing();
						break;

					case 6: // buffering
					case 7: // waiting
						Magnatune.Player.showSpinner();
						break;

					case 8: // ended
						Magnatune.Player._ended();
						Magnatune.Player._ie_stop_playing();
						break;

					case 10: // ready
						Magnatune.Player.hideSpinner();
						break;
				}
			},
			PositionChange: function (oldPosition, newPosition) {
				Magnatune.Player._time_update(newPosition);
			},
			Buffering: function (buffering) {
				if (buffering) {
					Magnatune.Player.showSpinner();
				}
				else {
					Magnatune.Player.hideSpinner();
				}
			},
			Error: function () {
				var buf = [];
				for (var i = 0; i < Magnatune.Player.audio.error.errorCount; ++ i) {
					buf.push(Magnatune.Player.audio.error.item(i).errorDescription);
				}
				console.log('error: '+buf.join(", "));
				Magnatune.Player.hideSpinner();
				Magnatune.Player.stop();
			}
		},
		initAudio: function () {
			var audio = tag('object',{
				width:'0',height:'0',
				classid:'CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6'});
			$(document).append(audio);
			audio.uiMode = 'invisible';
			audio.settings.autoStart = false;
			audio.settings.volume = 100;
			for (var handler in this.Handlers) {
				audio.attachEvent(handler.toLowerCase(), this.Handlers[handler]);
			}
			this.audio = audio;
		},
		duration: function () {
			return this._song ? this._song.duration : NaN;
		},
		currentTime: function () {
			return this.audio.controls.currentPosition;
		},
		playing: function () {
			return this.audio.playState === 3;
		},
		paused: function () {
			return this.audio.playState === 2;
		},
		ended: function () {
			return this.audio.playState === 1;
		},
		play: function (norewind) {
			this._update(norewind);
			if (this._song) {
				this.audio.controls.play();
			}
		},
		_prepare_audio: function () {
			if (!this.ended()) {
				this.audio.controls.stop();
			}
		},
		_set_sources: function (sources) {
			for (var i = 0; i < sources.length; ++ i) {
				var source = sources[i];
				if (/^audio\/mpeg\b/i.test(source.type)) {
					this.audio.URL = source.src;
				}
			}
		},
		seek: function (time) {
			try {
				this.audio.controls.currentPosition = time;
			}
			catch (e) {}
		},
		pause: function () {
			this.audio.controls.pause();
		},
		playPause: function () {
			if (this.playing()) {
				this.audio.controls.pause();
			}
			else if (!this._song) {
				this.play();
			}
			else {
				this.audio.controls.play();
			}
		},
		stop: function () {
			this.audio.controls.stop();
		},
		mute: function () {
			this.audio.settings.mute = true;
		},
		unmute: function () {
			this.audio.settings.mute = false;
		},
		muted: function () {
			return this.audio.settings.mute;
		},
		setVolume: function (volume) {
			this.audio.settings.volume = Math.round(volume * 100);
			this._volume_change();
		},
		volume: function () {
			return this.audio.settings.volume / 100;
		}
	});
}
