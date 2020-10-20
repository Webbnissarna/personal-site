const { series } = require('gulp');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

function buildSite(sitePath) {
  return new Promise((resolve, reject) => {
    console.log(`Building ${sitePath}`);
    exec('npm run build', { cwd: sitePath }, (err) => {
      if(err) {
        console.error(`Failed building ${sitePath}`);
        reject(err);
      }
      else {
        resolve();
        console.log(`Finished building ${sitePath}`);
      }
    });
  });
}

function buildSites() {
  return fs.readdir('../react-sites')
  .then((sites) => {
    return Promise.all(sites.map((p) => buildSite(path.join('../react-sites', p))));
  });
}

function deployBuiltSite(sitePath) {
  const name = path.basename(sitePath);
  const src = path.join(sitePath, 'build');
  const dst = path.join('../webserver/sites/', name, 'static');
  console.log(`Deploying site ${src} => ${dst}`);
  return fs.emptyDir(dst)
  .then(() => fs.copy(src, dst));
}

function deployBuiltSites() {
  return fs.readdir('../react-sites')
  .then((sites) => {
    return Promise.all(sites.map((p) => deployBuiltSite(path.join('../react-sites', p))));
  })
}

exports.buildAndDeploySites = series(buildSites, deployBuiltSites);
