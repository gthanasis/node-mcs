import 'mocha'
import { assert } from 'chai'

import SampleService from '../../src/services/SampleService'
import {BunyanLogger, Logger} from 'logger'
import {InMemoryPersistence} from 'library'
import {ISample, ISampleDAO, WithID} from 'project-types'

describe('Sample service', () => {
    const sampleInDb: ISampleDAO & { _id: string } = {
        _id: '1',
        name: 'test',
        date: 'test',
        exampleField: 'test'
    }
    const sampleInJSON: ISample = {
        id: '1',
        name: 'test',
        date: 'test',
        exampleField: 'test'
    }

    it('[create] Should create a sample with the correct data', async () => {
        const logger: BunyanLogger = new Logger({name: 'test', level: 'FATAL'}).detach()
        const persistence: InMemoryPersistence = new InMemoryPersistence(['samples'])

        const service = new SampleService(persistence, logger)
        await service.create(sampleInJSON)
        const res = await persistence.findAll<ISampleDAO>([{}], 'samples')
        assert.deepEqual(res[0].name, 'test')
    })

    it('[get] Should return a sample formated in JSON when it exists', async () => {
        const logger: BunyanLogger = new Logger({name: 'test', level: 'FATAL'}).detach()
        const persistence: InMemoryPersistence = new InMemoryPersistence(['samples'])

        const service = new SampleService(persistence, logger)
        // NOTE: double id is due to InMemoryPersistence way of storing ids
        // TODO: we should maybe provide the transformers to separate the logic correctly
        await persistence.create<ISampleDAO>(sampleInDb, 'samples')
        const sample = await service.get('1')
        assert.deepEqual<any>(sample, sampleInJSON)
    })

    it('[get] Should throw when sample does not exist', async () => {
        const logger: BunyanLogger = new Logger({name: 'test', level: 'FATAL'}).detach()
        const persistence: InMemoryPersistence = new InMemoryPersistence(['samples'])

        const service = new SampleService(persistence, logger)
        try {
            await service.get('1')
        } catch (err: any) {
            assert.deepEqual(err.constructor.name, 'ResourceNotFoundError')
        }
    })

    it('[patch] Should update when sample exists', async () => {
        const logger: BunyanLogger = new Logger({name: 'test', level: 'FATAL'}).detach()
        const persistence: InMemoryPersistence = new InMemoryPersistence(['samples'])

        await persistence.create<ISampleDAO>(sampleInDb, 'samples')
        const service = new SampleService(persistence, logger)
        await service.update('1', { name: 'test1' })
        const sample = await persistence.find<ISampleDAO>('1', 'samples')
        assert.deepEqual(sample.name, 'test1')
    })

    it('[patch] Should throw when sample does not exist', async () => {
        const logger: BunyanLogger = new Logger({name: 'test', level: 'FATAL'}).detach()
        const persistence: InMemoryPersistence = new InMemoryPersistence(['samples'])

        const service = new SampleService(persistence, logger)
        try {
            await service.update('1', {})
        } catch (err: any) {
            assert.deepEqual(err.constructor.name, 'ResourceNotFoundError')
        }
    })

    it('[delete] Should throw when sample does not exist', async () => {
        const logger: BunyanLogger = new Logger({name: 'test', level: 'FATAL'}).detach()
        const persistence: InMemoryPersistence = new InMemoryPersistence(['samples'])

        const service = new SampleService(persistence, logger)
        try {
            await service.delete('1')
        } catch (err: any) {
            assert.deepEqual(err.constructor.name, 'ResourceNotFoundError')
        }
    })

    it('[delete] Should delete when sample exists', async () => {
        const logger: BunyanLogger = new Logger({name: 'test', level: 'FATAL'}).detach()
        const persistence: InMemoryPersistence = new InMemoryPersistence(['samples'])

        const sampleCreated = await persistence.create<ISampleDAO>({ name: 'test' }, 'samples')
        const service = new SampleService(persistence, logger)
        await service.delete(sampleCreated._id!)
        const sample = await persistence.find<ISampleDAO>('1', 'samples')
        assert.deepEqual(sample, null)
    })
})
