'use strict';

global.chai = require('chai')
  .use(require('sinon-chai'));
global.should = global.chai.should();
global.sinon = require('sinon');
global.proxyquire = require('proxyquire');
