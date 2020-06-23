const express = require('express');
const subdomain = require('express-subdomain');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const db = require('./db');

// Holds the map of subdomains with valid site handlers
let subdomainHandlers = [];


function runInitialDBConnections () {
  // Register api endpoints
  const apiHandler = subdomainHandlers['api'];
  if(apiHandler !== undefined) {
    console.log('Running initial DB connections');
    let promises = [];
    for(let [, handler] of Object.entries(subdomainHandlers)) {
      if(Object.prototype.hasOwnProperty.call(handler, 'api')) {
        promises.push(handler.api.getGQLSchemaContents().then((gqlSchemaContents) => {
          return handler.api.getDBQueryRoot(db).then((dbQueryRoot) => {
            apiHandler.registerGraphQLHandler(handler.api.dbName, gqlSchemaContents, dbQueryRoot);
          });
        }));
      }
    }

    return Promise.all(promises)
      .then(() => {
        console.log('Initial DB setup done');
        apiHandler.registerFallbackHandler();
      })
      .catch((e) => {
        const reconnectDelay = 2000;
        console.error(`initial db error: ${e}`);
        console.error(`retrying db connection in ${reconnectDelay/1000}s`);
        setTimeout(runInitialDBConnections, reconnectDelay);
      });
  } else {
    console.error('found no api handler');
    return Promise.resolve();
  }
}

const app = express();
app.set('json spaces', 2);

app.use((req, res, next) => {
  if(req.subdomains.length > 0 && subdomainHandlers[req.subdomains[0]] === undefined) {
    // Redirect invalid subdomains (no site handler) to home page
    const hostWithoutSubdomains = req.hostname.split('.').slice(req.subdomains.length).join('.');
    const newUrl = `${req.protocol}://${hostWithoutSubdomains}`;
    res.redirect(newUrl);
  } else {
    next();
  }
});

// Find sites and attach to subdomains
const siteHandlerFileName = 'siteHandler.js';
const siteRootDir = path.join('sites');

fsp.readdir(siteRootDir).then(async (paths) => {
  const stats = await Promise.all(paths.map(async (p) => await fsp.lstat(path.join(siteRootDir, p))));
  const validDirs = paths.filter((_v, i) => stats[i].isDirectory());
  const handlerPaths = validDirs.map((dir) => path.join(siteRootDir, dir, siteHandlerFileName));

  const assertHandlerProp = (id, handler, prop) => {
    const has = Object.prototype.hasOwnProperty.call(handler, prop);
    if(!has) {
      console.error(`${id} missing required prop '${prop}'`);
    }
    return has;
  };

  const siteHandlers = handlerPaths.map((p) => {
    try {
      return { path: p, handler: require(`./${p}`) };
    } catch (error) {
      if(error.code !== 'MODULE_NOT_FOUND') {
        console.error(`error loading handler ${p} (${error})`);
      }
      return null;
    }
  }).filter((h) => h != null 
    && h.handler != null 
    && assertHandlerProp(h.path, h.handler, 'subdomainName')
    && assertHandlerProp(h.path, h.handler, 'router'));

  siteHandlers.forEach(handlerObj => {
    if(handlerObj.handler.subdomainName == null) {
      app.use('/', handlerObj.handler.router);
      subdomainHandlers['www'] = handlerObj.handler;
    } else {
      app.use(subdomain(handlerObj.handler.subdomainName, handlerObj.handler.router));
      subdomainHandlers[handlerObj.handler.subdomainName] = handlerObj.handler;
    }
    console.log(`loaded site handler '${handlerObj.handler.subdomainName || '(home)'}' (${handlerObj.path})`);
  });    
}).then(() =>  runInitialDBConnections()) // Registers API endpoints
  .catch((e) => {
    console.error(`error reading sites (${e})`);
  }).finally(() => {
    app.listen(80, () => { console.log('Server up'); });
  });
