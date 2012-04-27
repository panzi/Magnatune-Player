#!/usr/bin/env python

import cgitb
cgitb.enable()

import re
import sys
import os
import cgi
from itertools import repeat
from datetime import datetime, timedelta
from time import mktime

try:
	import sqlite3
except ImportError:
	from pysqlite2 import dbapi2 as sqlite3

try:
	from email.Utils import parsedate_tz, formatdate, mktime_tz
except ImportError:
	from email.utils import parsedate_tz, formatdate, mktime_tz

try:
	import json
except ImportError:
	import simplejson as json

class HTTPError(Exception):
	__slots__ = 'status',
	def __init__(self,status):
		self.status = status

# action=index
# action=search query=... mode=...

# action=albums [genre=...] [artist=...]
# action=artists [genre=...]
# action=genres
# action=songs (album=... | artist=...)

# action=album name=...
# action=artist name=...
# action=song album=... number=...

# [action=embed] url=... [maxwidth=...] [maxheight=...]

actions = {}
def action(func):
	actions[func.func_name] = func
	return func

def rows_to_dicts(cur,rows):
	return [row_to_dict(cur,row) for row in rows]

def row_to_dict(cur,row):
	return dict((column[0], row[i]) for i, column in enumerate(cur.description))

def getp(params,name,default=None):
	val = params.getvalue(name,default)
	if val is not None:
		val = unicode(val,'utf-8')
	return val

@action
def index(cur,params):
	rv = {}
	cur.execute('select albumname, artist, launchdate from albums order by albumname, artist')
	rv['albums'] = rows_to_dicts(cur,cur.fetchall())
	cur.execute('select artist from artists order by artist')
	rv['artists'] = [row[0] for row in cur.fetchall()]
	cur.execute('select distinct genre from genres order by genre')
	rv['genres'] = genres = []
	for genre_row in cur.fetchall():
		cur.execute(
			'select albumname from genres where genre = ? order by albumname', 
			genre_row)
		genres.append({
			'genre': genre_row[0],
			'albums': [album_row[0] for album_row in cur.fetchall()]
		})
	return rv

finders = {}
def finder(func):
	finders[func.func_name[7:].replace('_','/')] = func
	return func

def nargs(n):
	return ','.join(repeat('?', n))

def concat(*seqs):
	rv = []
	for seq in seqs:
		rv.extend(seq)
	return rv

def songs_by_album(songs):
	songs_by_album = {}
	for song in songs:
		albumname = song['albumname']
		if albumname in songs_by_album:
			album = songs_by_album[albumname]
		else:
			album = songs_by_album[albumname] = []
		del song['albumname']
		album.append(song)
	return songs_by_album

@finder
def search_album(cur,query,order):
	where, args = build_query(['albums.albumname'],query)
	if order == "name":
		album_order = "albumname"
	else:
		album_order = "launchdate desc, albumname"
	cur.execute(
		'select distinct albumname from albums '
		'where %s order by %s' % (where, album_order), args)
	albums = [row[0] for row in cur.fetchall()]
	where, args = build_query(['songs.desc'],query)
	if order == "name":
		cur.execute(
			'select number, desc, duration, mp3, albumname from songs '
			'where albumname not in (%s) and %s '
			'order by albumname, number' % (
				nargs(len(albums)), where),
			albums+args)
	else:
		cur.execute(
			'select number, desc, duration, mp3, songs.albumname from songs '
			'inner join albums on albums.albumname = songs.albumname '
			'where songs.albumname not in (%s) and %s '
			'order by launchdate desc, songs.albumname, number' % (
				nargs(len(albums)), where),
			albums+args)
	songs = rows_to_dicts(cur,cur.fetchall())
	return {
		'albums': albums,
		'songs': songs_by_album(songs)
	}

