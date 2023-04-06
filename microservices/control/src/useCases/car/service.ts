import {CarRepository, retrieveWithFilterProps} from './repository'
import {Car} from './model'
import {BunyanLogger} from 'logger'
import {ICar} from 'project-types'

export class CarService {
    private repository: CarRepository
    private logger: BunyanLogger

    constructor ({ repository, logger }: { repository: CarRepository, logger: BunyanLogger}) {
        this.repository = repository
        this.logger = logger
    }

    async retrieve ({ query = {}, pagination, order, search }: retrieveWithFilterProps) {
        return await this.repository.retrieveWithFilter({ query, pagination, order, search })
    }

    async insert (payload: Partial<ICar>) {
        const car = Car(payload)
        return await this.repository.insert(car)
    }

    async update ({ filters, attrs }: any) {
        return await this.repository.update({ filters, attrs })
    }

    async delete (filters: any) {
        return await this.repository.update({ filters, attrs: { deletedAt: new Date() } })
    }
}
