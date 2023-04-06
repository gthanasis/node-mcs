import {I__useCase__} from 'project-types'
import {BadRequestError} from 'library'

const validate = (__useCase__(lowerCase): Partial<I__useCase__>): void => {
    if (__useCase__(lowerCase).color === 'invalidColor') throw new BadRequestError({ code: 400, message: '__useCase__ color cannot be invalidColor' })
}

export const __useCase__ = (props: Partial<I__useCase__>): Partial<I__useCase__> => {
    validate(props)
    const { name = 'Sample __useCase__', color = 'red' } = props
    const createdAt = new Date()
    return {
        name,
        color,
        createdAt: createdAt.toISOString(),
        deletedAt: null,
        updatedAt: null
    }
}