@finder
def search_artist_album(cur,query,order):
	where, args = build_query(['artist'],query)
	if order == "name":
		cur.execute(
			'select distinct artist from albums '
			'where %s order by artist' % where,
			args)
	else:
		cur.execute(
			'select artist, max(launchdate) as latestdate from albums '
			'where %s '
			'group by artist '
			'order by latestdate desc, artist' % where,
			args)
	artists = [row[0] for row in cur.fetchall()]
	where, args = build_query(['albumname'],query)
	if order == "name":
		cur.execute(
			'select distinct albumname from albums '
			'where artist not in (%s) and %s '
			'order by albumname' % (
				nargs(len(artists)), where),
			concat(artists,args))
	else:
		cur.execute(
			'select distinct albumname, launchdate from albums '
			'where artist not in (%s) and %s '
			'order by launchdate desc, albumname' % (
				nargs(len(artists)), where),
			concat(artists,args))
	albums = [row[0] for row in cur.fetchall()]
	where, args = build_query(['songs.desc'],query)
	if order == "name":
		songs_order = 'songs.albumname, number'
	else:
		songs_order = 'launchdate desc, songs.albumname, number'
	cur.execute(
		'select number, desc, duration, mp3, songs.albumname from songs '
		'inner join albums on songs.albumname = albums.albumname '
		'where songs.albumname not in (%s) and '
		'albums.artist not in (%s) and %s '
		'order by %s' % (
			nargs(len(albums)), nargs(len(artists)), where, songs_order),
		concat(albums,artists,args))
	songs = rows_to_dicts(cur,cur.fetchall())
	return {
		'artists': artists,
		'albums':  albums,
		'songs':   songs_by_album(songs)
	}

@finder
def search_basic_artist_album(cur,query,order):
	where, args = build_query(['artists.artist'],query)
	if order == "name":
		artist_order = 'artists.artist'
	else:
		artist_order = 'latestdate desc, artists.artist'

	cur.execute(
		'select artists.artist as artist, homepage, max(launchdate) as latestdate from albums '
		'inner join artists on artists.artist = albums.artist '
		'where %s '
		'group by artists.artist, homepage '
		'order by %s' % (where, artist_order),
		args)
	artists = rows_to_dicts(cur,cur.fetchall())

	if order == "name":
		album_order = 'albums.albumname'
	else:
		album_order = 'launchdate desc, albums.albumname'

	artist_names = []
	artists_by_name = {}
	for artist in artists:
		artist['albums'] = []
		artistname = artist['artist']
		artist_names.append(artistname)
		artists_by_name[artistname] = artist

	cur.execute(
		'select artist, albumname, sku, launchdate '
		'from albums '
		'where artist in (%s) '
		'order by %s' % (nargs(len(artist_names)), album_order),
		artist_names)
	artist_albums = rows_to_dicts(cur,cur.fetchall())

	for album in artist_albums:
		artists_by_name[album['artist']]['albums'].append(album)
		del album['artist']
	
	where, args = build_query(['albums.albumname','songs.desc'],query)

	cur.execute(
		'select distinct albums.albumname, sku, launchdate, artists.artist as artist, homepage '
		'from albums inner join songs on albums.albumname = songs.albumname '
		'inner join artists on artists.artist = albums.artist '
		'where '
		'albums.artist not in (%s) and %s '
		'order by %s' % (nargs(len(artist_names)), where, album_order),
		artist_names+args)

	albums = rows_to_dicts(cur,cur.fetchall())

	return {
		"artists": artists,
		"albums": albums
	}

