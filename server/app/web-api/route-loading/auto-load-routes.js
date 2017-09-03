const Promise = require('bluebird');
const rek = require('rekuire');
const fs = require('fs');


const checkRoute = file => {
  let shouldImportRoute = false;

  // file is not null
  if(file
    // path has a .js extension ie it's not a folder
    && file.indexOf('.js') != -1
    // file is not a test suite
    && file.indexOf('-tests.js') === -1)
  {
    // all is well, read in these routes
    shouldImportRoute = true;
  }

  return shouldImportRoute;
};

const importRoutes = (file, app) => {
  if(checkRoute(file)) {
    let moduleName = file.replace('.js','');
    let routeModule = rek(moduleName);

    if(typeof routeModule.createRoutes === 'function') {
      routeModule.createRoutes(app);
    }
  }
};

const createRoutes = app => {
  return new Promise((resolve, reject) => {
    const srcpath = __dirname +'/..';

    fs.readdirSync(srcpath).filter(file => importRoutes(file, app));

    resolve(app);
  });
};

module.exports = {
  // read through all the files in /server/app/web-api and load their routes
  createRoutes: createRoutes
};
