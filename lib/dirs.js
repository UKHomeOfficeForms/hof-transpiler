'use strict';

const rimraf = require('rimraf');

const deleteDir = (dirPath, next) => {
  rimraf(dirPath, (err) => {
    if (err) {
      throw Error(err);
    }
  });

  if (next) {
    next(dirPath);
  }
};

module.exports = {
  delete: deleteDir
};