@finder
def search_genre_album(cur,query,order):
	where, args = build_query(['genre'],query)
	cur.execute('select distinct genre from genres where %s order by genre' % where,args)
	genres = [row[0] for row in cur.fetchall()]
	where, args = build_query(['albums.albumname'],query)
	if order == "name":
		albums_order = "albums.albumname"
	else:
		albums_order = "launchdate desc, albums.albumname"
	cur.execute(
		'select distinct albums.albumname from albums '
		'inner join genres on genres.albumname = albums.albumname '
		'where genre not in (%s) and %s '
		'order by %s' % (nargs(len(genres)), where, albums_order),
		concat(genres,args))
	albums = [row[0] for row in cur.fetchall()]
	where, args = build_query(['songs.desc'],query)
	if order == "name":
		songs_order = 'genre, songs.albumname, number'
	else:
		songs_order = 'launchdate desc, genre, songs.albumname, number'
	cur.execute(
		'select distinct number, desc, duration, mp3, songs.albumname from songs '
		'inner join albums on songs.albumname = albums.albumname '
		'inner join genres on albums.albumname = genres.albumname '
		'where songs.albumname not in (%s) and '
		'genre not in (%s) and %s '
		'order by %s' % (
			nargs(len(albums)), nargs(len(genres)), where, songs_order),
		concat(albums,genres,args))
	songs = rows_to_dicts(cur,cur.fetchall())
	return {
		'genres': genres,
		'albums': albums,
		'songs': songs_by_album(songs)
	}

@finder
def search_genre_artist_album(cur,query,order):
	where, args = build_query(['genre'],query)
	cur.execute('select distinct genre from genres where %s order by genre' % where,args)
	genres = [row[0] for row in cur.fetchall()]
	where, args = build_query(['artist'],query)
	if order == "name":
		cur.execute(
			'select distinct artist from albums '
			'inner join genres on genres.albumname = albums.albumname '
			'where genre not in (%s) and %s '
			'order by artist' % (
				nargs(len(genres)), where),
			concat(genres,args))
	else:
		cur.execute(
			'select artist, max(launchdate) as latestdate from albums '
			'inner join genres on genres.albumname = albums.albumname '
			'where genre not in (%s) and %s '
			'group by artist '
			'order by latestdate desc, artist' % (
				nargs(len(genres)), where),
			concat(genres,args))
	artists = [row[0] for row in cur.fetchall()]
	where, args = build_query(['albums.albumname'],query)
	if order == "name":
		albums_order = "albums.albumname"
	else:
		albums_order = "launchdate desc, albums.albumname"
	cur.execute(
		'select distinct albums.albumname from albums '
		'inner join genres on genres.albumname = albums.albumname '
		'where genre not in (%s) and '
		'albums.artist not in (%s) and %s '
		'order by %s' % (
			nargs(len(genres)), nargs(len(artists)), where, albums_order),
		concat(genres,artists,args))
	albums = [row[0] for row in cur.fetchall()]
	where, args = build_query(['songs.desc'],query)
	if order == "name":
		songs_order = 'genre, songs.albumname, number'
	else:
		songs_order = 'launchdate desc, genre, songs.albumname, number'
	cur.execute(
		'select distinct number, desc, duration, mp3, songs.albumname from songs '
		'inner join albums on songs.albumname = albums.albumname '
		'inner join genres on albums.albumname = genres.albumname '
		'where songs.albumname not in (%s) and '
		'genre not in (%s) and '
		'albums.artist not in (%s) and %s '
		'order by %s' % (
			nargs(len(albums)), nargs(len(genres)), nargs(len(artists)), where, songs_order),
		concat(albums,genres,artists,args))
	songs = rows_to_dicts(cur,cur.fetchall())
	return {
		'genres':  genres,
		'artists': artists,
		'albums':  albums,
		'songs':   songs_by_album(songs)
	}

LIKE_CHARS = re.compile('([%_\\\\])')
def like_escape(text):
	return LIKE_CHARS.sub("\\\\\\1",text)

def build_query(columns,words):
	where = '(%s)' % ' or '.join(
		'(%s)' % ' and '.join(repeat(column+" like ? escape '\\'", len(words)))
		for column in columns)

	words = ['%%%s%%' % like_escape(word) for word in words]
	args = concat(*repeat(words, len(columns)))

	return where, args

@action
def search(cur,params):
	query = getp(params,'query')
	mode  = getp(params,'mode')
	order = getp(params,'order')
	if not order:
		order = 'name'
	else:
		order = order.strip().lower()
		if order not in ('date', 'name'):
			raise ValueError('Unknown order: %r' % getp(params,'order'))
	try:
		find = finders[mode.strip().lower().replace('-','/')]
	except KeyError:
		raise ValueError('Unknown search mode: %r' % mode)
	query = [word for word in set(query.split()) if len(word) > 1]
	if not query:
		return None
	return find(cur,query,order)

