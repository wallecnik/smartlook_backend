
export class NotFoundError {
    readonly type: ErrorType = ErrorType.NOT_FOUND
    readonly message: string

    constructor(message: string) {
        this.message = message;
    }
}

export enum ErrorType {
    NOT_FOUND
}

export function httpStatus(errorType: ErrorType): number {
    switch (errorType) {
        case ErrorType.NOT_FOUND:
            return 404
        case undefined:
        default:
            return 500
    }
}