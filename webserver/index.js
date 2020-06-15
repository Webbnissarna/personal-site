const express = require('express');
const subdomain = require('express-subdomain');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

// Holds the list of subdomains with valid site handlers
let validSubdomains = [];

const app = express();
app.set('json spaces', 2);

app.use((req, res, next) => {
  if(req.subdomains.length > 0 && !validSubdomains.includes(req.subdomains[0])) {
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
    } else {
      app.use(subdomain(handlerObj.handler.subdomainName, handlerObj.handler.router));
      validSubdomains.push(handlerObj.handler.subdomainName);
    }
    console.log(`loaded site handler '${handlerObj.handler.subdomainName || '(home)'}' (${handlerObj.path})`);
  });    
}).catch((e) => {
  console.error(`error reading sites (${e})`);
}).finally(() => {
  app.listen(80, () => { console.log('Server up'); });
});
