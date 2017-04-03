'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetId = resetId;
exports.log = log;
exports.default = decorate;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _getParameterNames = require('get-parameter-names');

var _getParameterNames2 = _interopRequireDefault(_getParameterNames);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _seqId = 0;

// ------------------------------------
// Private
// ------------------------------------

/**
 * Copy decorator properties from the original method to the new method
 * @param method
 * @param newMethod
 * @returns {function}
 * @private
 */
function _keepProps(method, newMethod) {
  var props = ['methodName', 'params', 'removeOutput'];
  _lodash2.default.extend(newMethod, _lodash2.default.pick(method, props));
  return newMethod;
}

/**
 * Convert array with arguments to object
 * @param {Array} params the name of parameters
 * @param {Array} arr the array with values
 * @private
 */
function _combineObject(params, arr) {
  var ret = {};
  _lodash2.default.each(arr, function (arg, i) {
    ret[params[i]] = arg;
  });
  return ret;
}

// ------------------------------------
// Exports
// ------------------------------------

/**
 * Reset counter (needed for tests)
 */
function resetId() {
  _seqId = 0;
}

/**
 * Decorator for logging input and output arguments (debug mode)
 * and logging errors
 * @param {Function} method the method to decorate
 * @param {Function} logger the instance of the debug logger
 * @param {Object} opts the options
 * @param {Array} method.params the method parameters
 * @param {Boolean} opts.removeOutput true if don't log output (e.g. sensitive data)
 * @param {String} opts.methodName the method name
 * @returns {Function} the decorator
 */
function log(method, logger, opts) {
  var decorated = function logDecorator() {
    var methodName = opts.methodName;
    var params = opts.params;
    var logExit = function logExit(output, id) {
      logger(id, 'EXIT ' + methodName + ':', output);
      return output;
    };
    var id = ++_seqId;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var formattedInput = params.length ? _combineObject(params, args) : {};
    logger(id, 'ENTER ' + methodName + ':', formattedInput);
    var result = void 0;

    try {
      result = method.apply(undefined, args);
    } catch (e) {
      logger(e);
      throw e;
    }
    // promise (or async function)
    if (result && _lodash2.default.isFunction(result.then)) {
      return result.then(function (asyncResult) {
        logExit(asyncResult, id);
        return asyncResult;
      }).catch(function (e) {
        logger(id, 'ERROR ' + methodName + ': ' + formattedInput + ' \n', e);
        throw e;
      });
    }
    logExit(result, id);
    return result;
  };
  return _keepProps(method, decorated);
}

/**
 * Decorate all methods in the service
 * @param {Object} service the service object
 * @param {String} serviceName the service name
 */
function decorate(service, serviceName) {
  var logger = (0, _debug2.default)(serviceName);
  _lodash2.default.map(service, function (method, name) {
    method.methodName = name;
    if (!method.params) {
      method.params = (0, _getParameterNames2.default)(method);
    }
    service[name] = log(method, logger, method);
  });
}