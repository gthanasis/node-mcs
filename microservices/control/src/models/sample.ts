const sample = (name: string): ISample => {
    return {
        exampleField: name
    }
}

export interface ISample {
    exampleField: string
}

export default sample
