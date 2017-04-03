import _ from 'lodash';
import getParams from 'get-parameter-names';
import createDebug from 'debug';

let _seqId = 0;

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
  const props = ['methodName', 'params', 'removeOutput'];
  _.extend(newMethod, _.pick(method, props));
  return newMethod;
}

/**
 * Convert array with arguments to object
 * @param {Array} params the name of parameters
 * @param {Array} arr the array with values
 * @private
 */
function _combineObject(params, arr) {
  const ret = {};
  _.each(arr, (arg, i) => {
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
export function resetId() {
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
export function log(method, logger, opts) {
  const decorated = function logDecorator(...args) {
    const methodName = opts.methodName;
    const params = opts.params;
    const logExit = (output, id) => {
      logger(id, `EXIT ${methodName}:`, output);
      return output;
    };
    const id = ++_seqId;
    const formattedInput = params.length ? _combineObject(params, args) : {};
    logger(id, `ENTER ${methodName}:`, formattedInput);
    let result;

    try {
      result = method(...args);
    } catch (e) {
      logger(e);
      throw e;
    }
    // promise (or async function)
    if (result && _.isFunction(result.then)) {
      return result.then((asyncResult) => {
        logExit(asyncResult, id);
        return asyncResult;
      }).catch((e) => {
        logger(id, `ERROR ${methodName}: ${formattedInput} \n`, e);
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
export default function decorate(service, serviceName) {
  const logger = createDebug(serviceName);
  _.map(service, (method, name) => {
    method.methodName = name;
    if (!method.params) {
      method.params = getParams(method);
    }
    service[name] = log(method, logger, method);
  });
}
