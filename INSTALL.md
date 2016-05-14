# Installing the Magnatune Player

A few simple steps (tested in Mac OS X and Linux):

- clone the repository from Github
- run shell script `serve.sh`
    - port `8000` is used by default
    - if you get an error because the port is busy, you can optionally
      pass a port number on the command line, e.g:
      
          serve.sh 8008

- wait for the server to start, you will get a notification message like
  this:

      Serving HTTP on 0.0.0.0 port 8000 ...

- open the browser at <http://localhost:8000/> (or whatever other
  address/port your server started at)
- enjoy!
