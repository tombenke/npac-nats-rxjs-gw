import { expect } from 'chai'
import config from './config'

before(done => { done() })
after(done => { done() })

describe('npacNatsRxjsGw.config', () => {

    it('#defaults', done => {
        const expected = {
            npacNatsRxjsGw: {
            }
        }
        
        const defaults = config
        expect(defaults).to.eql(expected)
        done()
    })
})
