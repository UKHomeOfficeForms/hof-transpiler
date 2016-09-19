'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const walk = require('walk');
const getLanguage = (langPath) => langPath.split('/').pop();

const parseFileSync = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(error);
  }
};

const directory = (root, dirStats, next, translationObject) => {
  const newBasePath = path.resolve(root.replace('/src', ''), dirStats.name);

  mkdirp(newBasePath, function (mkerr) {
    if (mkerr) {
      throw Error(mkerr);
    }
    translationObject[dirStats.name] = fs
      .createWriteStream(
        path.resolve(root.replace('/src', ''),
          dirStats.name,
          'default.json'
        )
      );
    translationObject[dirStats.name].write('{');
    next();
  });
};

const compile = (args, cb) => {
  let sources = args.sources;
  let shared = args.shared;
  sources.forEach(function walking (src) {
    var walker = walk.walk(src);
    var writeFileStream = {};
    var firstFileForDir = {};

    /* eslint func-names:0 max-nested-callbacks:0 */
    walker.on('directory', function (root, dirStats, next) {
      directory(root, dirStats, next, writeFileStream);
    });

    walker.on('file', function (root, fileStats, next) {
      var lang = getLanguage(root);
      var readStream = fs.createReadStream(path.resolve(root, fileStats.name));

      if (!firstFileForDir[lang]) {
        writeFileStream[lang].write('"' + fileStats.name.replace('.json', '') + '": ');
        firstFileForDir[lang] = true;
      } else {
        writeFileStream[lang].write(',"' + fileStats.name.replace('.json', '') + '": ');
      }

      readStream.on('data', function (chunk) {
        writeFileStream[lang].write(chunk);
      });

      readStream.on('end', function () {
        next();
      });
    });

    walker.on('end', function () {
      Object.keys(writeFileStream).forEach((key) => {
        var sharedMap = {};

        shared.forEach(function (sharedSource) {
          walk.walk(sharedSource).on('file', function (root, fileStats, next) {
            var lang = getLanguage(root);
            var streamLang = getLanguage(path.parse(writeFileStream[key].path).dir);
            var fileName = fileStats.name.replace('.json', '');
            let current;
            let strung;
            let combined;

            sharedMap[streamLang] = sharedMap[streamLang] || {};
            sharedMap[lang] = sharedMap[lang] || {};
            sharedMap[lang][fileName] = parseFileSync(path.resolve(root, fileStats.name));

            current = sharedMap[streamLang];

            combined = Object.assign(current, parseFileSync(writeFileStream[key].path));
            strung = JSON.stringify(combined, null, '\t');

            fs.writeFileSync(writeFileStream[key].path, strung, 'utf8');
            next();
          });
        });

        writeFileStream[key].end('}');
      });
    });
  });
  if (cb) {
    cb();
  }
};

module.exports = compile;
