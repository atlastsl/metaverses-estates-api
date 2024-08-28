import { IAppErrorDictionary } from '../../../main/errors/apperror';

export const UserErrors: IAppErrorDictionary = {
    USER_NOT_FOUND: {
        message: 'User Not Found',
        code: 'USER_NOT_FOUND',
        display_messages: [
            {
                lang: 'en',
                value: '',
            },
            {
                lang: 'fr',
                value: '',
            },
        ],
    },
    USER_ACCOUNT_SUSPENDED: {
        code: 'USER_ACCOUNT_SUSPENDED',
        message: 'User Account Suspended',
        display_messages: [
            {
                lang: 'en',
                value: 'Account Suspended',
            },
            {
                lang: 'fr',
                value: '',
            },
        ],
    },
    USER_INVALID_SESSION: {
        code: 'USER_INVALID_SESSION',
        message: 'User invalid session',
        display_messages: [
            {
                lang: 'en',
                value: 'Invalid or expired session',
            },
            {
                lang: 'fr',
                value: 'Session invalide ou expirée.',
            },
        ],
    },
    USER_OPERATION_UNAUTHORIZED: {
        code: 'USER_OPERATION_UNAUTHORIZED',
        message: 'User operation unauthorized',
        display_messages: [
            {
                lang: 'en',
                value: '',
            },
            {
                lang: 'fr',
                value: '',
            },
        ],
    },
    USER_PASSWORD_INCORRECT: {
        code: 'USER_PASSWORD_INCORRECT',
        message: 'User password incorrect',
        display_messages: [
            {
                lang: 'en',
                value: 'Account Suspended',
            },
            {
                lang: 'fr',
                value: '',
            },
        ],
    },
    USER_AUTH_TOKEN_NOT_FOUND: {
        code: 'USER_AUTH_TOKEN_NOT_FOUND',
        message: 'User auth token not found',
        display_messages: [
            {
                lang: 'en',
                value: '',
            },
            {
                lang: 'fr',
                value: '',
            },
        ],
    },
    USER_AUTH_TOKEN_INVALID: {
        code: 'USER_AUTH_TOKEN_INVALID',
        message: 'User auth token invalid',
        display_messages: [
            {
                lang: 'en',
                value: '',
            },
            {
                lang: 'fr',
                value: '',
            },
        ],
    },
    USERNAME_ALREADY_EXISTS: {
        code: 'USERNAME_ALREADY_EXISTS',
        message: 'User name already exists',
        display_messages: [
            {
                lang: 'en',
                value: '',
            },
            {
                lang: 'fr',
                value: '',
            },
        ],
    },
};
