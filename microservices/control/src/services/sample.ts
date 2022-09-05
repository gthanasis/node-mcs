import Microservice from 'microservice'
import Sample, { ISample } from '../models/sample'

export default class SampleService {
    private msc: Microservice
    constructor (msc: Microservice) {
        this.msc = msc
    }

    create (props: { name: string }): ISample {
        return Sample(props.name)
    }
}
