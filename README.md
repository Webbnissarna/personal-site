# Personal Site
Generalized setup for running my personal site. /MK

## Instructions
(production setup is still wip)

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
The `api` subdomain is a special site that acts as a REST-like GraphQL backend, with the url format `api.[domain].[tld]/[subdomain]/graphql?query=[query]`.

Each site defines their own API feature set which gets registered on startup.

## React sites
Sites built using React should reside under `react-sites` as this allows for some added automation; from the `scripts` directory, running `gulp buildAndDeploySites` 
automatically runs `npm run build` for each site under `react-sites` and appropriately copies the results into `webserver/sites/*/static`. From there on, 
any new site added just needs a simple `siteHandler.js` setup to serve static content (see `webserver/test/siteHandler.js` for an example).

### Using API
For an example of how to query GraphQL from React, see `react-sites/test/App.js` for an example using [Apollo Client](https://www.apollographql.com/docs/tutorial/client/).
