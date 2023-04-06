import {ICar} from 'project-types'
import {BadRequestError} from 'library'

const validate = (car: Partial<ICar>): void => {
    if (car.color === 'invalidColor') throw new BadRequestError({ code: 400, message: 'Car color cannot be invalidColor' })
}

export const Car = (props: Partial<ICar>): Partial<ICar> => {
    validate(props)
    const { name = 'Sample Car', color = 'red' } = props
    const createdAt = new Date()
    return {
        name,
        color,
        createdAt: createdAt.toISOString(),
        deletedAt: null,
        updatedAt: null
    }
}
