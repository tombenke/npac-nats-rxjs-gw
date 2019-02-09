'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.tee = exports.print = exports.printMsg = exports.printJson = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var printJson = exports.printJson = function printJson(label, data) {
    var spaces = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    return spaces > 0 ? console.log(label + ': ' + JSON.stringify(data, null, _lodash2.default.times(spaces, _lodash2.default.constant(' ')).join(''))) : console.log(label + ': ' + JSON.stringify(data));
};

var printMsg = exports.printMsg = function printMsg(label) {
    return function (it) {
        console.log('\n[' + label + ']');
        switch (_lodash2.default.get(it, 'type', '')) {
            default:
                console.log('...', JSON.stringify(it));
                break;
        }
    };
};

var print = exports.print = function print(label) {
    return function (it) {
        return console.log('\n[' + label + ']\n' + JSON.stringify(it));
    };
};

var tee = exports.tee = function tee(fun) {
    return function (it) {
        fun(it);
        return it;
    };
};