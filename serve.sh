#!/bin/sh

[ -n "$1" ] && MP_PORT=$1
[ -z "$MP_PORT" ] && MP_PORT=8000

cd `dirname "$0"` &&
./cgi-bin/update.cgi &&
exec python -m CGIHTTPServer "$MP_PORT"