@action
def albums(cur,params):
	sql = ['select albums.albumname, albums.artist, albums.sku from albums']
	where = []
	args = []

	if 'genre' in params:
		genre = getp(params,'genre')
		sql.append(' inner join genres on genres.albumname = albums.albumname ')
		where.append('genres.genre = ?')
		args.append(genre)

	if 'artist' in params:
		artist = getp(params,'artist')
		where.append('albums.artist = ?')
		args.append(artist)

	if where:
		sql.append(' where ')
		sql.append(' and '.join(where))

	sql.append(' order by albums.albumname, albums.artist')
	cur.execute(''.join(sql),args)
	return rows_to_dicts(cur,cur.fetchall())

@action
def artists(cur,params):
	sql = ['select artists.artist, artists.homepage from artists']
	where = []
	args = []

	if 'genre' in params:
		genre = getp(params,'genre')
		sql.append(
			' inner join albums on artists.artist = albums.artist '
			' inner join genre on genres.albumname = albums.albumname ')
		where.append('genres.genre = ?')
		args.append(genre)

	sql.append(' order by artists.artist')
	cur.execute(''.join(sql),args)
	return rows_to_dicts(cur,cur.fetchall())

@action
def genres(cur,params):
	cur.execute('select distinct genre from genres order by genre')
	return [row[0] for row in cur.fetchall()]

@action
def songs(cur,params):
	if 'album' in params:
		where = 'albums.albumname = ?'
		args = [getp(params,'album')]
	else:
		where = 'albums.artist = ?'
		args = [getp(params,'artist')]

	cur.execute(
		'select songs.number, songs.desc, songs.duration, songs.albumname, songs.mp3, '
		'albums.artist from songs inner join albums on songs.albumname = albums.albumname '
		'where '+where, args)

	return rows_to_dicts(cur,cur.fetchall())

@action
def album(cur,params):
	args = [getp(params,'name')]
	cur.execute(
		'select albumname, artist, also, description, sku, '
		'launchdate, itunes from albums where albumname = ?',
		args)
	album = cur.fetchone()
	if not album:
		return None
	album = row_to_dict(cur,album)
	also = album['also']
	if also:
		also = also.split()
		cur.execute('select albumname from albums where sku in (%s)' % (nargs(len(also))), also)
		album['also'] = [row[0] for row in cur.fetchall()]
	else:
		# just in case it might be '' or None
		album['also'] = []
	cur.execute(
		'select number, desc, duration, mp3 from songs where albumname = ? order by number',
		args)
	album['songs'] = rows_to_dicts(cur,cur.fetchall())
#	cur.execute(
#		'select distinct genre from genres where albumname = ? order by genre',
#		args)
#	album['genres'] = [row[0] for row in cur.fetchall()]
	return album

@action
def artist(cur,params):
	args = [getp(params,'name')]
	cur.execute(
		'select artist, description, homepage, city, state, '
		'country, bio, bandphoto from artists where artist = ?',
		args)
	artist = cur.fetchone()
	if not artist:
		return None
	artist = row_to_dict(cur,artist)
#	cur.execute('select albumname from albums where artist = ? order by albumname', args)
#	artist['albums'] = rows_to_dicts(cur,cur.fetchall())
	return artist

@action
def song(cur,params):
	args = [getp(params,'album'), int(params.getvalue('number'),10)]
	cur.execute(
		'select songs.number, songs.desc, songs.duration, songs.albumname, songs.mp3, '
		'albums.artist from songs inner join albums on songs.albumname = albums.albumname '
		'where songs.albumname = ? and songs.number = ?', args)
	song = cur.fetchone()
	if not song:
		return None
	return row_to_dict(cur,song)

