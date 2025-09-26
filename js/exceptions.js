// Custom Exception Classes
export class AuthenticationException extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationException';
    }
}

export class AuthorizationException extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthorizationException';
    }
}

export class ValidationException extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationException';
    }
}