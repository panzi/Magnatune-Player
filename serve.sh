#!/bin/sh
cd `dirname "$0"`
exec python -m CGIHTTPServer
