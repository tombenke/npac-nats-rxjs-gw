'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _rxjs = require('rxjs');

var _trace = require('./trace');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('rxjs/operators'),
    mergeMap = _require.mergeMap,
    tap = _require.tap,
    map = _require.map;

/**
 * Create an Observable, that acts as a source of data origin from a NATS topic
 *
 * @arg {String} topic - The name of the NATS topic to observe
 *
 * @returns {rxjs.Observable} the Observable object
 *
 * @function
 */


var natsTopicObservable = function natsTopicObservable(container) {
    return function (topic) {
        var nullPayloadCompletes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        return new _rxjs.Observable(function (observer) {
            container.pdms.add({ pubsub$: true, topic: topic }, function (data) {
                if (nullPayloadCompletes && (_lodash2.default.isUndefined(data.payload) || data.payload === null)) {
                    console.log('natsTopicObserver(' + topic + ').complete with data: ' + JSON.stringify(data));
                    observer.complete();
                } else {
                    observer.next(data);
                }
            });
        });
    };
};

/**
 * Helper function to create a NATS topic observable,
 * that also prints the incoming data for debugging purposes
 *
 * @arg {String} topic - The name of the NATS topic to observe
 *
 * @returns {rxjs.Observable} the Observable object
 *
 * @function
 */
var messageSourceProxy = function messageSourceProxy(container) {
    return function (topic) {
        return natsTopicObservable(container)(topic, true).pipe(map(function (it) {
            return it.payload;
        }), tap((0, _trace.printMsg)(topic + ' >>')));
    };
};

/**
 * Send message to NATS topic
 *
 * @arg {String} topic - The name of the NATS topic the payload will be sent
 *
 * @return {Function} The function with an {Object} `payload` argument that will be sent to the topic
 *
 * @function
 */
var natsTopicWriter = function natsTopicWriter(container) {
    return function (topic) {
        return function (payload) {
            return container.pdms.act({ pubsub$: true, topic: topic, payload: payload });
        };
    };
};

/**
 * Send message to NATS topic
 *
 * Wrapper function to natsTopicWriter, to send a message within one function call.
 *
 * @arg {String} topic - The name of the topic to send the message
 * @arg {Object} payload - The message content to send
 *
 * @function
 */
var sendMessage = function sendMessage(container) {
    return function (topic, payload) {
        return natsTopicWriter(container)(topic)(payload);
    };
};

/**
 * A tap operator, that passes through the input data, but also writes it to a NATS topic
 *
 * @arg {String} topic - The name of the NATS topic to write the data into
 *
 * @returns {Object} the tap RxJS operator
 *
 * @function
 */
var natsTopicTapWriter = function natsTopicTapWriter(container) {
    return function (topic) {
        return mergeMap(function (data) {
            return new Promise(function (resolve, reject) {
                container.pdms.act(_extends({}, data, { pubsub$: true, topic: topic }));
                resolve(data);
            });
        });
    };
};

/**
 * The startup function of the adapter
 *
 * This function should be registered with the startup phase, then npac will call when the project is starting.
 * After startup the adapter will provide the following API:
 *   * natsTopicObservable()
 *   * messageSourceProxy()
 *   * sendMessage()
 *   * natsTopicWriter()
 *   * natsTopicTapWriter()
 *
 * @arg {Object} container  - The actual state of the container this adapter will be added
 * @arg {Function} next     - Error-first callback function to pass the result partial container extended with the pdmsHemera adapter.
 *
 * see also: the `npac.startup` process description.
 *
 * @function
 */
var startup = function startup(container, next) {
    // Merges the defaults with the config coming from the outer world
    var npacNatsRxjsGwConfig = _lodash2.default.merge({}, _config2.default, { npacNatsRxjsGw: container.config.npacNatsRxjsGw || {} });
    container.logger.info('Start up npacNatsRxjsGw adapter');

    // Call next setup function with the context extension
    next(null, {
        config: npacNatsRxjsGwConfig,
        npacNatsRxjsGw: {
            natsTopicWriter: natsTopicWriter(container),
            natsTopicTapWriter: natsTopicTapWriter(container),
            natsTopicObservable: natsTopicObservable(container),
            messageSourceProxy: messageSourceProxy(container),
            sendMessage: sendMessage(container)
        }
    });
};

/**
 * The shutdown function of the npacNatsRxjsGw adapter
 *
 * This function should be registered with the shutdown phase, then npac will call when graceful shutdown happens.
 *
 * @arg {Object} container  - The actual state of the container this adapter is running
 * @arg {Function} next     - Error-first callback function to pass the result partial container extended with the pdmsHemera adapter.
 *
 * see also: the `npac.startup` process description.
 *
 * @function
 */
var shutdown = function shutdown(container, next) {
    container.logger.info('Shut down npacNatsRxjsGw adapter');
    next(null, null);
};

module.exports = {
    defaults: _config2.default,
    startup: startup,
    shutdown: shutdown
};