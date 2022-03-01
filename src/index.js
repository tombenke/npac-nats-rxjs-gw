import defaults from './config'
import _ from 'lodash'
import { Observable } from 'rxjs'
import { printMsg } from './trace'
const { mergeMap, tap, map } = require('rxjs/operators')

/**
 * Create an Observable, that acts as a source of data origin from a NATS topic
 *
 * @arg {String} topic - The name of the NATS topic to observe
 *
 * @returns {rxjs.Observable} the Observable object
 *
 * @function
 */
const natsTopicObservable =
    (container) =>
    (topic, nullPayloadCompletes = false) =>
        new Observable((observer) => {
            container.pdms.add({ pubsub$: true, topic: topic }, (data) => {
                if (nullPayloadCompletes && (_.isUndefined(data.payload) || data.payload === null)) {
                    console.log(`natsTopicObserver(${topic}).complete with data: ${JSON.stringify(data)}`)
                    observer.complete()
                } else {
                    observer.next(data)
                }
            })
        })

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
const messageSourceProxy = (container) => (topic) =>
    natsTopicObservable(container)(topic, true).pipe(
        map((it) => it.payload),
        tap(printMsg(`${topic} >>`))
    )

/**
 * Send message to NATS topic
 *
 * @arg {String} topic - The name of the NATS topic the payload will be sent
 *
 * @return {Function} The function with an {Object} `payload` argument that will be sent to the topic
 *
 * @function
 */
const natsTopicWriter = (container) => (topic) => (payload) =>
    container.pdms.act({ pubsub$: true, topic: topic, payload })

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
const sendMessage = (container) => (topic, payload) => natsTopicWriter(container)(topic)(payload)

/**
 * A tap operator, that passes through the input data, but also writes it to a NATS topic
 *
 * @arg {String} topic - The name of the NATS topic to write the data into
 *
 * @returns {Object} the tap RxJS operator
 *
 * @function
 */
const natsTopicTapWriter = (container) => (topic) =>
    mergeMap((data) => {
        return new Promise((resolve, reject) => {
            container.pdms.act({ ...data, pubsub$: true, topic: topic })
            resolve(data)
        })
    })

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
const startup = (container, next) => {
    // Merges the defaults with the config coming from the outer world
    const npacNatsRxjsGwConfig = _.merge({}, defaults, { npacNatsRxjsGw: container.config.npacNatsRxjsGw || {} })
    container.logger.info('Start up npacNatsRxjsGw adapter')

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
    })
}

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
const shutdown = (container, next) => {
    container.logger.info('Shut down npacNatsRxjsGw adapter')
    next(null, null)
}

module.exports = {
    defaults: defaults,
    startup: startup,
    shutdown: shutdown
}
