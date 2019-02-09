'use strict';

var _npac = require('npac');

var _npac2 = _interopRequireDefault(_npac);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _npacPdmsHemeraAdapter = require('npac-pdms-hemera-adapter');

var pdms = _interopRequireWildcard(_npacPdmsHemeraAdapter);

var _index = require('./index');

var _npacUtils = require('./npacUtils');

var _operators = require('rxjs/operators');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('npacNatsRxjsGw', function () {
    var sandbox = void 0;

    beforeEach(function (done) {
        (0, _npacUtils.removeSignalHandlers)();
        sandbox = _sinon2.default.sandbox.create({});
        done();
    });

    afterEach(function (done) {
        (0, _npacUtils.removeSignalHandlers)();
        sandbox.restore();
        done();
    });

    var stopServer = function stopServer() {
        console.log('Send SIGTERM signal');
        process.kill(process.pid, 'SIGTERM');
    };

    //const natsUri = 'nats:localhost:4222'
    var natsUri = "nats://demo.nats.io:4222";

    var config = _.merge({}, _config2.default, { pdms: { natsUri: natsUri } });
    var adapters = [_npac2.default.mergeConfig(config), _npac2.default.addLogger, pdms.startup, _index.startup];

    var terminators = [_index.shutdown, pdms.shutdown];

    it('#natsTopicWriter, #natsTopicObservable - RxJS loopback', function (done) {

        (0, _npacUtils.catchExitSignals)(sandbox, done);

        var setupRxjsLoopbackJob = function setupRxjsLoopbackJob(container, next) {
            var tpaObservable = container.npacNatsRxjsGw.natsTopicObservable('CLX');
            var tmaWriter = container.npacNatsRxjsGw.natsTopicWriter('BEX');
            tpaObservable.pipe((0, _operators.map)(function (it) {
                return it;
            })).subscribe(tmaWriter);
            next(null, null);
        };

        var sendAndReceiveJob = function sendAndReceiveJob(container, next) {
            var tmaObservable = container.npacNatsRxjsGw.natsTopicObservable('BEX');
            var tpaWriter = container.npacNatsRxjsGw.natsTopicWriter('CLX');

            tmaObservable.subscribe(function (data) {
                console.log('[BEX] >> ' + JSON.stringify(data));
                stopServer();
            });
            tpaWriter({ topic: "BEX", type: "theMessageType", payload: "some text payload" });
            // No termination of job, the tmaObserver has to catch the answer, and stop the process
            //next(null, null)
        };

        (0, _npacUtils.npacStart)(adapters, [setupRxjsLoopbackJob, sendAndReceiveJob], terminators);
    }).timeout(100000);

    it('#natsTopicTapWriter, #natsTopicObservable - RxJS loopback', function (done) {

        (0, _npacUtils.catchExitSignals)(sandbox, done);

        var setupRxjsLoopbackJob = function setupRxjsLoopbackJob(container, next) {
            var tpaObservable = container.npacNatsRxjsGw.natsTopicObservable('CLX');
            var tmaTapWriter = container.npacNatsRxjsGw.natsTopicTapWriter('BEX');
            tpaObservable.pipe((0, _operators.map)(function (it) {
                return it;
            }), tmaTapWriter).subscribe();
            next(null, null);
        };

        var sendAndReceiveJob = function sendAndReceiveJob(container, next) {
            var tmaObservable = container.npacNatsRxjsGw.natsTopicObservable('BEX');
            var tpaWriter = container.npacNatsRxjsGw.natsTopicWriter('CLX');

            tmaObservable.subscribe(function (data) {
                console.log('[BEX] >> ' + JSON.stringify(data));
                stopServer();
            });
            tpaWriter({ topic: "BEX", type: "theMessageType", payload: "some text payload" });
            // No termination of job, the tmaObserver has to catch the answer, and stop the process
            //next(null, null)
        };

        (0, _npacUtils.npacStart)(adapters, [setupRxjsLoopbackJob, sendAndReceiveJob], terminators);
    }).timeout(100000);
});