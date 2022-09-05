import {OperationalError} from 'bluebird'

export class OpError extends OperationalError {
    private code: number;

    constructor ({message = 'Generic operational error', code = 500} = {}) {
        super(message)
        this.message = message
        this.code = code
    }
}

export class NotFoundError extends OpError {
    constructor ({message = 'The requested url could not be found', code = 404} = {}) {
        super({message, code})
    }
}

export class ResourceNotFoundError extends OpError {
    constructor ({message = 'Resource not found', code = 404} = {}) {
        super({message, code})
    }
}

export class UnauthorizedError extends OpError {
    constructor ({message = 'Authentication required', code = 401} = {}) {
        super({message, code})
    }
}

export class ForbiddenError extends OpError {
    constructor ({message = 'You are not authorized to perform this request', code = 403} = {}) {
        super({message, code})
    }
}

export class BadRequestError extends OpError {
    constructor ({message = 'Your request could not be served. Please make sure you provided the correct input.', code = 400} = {}) {
        super({message, code})
    }
}

export class ResourceExistsError extends OpError {
    constructor ({message = 'Resource already exists', code = 409} = {}) {
        super({message, code})
    }
}
