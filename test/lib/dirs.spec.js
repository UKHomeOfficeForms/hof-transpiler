'use strict';

let dirs;
let rimrafSpy;
let nextStub;

describe('dirs', () => {
  describe('#delete', () => {
    beforeEach(() => {
      rimrafSpy = sinon.spy();
      nextStub = sinon.stub();
      dirs = proxyquire('../lib/dirs', {
        rimraf: rimrafSpy
      });
    });
    it('rimraf called', () => {
      dirs.delete('some/path');
      rimrafSpy.should.have.been.calledWith('some/path');
    });
    it('calls callback', () => {
      dirs.delete('foo/bar', nextStub);
      rimrafSpy.should.have.been.calledWith('foo/bar');
      nextStub.should.have.been.calledWith('foo/bar');
    });
  });
});
