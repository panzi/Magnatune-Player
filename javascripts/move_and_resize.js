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

$(function () {
	// move:
	Magnatune.DnD.draggable($('#main'), {
		create: function (event) {
			if ($(event.target).parents().andSelf().is('.tab-content, #tree, .popup-menu, .button, a, button, input, textarea'))
				return null;
			var startX = event.screenX, startY = event.screenY,
			    winY = window.screenTop||window.screenY,
			    winX = window.screenLeft||window.screenX;
			return {drag: function (event) {
			    var dx = event.screenX - startX,
			        dy = event.screenY - startY;
			    window.moveTo(winX+dx,winY+dy);
			}};
		}
	});
	
	// resize:
	var top_resizer = tag('div',{
		'class': 'resizer horizontal',
		style: {
			top: '0px',
			left: '0px',
			right: '0px',
			cursor: 'N-resize'
		}
	});
	
	var left_resizer = tag('div',{
		'class': 'resizer vertical',
		style: {
			top: '0px',
			left: '0px',
			bottom: '0px',
			cursor: 'W-resize'
		}
	});
	
	var right_resizer = tag('div',{
		'class': 'resizer vertical',
		style: {
			top: '0px',
			right: '0px',
			bottom: '0px',
			cursor: 'E-resize'
		}
	});
	
	var bottom_resizer = tag('div',{
		'class': 'resizer horizontal',
		style: {
			left: '0px',
			right: '0px',
			bottom: '0px',
			cursor: 'S-resize'
		}
	});
	
	var top_left_resizer = tag('div',{
		'class': 'resizer corner',
		style: {
			top: '0px',
			left: '0px',
			cursor: 'NW-resize'
		}
	});
	
	var top_right_resizer = tag('div',{
		'class': 'resizer corner',
		style: {
			top: '0px',
			right: '0px',
			cursor: 'NE-resize'
		}
	});
	
	var bottom_left_resizer = tag('div',{
		'class': 'resizer corner',
		style: {
			bottom: '0px',
			left: '0px',
			cursor: 'SW-resize'
		}
	});
	
	var bottom_right_resizer = tag('div',{
		'class': 'resizer corner',
		style: {
			bottom: '0px',
			right: '0px',
			cursor: 'SE-resize'
		}
	});
	
	($('#main').
		append(top_resizer).
		append(bottom_resizer).
		append(left_resizer).
		append(right_resizer).
		append(top_left_resizer).
		append(top_right_resizer).
		append(bottom_left_resizer).
		append(bottom_right_resizer));
	
	Magnatune.DnD.draggable(top_resizer, {
		create: function (event) {
			var startY = event.screenY,
			    width = window.outerWidth,
			    height = window.outerHeight,
			    winY = window.screenTop||window.screenY,
			    winX = window.screenLeft||window.screenX;
			return {drag: function (event) {
			    var dy = event.screenY - startY;
			    window.moveTo(winX,winY+dy);
			    window.resizeTo(width,height-dy);
			}};
		}
	});
	
	Magnatune.DnD.draggable(bottom_resizer, {
		create: function (event) {
			var startY = event.screenY,
			    width = window.outerWidth,
			    height = window.outerHeight;
			return {drag: function (event) {
			    var dy = event.screenY - startY;
			    window.resizeTo(width,height+dy);
			}};
		}
	});
	
	Magnatune.DnD.draggable(left_resizer, {
		create: function (event) {
			var startX = event.screenX,
			    width = window.outerWidth,
			    height = window.outerHeight,
			    winY = window.screenTop||window.screenY,
			    winX = window.screenLeft||window.screenX;
			return {drag: function (event) {
			    var dx = event.screenX - startX;
			    window.moveTo(winX+dx,winY);
			    window.resizeTo(width-dx,height);
			}};
		}
	});
	
	Magnatune.DnD.draggable(right_resizer, {
		create: function (event) {
			var startX = event.screenX,
			    width = window.outerWidth,
			    height = window.outerHeight;
			return {drag: function (event) {
			    var dx = event.screenX - startX;
			    window.resizeTo(width+dx,height);
			}};
		}
	});
	
	Magnatune.DnD.draggable(top_left_resizer, {
		create: function (event) {
			var startX = event.screenX,
			    startY = event.screenY,
			    width = window.outerWidth,
			    height = window.outerHeight,
			    winY = window.screenTop||window.screenY,
			    winX = window.screenLeft||window.screenX;
			return {drag: function (event) {
			    var dx = event.screenX - startX,
			        dy = event.screenY - startY;
			    window.moveTo(winX+dx,winY+dy);
			    window.resizeTo(width-dx,height-dy);
			}};
		}
	});
	
	Magnatune.DnD.draggable(top_right_resizer, {
		create: function (event) {
			var startX = event.screenX,
			    startY = event.screenY,
			    width = window.outerWidth,
			    height = window.outerHeight,
			    winY = window.screenTop||window.screenY,
			    winX = window.screenLeft||window.screenX;
			return {drag: function (event) {
			    var dx = event.screenX - startX,
			        dy = event.screenY - startY;
			    window.moveTo(winX,winY+dy);
			    window.resizeTo(width+dx,height-dy);
			}};
		}
	});
	
	Magnatune.DnD.draggable(bottom_left_resizer, {
		create: function (event) {
			var startX = event.screenX,
			    startY = event.screenY,
			    width = window.outerWidth,
			    height = window.outerHeight,
			    winY = window.screenTop||window.screenY,
			    winX = window.screenLeft||window.screenX;
			return {drag: function (event) {
			    var dx = event.screenX - startX,
			        dy = event.screenY - startY;
			    window.moveTo(winX+dx,winY);
			    window.resizeTo(width-dx,height+dy);
			}};
		}
	});
	
	Magnatune.DnD.draggable(bottom_right_resizer, {
		create: function (event) {
			var startX = event.screenX,
			    startY = event.screenY,
			    width = window.outerWidth,
			    height = window.outerHeight;
			return {drag: function (event) {
			    var dx = event.screenX - startX,
			        dy = event.screenY - startY;
			    window.resizeTo(width+dx,height+dy);
			}};
		}
	});
});
