#!/usr/bin/env python

import cgitb
cgitb.enable()

import sys, os, urllib

def write(s):
	sys.stdout.write(s)
	sys.stdout.flush()

write(
'Content-Type: text/html;charset=utf-8\r\n\r\n'
'<html><head><title>Updating Magnatune DB</title></head><body><pre>'
'Checking for updates...\n')

changed = urllib.urlopen('http://he3.magnatune.com/info/changed.txt').read().strip()

if os.path.exists('changed.txt'):
	fp = open('changed.txt','r')
	try:
		current = fp.read().strip()
	finally:
		fp.close()
else:
	current = None

if current == changed:
	write('Already up to date.\n')
else:
	write('Downloading: 0%')
	fin = urllib.urlopen('http://he3.magnatune.com/info/sqlite_magnatune.db.gz')
	size = int(fin.headers['content-length'],10)
	fout = open('sqlite_magnatune.db.gz','wb')
	progress = 0
	percent_progress = 0
	try:
		while True:
			chunk = fin.read(1024*8)
			if not chunk:
				break
			progress += len(chunk)
			fout.write(chunk)
			percent = (100 * progress // size)
			if percent >= percent_progress + 5:
				write(' %d%%' % percent)
				percent_progress = percent
	finally:
		fout.close()
		
	write('\nDecompressing: ')
	import gzip
	fin = gzip.GzipFile(filename='sqlite_magnatune.db.gz',mode='r')
	try:
		fout = open('sqlite_magnatune.db','wb')
		progress = 0
		try:
			while True:
				chunk = fin.read(1024*8)
				if not chunk:
					break
				progress += 1
				fout.write(chunk)
				if progress % 7 == 0:
					write('#')
		finally:
			fout.close()
	finally:
		fin.close()

	write('\n\nCreate Indices...\n')
	try:
		import sqlite3
	except:
		from pysqlite2 import dbapi2 as sqlite3
	conn = sqlite3.connect('sqlite_magnatune.db')
	cur = conn.cursor()

	def mkindex(table,columns):
		sql = "create index %s on %s (%s)" % (
			table+'_'+'_'.join(columns),
			table,
			', '.join(columns))
		write(sql+"\n")
		cur.execute(sql)

	try:
		for table, indices in [
				('albums',  [['artist'],['albumname'],['sku']]),
				('artists', [['artist']]),
				('genres',  [['albumname'],['genre']]),
				('songs',   [['albumname'],['number']])]:
			for index in indices:
				mkindex(table,index)
	finally:
		conn.close()

	fp = open('changed.txt','w')
	try:
		fp.write(changed+'\n')
	finally:
		fp.close()

	write('\nDone.\n')
write('</pre></body></html>\n')