@action
def embed(cur,params):
	import urllib

	if 'maxwidth' in params:
		width = int(params.getvalue('maxwidth'),10)
	else:
		width = 400

	if 'maxheigth' in params:
		height = int(params.getvalue('maxheigth'),10)
	else:
		height = 300

	if 'url' in params:
		m = re.match('^https?://magnatune\.com/artists/albums/([^/]+)', getp(params,'url'))

		if not m:
			raise HTTPError(404)
	
		sku = m.group(1)
		cur.execute('select albumname, artists.artist, artists.homepage from albums inner join artists on albums.artist = artists.artist where sku = ?', [sku])
		row = cur.fetchone()
		if not row:
			raise HTTPError(404)
		album    = row[0]
		artist   = row[1]
		homepage = row[2]
	elif 'album' in params: # oembed extension
		album = getp(params,'album')
		cur.execute('select artists.artist, artists.homepage, sku from albums inner join artists on albums.artist = artists.artist where albumname = ?', [album])
		row = cur.fetchone()
		if not row:
			raise HTTPError(404)
		artist   = row[0]
		homepage = row[1]
		sku      = row[2]
	else:
		raise KeyError('missing url or album parameter')
	
	TRUE_VALUES = set(['true','t','yes','on','1'])
	FALSE_VALUES = set(['false','f','no','off','0'])
	def parse_bool(s):
		v = s.strip().lower()
		if v in TRUE_VALUES:
			return True
		elif v in FALSE_VALUES:
			return False
		else:
			raise ValueError('Cannot parse boolean value: %r' % s)

	large=True
	autoplay=False

	if 'large' in params: # oembed extension
		large = parse_bool(params.getvalue('large'))

	if 'autoplay' in params: # oembed extension
		autoplay = parse_bool(params.getvalue('autoplay'))

	if large:
		if width  <  150: width  =  150
		if width  >  600: width  =  600
		if height <  140: height =  140
		if height > 1000: height = 1000

		if width > 207:
			logo = "<a href=\"http://magnatune.com\"><img src=\"http://he3.magnatune.com/images/magnatune.gif\" border=\"0\"/></a><br/>"
		else:
			logo = ""

		player = "http://embed.magnatune.com/img/magnatune_player_embedded.swf"
	else:
		if width  < 100: width  = 100
		if width  > 600: width  = 600
		if height <  15: height =  15
		if height >  15: height =  15

		logo = ""
		player = "http://embed.magnatune.com/img/magnatune_player_embedded_single.swf"

	if autoplay:
		autoplay = 'true'
	else:
		autoplay = ''

	embedtempl = """\
%(LOGO)s
<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" width="%(WIDTH)d" height="%(HEIGHT)d">
	<param name="allowScriptAccess" value="sameDomain"/>
	<param name="movie" value="%(PLAYER)s?playlist_url=http://embed.magnatune.com/artists/albums/%(ALBUM_SKU)s/hifi.xspf&autoload=true&autoplay=%(AUTOPLAY)s&playlist_title=%(PLAYLIST_TITLE)s"/>
	<param name="quality" value="high"/>
	<param name="bgcolor" value="#E6E6E6"/>
	<embed src="%(PLAYER)s?playlist_url=http://embed.magnatune.com/artists/albums/%(ALBUM_SKU)s/hifi.xspf&autoload=true&autoplay=%(AUTOPLAY)s&playlist_title=%(PLAYLIST_TITLE)s" quality="high" bgcolor="#E6E6E6" name="xspf_player" allowscriptaccess="sameDomain" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" align="center" height="%(HEIGHT)d" width="%(WIDTH)d"></embed>
</object><br/>
<span style="font-face: Verdana, Arial, Utopia, Sans-serif; font-size: 1em;">
	<a href="http://magnatune.com/artists/albums/%(ALBUM_SKU)s"><b>%(ALBUM_NAME)s</b></a> by <a href="http://magnatune.com/artists/%(ARTIST_HOMEPAGE)s"><b>%(ARTIST_NAME)s</b></a>
</span>
"""
	html = embedtempl % {
		'WIDTH': width,
		'HEIGHT': height,
		'AUTOPLAY': autoplay,
		'PLAYER': player,
		'LOGO': logo,
		'ALBUM_SKU': sku,
		'ALBUM_NAME': cgi.escape(album).encode('ascii','xmlcharrefreplace'),
		'ARTIST_NAME': cgi.escape(artist).encode('ascii','xmlcharrefreplace'),
		'ARTIST_HOMEPAGE': homepage,
		'PLAYLIST_TITLE': urllib.quote(album+' - '+artist)
	}

	return {
		"version": "1.0",
		"type": "rich",
		"title": album,
		"author_name": artist,
		"author_url": "http://magnatune.com/artists/"+homepage,
		"provider_name": "Magnatune",
		"provider_url": "http://magnatune.com/",
		"thumbnail_url": "http://he3.magnatune.com/music/%s/%s/cover_600.jpg" % (urllib.quote(artist), urllib.quote(album)),
		"thumbnail_width": 600,
		"thumbnail_height": 600,
		"html": html,
		"width": width,
		"height": height,

		# oembed extension:
		"url": 'http://magnatune.com/artists/albums/%s/' % sku
	}

