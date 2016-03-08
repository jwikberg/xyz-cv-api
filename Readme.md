XYZ CV API
==========

## What?

This is a REST API server built using ExpressJS.
It is built for the XYZ build system and communicates with the [laughing batman](https://github.com/Softhouse/laughing-batman) DREAMS API.

## Getting started

1. Connect your app to XYZ build system; follow the instructions [here](https://github.com/guzmo/xyz-docker-docs).

### TODO

You'll now have a dynamic REST API listening on port `3232` (or the port provided via the `PORT` environment variable).

## Development

1. Install [NodeJS](http://nodejs.org/download/).
2. Install and run a local copy of the DREAMS api from [here](https://github.com/guzmo/xyz-docker-docs).
3. Open your terminal and do the following:

```bash
git clone <this repo>

cd <repo folder>

npm install

node app/server.js

```
## API

**NOTE** Every request to the api needs to contain two headers, containing `x-forwarded-user` and `x-forwarded-email`. The is used by the server to create users upon connecting.

TODO

## License

TODO

PROMISES
ETC  
