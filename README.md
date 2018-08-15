npac-nats-rxjs-gw
=================

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)
[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coveralls][BadgeCoveralls]][Coveralls]

## About

npac adapter that provides gateway functionalities between NATS and RxJS pipelines

## Installation

Run the install command:

    npm install --save npac-nats-rxjs-gw

## Configuration

This module uses the `config.npacNatsRxjsGw` property to gain its configuration parameters.

The default parameters can be found in [`src/config.js`](src/config.js):

```JSON
{
    npacNatsRxjsGw: {
    }
}
```

## Get Help

To learn more about the tool visit the [API docs](http://tombenke.github.io/npac-nats-rxjs-gw/).

## References

- [npac](http://tombenke.github.io/npac).

---

This project was generated from the [ncli-archetype](https://github.com/tombenke/ncli-archetype)
project archetype, using the [kickoff](https://github.com/tombenke/kickoff) utility.

[npm-badge]: https://badge.fury.io/js/npac-nats-rxjs-gw.svg
[npm-url]: https://badge.fury.io/js/npac-nats-rxjs-gw
[travis-badge]: https://api.travis-ci.org/tombenke/npac-nats-rxjs-gw.svg
[travis-url]: https://travis-ci.org/tombenke/npac-nats-rxjs-gw
[Coveralls]: https://coveralls.io/github/tombenke/npac-nats-rxjs-gw?branch=master
[BadgeCoveralls]: https://coveralls.io/repos/github/tombenke/npac-nats-rxjs-gw/badge.svg?branch=master
