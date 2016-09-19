'use strict';

const fs = require('fs');
const path = require('path');
const getdirs = (location) => fs.readdirSync(location).filter(
  (file) => fs.statSync(path.join(location, file)).isDirectory()
);
const fixtures = './test/fixtures/src';

let compile;

describe('compile', () => {
  describe('without shared', () => {
    beforeEach(() => {
      compile = require('../lib/compile');
    });
    it('exist', () => {
      compile.should.exist;
    });
    describe('compiling files', () => {
      let arDir;
      let enDir;
      let english;
      let arabic;
      let arsrc = path.resolve(fixtures.replace('src', 'ar'));
      let ensrc = path.resolve(fixtures.replace('src', 'en'));

      before((done) => {
        compile({
          sources: [fixtures],
          shared: []
        }, () => {
          english = fs.readFileSync(ensrc + '/default.json', 'utf8');
          arabic = fs.readFileSync(arsrc + '/default.json', 'utf8');
          done();
        });
        arDir = fs.readdirSync(arsrc);
        enDir = fs.readdirSync(ensrc);
      });

      it('creates new folders', () => {
        getdirs(fixtures).should.deep.equal(['ar', 'en']);
      });
      it('creates defaults', () => {
        arDir.should.deep.equal([
          'default.json'
        ]);
        enDir.should.deep.equal([
          'default.json'
        ]);
      });

      describe('defaults', () => {
        it('english', () => {
          JSON.parse(english).should.deep.equal({
            'app': {
              'title': 'Electronic Visa Waiver'
            },
            'buttons': {
              'continue': 'Continue',
              'send': 'Send',
              'change': 'Edit',
              'close': 'Close',
              'Confirm': 'Confirm details'
            },
            'errorlist': {
              'title': {
                'single': 'Check your answers:',
                'multiple': 'Check your answers:'
              }
            }
          });
        });
        it('arabic', () => {
          JSON.parse(arabic).should.deep.equal({
            'app': {
              'title': 'Electronic Visa Waiver'
            },
            'buttons': {
              'continue': 'استمر'
            },
            'errorlist': {
              'title': {
                'single': 'راجع إجاباتك:',
                'multiple': 'راجع إجاباتك:'
              }
            }
          });
        });
      });
    });
  });
});
