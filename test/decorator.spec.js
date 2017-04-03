import debug from 'debug';
import decorator, { resetId } from '../src/decorator';

describe('decorator', () => {
  let _debug;

  beforeEach(() => {
    resetId();
    _debug = sinon.stub(debug, 'log');
  });

  afterEach(() => {
    debug.log.restore();
  });

  describe('[sync]', () => {
    let _service;
    before(() => {
      function add(a, b) {
        return a + b;
      }

      _service = { add };
      decorator(_service, 'app:CalcService');
    });

    it('should add 2 numbers', () => {
      const result = _service.add(1, 2);
      expect(result).to.be.equal(3);
      _debug.should.have.been.calledTwice;
      _debug.firstCall.should.have.been.calledWith(sinon.match.any, 'ENTER add:', { a: 1, b: 2 });
      _debug.secondCall.should.have.been.calledWith(sinon.match.any, 'EXIT add:', 3);
    });
  });

  describe('[sync no params]', () => {
    let _service;
    before(() => {
      function getValue() {
        return 1;
      }

      _service = { getValue };
      decorator(_service, 'app:CalcService');
    });

    it('should get value', () => {
      const result = _service.getValue();
      expect(result).to.be.equal(1);
      _debug.should.have.been.calledTwice;
      _debug.firstCall.should.have.been.calledWith(sinon.match.any, 'ENTER getValue:', {});
      _debug.secondCall.should.have.been.calledWith(sinon.match.any, 'EXIT getValue:', 1);
    });
  });

  describe('[sync returns undefined]', () => {
    let _service;
    before(() => {
      function getValue() {
        return undefined;
      }
      _service = { getValue };
      decorator(_service, 'app:CalcService');
    });

    it('should get value', () => {
      const result = _service.getValue();
      expect(result).to.be.equal(undefined);
      _debug.should.have.been.calledTwice;
      _debug.firstCall.should.have.been.calledWith(sinon.match.any, 'ENTER getValue:', {});
      _debug.secondCall.should.have.been.calledWith(sinon.match.any, 'EXIT getValue:', undefined);
    });
  });


  describe('[async]', () => {
    let _service;
    let _user;

    before(() => {
      _user = { id: 1, username: 'john' };

      async function getUser(id) {
        return await new Promise((resolve) => {
          setTimeout(() => resolve({ id, username: 'john' }), 10);
        });
      }

      getUser.params = ['id'];
      _service = { getUser };
      decorator(_service, 'app:UserService');
    });

    it('should get user', async () => {
      const user = await _service.getUser(1);
      expect(user).to.be.deep.equal(_user);
      _debug.should.have.been.calledTwice;
      _debug.firstCall.should.have.been.calledWith(sinon.match.any, 'ENTER getUser:', { id: 1 });
      _debug.secondCall.should.have.been.calledWith(sinon.match.any, 'EXIT getUser:', { id: 1, username: 'john' });
    });
  });
});