def with_conn(f,params):
	conn = sqlite3.connect('sqlite_magnatune.db')
	try:
		return f(conn.cursor(),params)
	finally:
		conn.close()

def fmtdate(dt):
	stamp = mktime(dt.timetuple())
	return formatdate(
		timeval   = stamp,
		localtime = False,
		usegmt    = True)

def query(params):
	if 'format' in params:
		fmt = getp(params,'format').strip().lower()
	else:
		fmt = 'json'
	
	if fmt not in ('json', 'jsonp'):
		raise HTTPError(501)

	if 'callback' in params:
		fmt = 'jsonp'
	
	headers = {
		'Expires': fmtdate(datetime.now()+timedelta(days=1))
	}

	fp = open('changed.txt','r')
	try:
		changed = fp.read().strip().split(None,1)
	finally:
		fp.close()

	if len(changed) > 1:
		headers['Last-Modified'] = last_modified = changed[1]
		last_modified = mktime_tz(parsedate_tz(last_modified))
	else:
		last_modified = None
		
	changed = changed[0]

	last_visit = os.getenv('HTTP_IF_MODIFIED_SINCE')
	if last_visit is not None and last_modified is not None:
		last_visit = mktime_tz(parsedate_tz(last_visit))
		if last_visit >= last_modified:
			headers['Status'] = '304'
			return headers, ''

	action_name = getp(params,'action')
	if action_name is None and 'url' in params or action_name == 'embed':
		mimetype = 'application/json+oembed;charset=utf-8'
		body = with_conn(embed,params)
	elif action_name not in actions:
		raise ValueError('Unknown action: %r' % action_name)
	else:
		mimetype = 'application/json;charset=utf-8'
		body = with_conn(actions[action_name],params)

		head = {
			'version': '1.0',
			'changed': changed
		}
		changed_param = getp(params,'changed')
		if changed_param and changed_param != changed:
			head['index'] = with_conn(index,params)
		body = {
			'head': head,
			'body': body
		}

	body = json.dumps(body)

	if fmt == 'jsonp':
		mimetype = 'text/javascript;charset=utf-8'
		body = '%s(%s)' % (getp(params,'callback','callback'), body)
	
	headers['Content-Type'] = mimetype

	return headers, body

params = cgi.FieldStorage()
try:
	headers, body = query(params)
except HTTPError, e:
	# seems like I can't set the http status using cgi :(
	headers = {
		'Content-Type':'text/html',
		'Status':str(e.status)
	}
	body = '<html><head><title>Error %d</title></head><body><h1>Error %d</h1></body></html>' % (
		e.status, e.status)

sys.stdout.write("%s\r\n%s" % (
	''.join(["%s: %s\r\n" % (header_name, headers[header_name]) for header_name in headers]),
	body))
