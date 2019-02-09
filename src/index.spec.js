import npac from 'npac'
import sinon from 'sinon'
import * as _ from 'lodash'
import defaults from './config'
import * as pdms from 'npac-pdms-hemera-adapter'
import { startup, shutdown } from './index'
import { removeSignalHandlers, catchExitSignals, npacStart } from 'npac'
import { map } from 'rxjs/operators'

describe('npacNatsRxjsGw', () => {
    let sandbox

    beforeEach(done => {
        removeSignalHandlers()
        sandbox = sinon.sandbox.create({})
        done()
    })

    afterEach(done => {
        removeSignalHandlers()
        sandbox.restore()
        done()
    })

    const stopServer = () => {
        console.log('Send SIGTERM signal')
        process.kill(process.pid, 'SIGTERM')
    }

    //const natsUri = 'nats:localhost:4222'
    const natsUri = 'nats://demo.nats.io:4222'

    const config = _.merge({}, defaults, { pdms: { natsUri: natsUri } })
    const adapters = [npac.mergeConfig(config), npac.addLogger, pdms.startup, startup]

    const terminators = [shutdown, pdms.shutdown]

    it('#natsTopicWriter, #natsTopicObservable - RxJS loopback', done => {
        catchExitSignals(sandbox, done)

        const setupRxjsLoopbackJob = (container, next) => {
            const tpaObservable = container.npacNatsRxjsGw.natsTopicObservable('CLX')
            const tmaWriter = container.npacNatsRxjsGw.natsTopicWriter('BEX')
            tpaObservable.pipe(map(it => it)).subscribe(tmaWriter)
            next(null, null)
        }

        const sendAndReceiveJob = (container, next) => {
            const tmaObservable = container.npacNatsRxjsGw.natsTopicObservable('BEX')
            const tpaWriter = container.npacNatsRxjsGw.natsTopicWriter('CLX')

            tmaObservable.subscribe(data => {
                console.log(`[BEX] >> ${JSON.stringify(data)}`)
                stopServer()
            })
            tpaWriter({ topic: 'BEX', type: 'theMessageType', payload: 'some text payload' })
            // No termination of job, the tmaObserver has to catch the answer, and stop the process
            //next(null, null)
        }

        npacStart(adapters, [setupRxjsLoopbackJob, sendAndReceiveJob], terminators)
    }).timeout(100000)

    it('#natsTopicTapWriter, #natsTopicObservable - RxJS loopback', done => {
        catchExitSignals(sandbox, done)

        const setupRxjsLoopbackJob = (container, next) => {
            const tpaObservable = container.npacNatsRxjsGw.natsTopicObservable('CLX')
            const tmaTapWriter = container.npacNatsRxjsGw.natsTopicTapWriter('BEX')
            tpaObservable
                .pipe(
                    map(it => it),
                    tmaTapWriter
                )
                .subscribe()
            next(null, null)
        }

        const sendAndReceiveJob = (container, next) => {
            const tmaObservable = container.npacNatsRxjsGw.natsTopicObservable('BEX')
            const tpaWriter = container.npacNatsRxjsGw.natsTopicWriter('CLX')

            tmaObservable.subscribe(data => {
                console.log(`[BEX] >> ${JSON.stringify(data)}`)
                stopServer()
            })
            tpaWriter({ topic: 'BEX', type: 'theMessageType', payload: 'some text payload' })
            // No termination of job, the tmaObserver has to catch the answer, and stop the process
            //next(null, null)
        }

        npacStart(adapters, [setupRxjsLoopbackJob, sendAndReceiveJob], terminators)
    }).timeout(100000)
})
