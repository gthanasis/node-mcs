import 'mocha'
import { assert } from 'chai'

import Sample from '../../src/models/Sample'

describe('Sample model', () => {
    it('Should return the correct fields', done => {
        const r = Sample({
            name: 'test',
            date: 'test',
            exampleField: 'test'
        })
        assert.deepEqual(r.name, 'test')
        assert.deepEqual(r.date, 'test')
        assert.deepEqual(r.exampleField, 'test')
        done()
    })

    it('Should throw if we dont pass date', done => {
        try {
            Sample({name: '1'})
        } catch (e: any) {
            assert.deepEqual(e.message, 'exampleField should be set')
            done()
        }
    })
})
