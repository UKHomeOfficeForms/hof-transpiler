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
      compile = require('../../lib/compile');
    });
    it('exist', () => {
      compile.should.exist;
    });
    describe('compiling files', () => {
      let arDir;
      let enDir;
      let english;
      let arabic;
      let arsrc;
      let ensrc;

      before('compile, then read compiled files', (done) => {
        compile({
          sources: [fixtures],
          shared: []
        }, () => {
          // Allow time for files to be written, callback seems to be reliable
          // for write, but doesn't account for stat/read speed
          setTimeout(() => {
            ensrc = path.resolve(fixtures.replace('src', 'en'));
            arsrc = path.resolve(fixtures.replace('src', 'ar'));
            enDir = fs.readdirSync(ensrc);
            arDir = fs.readdirSync(arsrc);
            english = fs.readFileSync(ensrc + '/default.json', 'utf8');
            arabic = fs.readFileSync(arsrc + '/default.json', 'utf8');
            done();
          }, 100);
        });
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
