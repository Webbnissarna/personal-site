# Personal Site
Generalized setup for running my personal site. /MK

Tested with:
- docker 19.03.8
- docker-compose 1.26.0-rc4
- npm 6.13.7
- node 13.11.0

Recommended to use [nvm](https://github.com/nvm-sh/nvm) or similar for npm actions.

## Instructions
__Note: Requires docker-compose 1.25.5+ (for version 3.8+ file support)__

### Production
To run in production, a few extra files not included in the repo are needed (all placed in the root):

- DO_AUTH_TOKEN
  - This is a file containing an auth token created in the [Digital Ocean API dashboard](https://cloud.digitalocean.com/account/api/tokens). This is used by Traefik to
  automatically manage the TXT DNS records needed for Let's Encrypt to function.
- acme.json
  - this is a file that needs to be created for Traefik to store ACME data used for TLS. It should be empty, chmod 600, and chown/chgrp to root.
- .env
  - A few sensitive environment variables are needed for the production [docker-compose.yml](docker-compose.yml) and needs to be set in an .env file:
    | VARIABLE            | VALUE                                                                                                                                                                                                                                                                                                                |
    | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | MK_LE_EMAIL         | Email address used to register with Let's Encrypt.                                                                                                                                                                                                                                                                   |
    | MK_MAIN_DOMAIN      | Domain (e.g. example.com) to be used.                                                                                                                                                                                                                                                                                |
    | MK_MONGO_USER       | Default MongoDB username.                                                                                                                                                                                                                                                                                            |
    | MK_MONGO_PASS       | Default MongoDB password.                                                                                                                                                                                                                                                                                            |
    | MK_BASICAUTH_STRING | Auth string as used for [Traefik Basic Auth](https://docs.traefik.io/middlewares/basicauth/) used to access Traefik dashboard and mongo-express. Note that the string used in the .env file should not be escaped, so the correct command to generate it is `echo $(htpasswd -nbB <USER> "<PASS>")` (without `sed`). |

From root then run `sudo docker-compose up` and the site should be live (make sure to build `react-sites` as well (see [below](#react-sites)) otherwise no actual content is available).

### Dev
From root run `docker-compose -f ./docker-compose-dev.yml up`.

Either change occurrences of `masterkenth-test.com` in `docker-compose-dev.yml` to the desired domain or change the local 
host mapping to redirect your chosen domain to `localhost`.

Additionally, dev setup requires a `tls-dev.crt` and a `tls-dev.key` to exist in the root directory, as the development setup does not use Let's Encrypt. 
Manually create a self-signed certificate and place appropriately.

## Features
- Traefik as reverse proxy and gateway handling TLS (via Let's Encrypt for production)
- MongoDB as main backing database
- Node/Express web server with arbitrary subdomain handling for easy subdomain setup< g>
- Everything running as a Docker composition

## Site Setup
Sites reside under `webserver/sites`. Each folder containing a `siteHandler.js` file represents a (sub)domain.

### siteHandler.js
Each `siteHandler.js` is processed as part of the startup sequence and should export certain properties in order to be considered valid:

| Property              | Required | Description                                                                                                     |
| --------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| exports.subdomainName | ✔️        | (`string`) The subdomain name this site represents. `null` represents the default site and the `www` subdomain. |
| exports.router        | ✔️        | (`Express.Router`) Router for this site.                                                                        |
| exports.api           |          | (`Object`) If specified, describes the API for this site.                                                       |

#### exports.api
All properties of the `exports.api` object are required.
| Property             | Description                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| dbName               | (`string`) Name of the MongoDB database for this site (usually similar to/same as subdomain name). |
| getGQLSchemaContents | (`string`) [GraphQL schema](https://graphql.org/learn/schema/).                                    |
| getDBQueryRoot       | (`Object`) rootValue as passed to [express-graphql](https://github.com/graphql/express-graphql).   |

### API
The `api` subdomain is a special site that acts as a REST-like GraphQL backend, with the url format `api.[domain].[tld]/[db]/graphql?query=[query]` (e.g. [api.masterkenth.com/test/graphql?query={people{name}](https://api.masterkenth.com/test/graphql?query={people{name}})).

Each site defines their own API feature set which gets registered on startup.

## React sites
Sites built using React should reside under `react-sites` as this allows for some added automation; from the `scripts` directory, running `gulp buildAndDeploySites` 
automatically runs `npm run build` for each site under `react-sites` (make sure to have already run `npm install` in each site directory) and appropriately copies 
the results into `webserver/sites/*/static`. From there on, any new site added just needs a simple `siteHandler.js` setup to serve static content 
(see [webserver/sites/test/siteHandler.js](webserver/sites/test/siteHandler.js) for an example).

### Using API
For an example of how to query GraphQL from React, see `react-sites/test/App.js` for an example using [Apollo Client](https://www.apollographql.com/docs/tutorial/client/).

## Debugging notes
- The Traefik dashboard shows live entrypoints, routers, services etc. If you expect a service to be there but isn't, it's probably dead (check docker logs).
- If Traefik is unable to find a path for a given route, it will respond with "404 page not found".
- However, if Express is unable to find a path for a given route, it will respond with "Cannot GET /some/invalid/path".
  - Use this to figure out where in the chain a given route/path/url fails.
- Some changes to `docker-compose.yml` are not correctly reflected unless you perform a `docker-compose down` before `docker-compose up` ([cleanAndRunDocker.sh](scripts/cleanAndRunDocker.sh) should force a clean `up` and is useful for experimenting with config changes).