const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
let collectionsImported = false;

const createCollection = function(file) {
  const modelName = file.replace('.js','');
  const modulePath = './collections/' +modelName;

  // require in the module for this collection
  const modelModule = require(modulePath);

  // register the schema with mongoose
  modelModule.register();
};

const importCollections = function() {
  if(!collectionsImported) {
    const srcpath = __dirname +'/collections';

    fs.readdirSync(srcpath).filter(file => createCollection(file));

    collectionsImported = true;
  }
};

module.exports = {
  importCollections: importCollections,
};
