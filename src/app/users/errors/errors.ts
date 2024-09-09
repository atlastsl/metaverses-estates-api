import { IAppErrorDictionary } from '../../../main/errors/apperror';

export const UserErrors: IAppErrorDictionary = {
    USER_NOT_FOUND: {
        message: 'User Not Found',
        code: 'USER_NOT_FOUND',
        display_messages: [
            {
                lang: 'en',
                value: 'User account does not exist. Please contact an administrator.',
            },
            {
                lang: 'fr',
                value: 'Compte utilisateur inexistant. Veuillez contacter un administrateur.',
            },
        ],
    },
    USER_ACCOUNT_SUSPENDED: {
        code: 'USER_ACCOUNT_SUSPENDED',
        message: 'User Account Suspended',
        display_messages: [
            {
                lang: 'en',
                value: 'User account suspended. Please contact an administrator.',
            },
            {
                lang: 'fr',
                value: 'Compte utilisateur suspendu. Veuillez contacter un administrateur.',
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
                value: 'You are not authorized to perform this operation.',
            },
            {
                lang: 'fr',
                value: "Vous n'êtes pas autorisé à effectuer cette opération.",
            },
        ],
    },
    USER_PASSWORD_INCORRECT: {
        code: 'USER_PASSWORD_INCORRECT',
        message: 'User password incorrect',
        display_messages: [
            {
                lang: 'en',
                value: 'Incorrect password.',
            },
            {
                lang: 'fr',
                value: 'Mot de passe incorrect.',
            },
        ],
    },
    USER_AUTH_TOKEN_NOT_FOUND: {
        code: 'USER_AUTH_TOKEN_NOT_FOUND',
        message: 'User auth token not found',
        display_messages: [
            {
                lang: 'en',
                value: 'Invalid login session. Please log in again.',
            },
            {
                lang: 'fr',
                value: 'Session de connexion invalide. Veuillez vous reconnecter.',
            },
        ],
    },
    USER_AUTH_TOKEN_INVALID: {
        code: 'USER_AUTH_TOKEN_INVALID',
        message: 'User auth token invalid',
        display_messages: [
            {
                lang: 'en',
                value: 'Invalid login session. Please log in again.',
            },
            {
                lang: 'fr',
                value: 'Session de connexion invalide. Veuillez vous reconnecter.',
            },
        ],
    },
    USERNAME_ALREADY_EXISTS: {
        code: 'USERNAME_ALREADY_EXISTS',
        message: 'User name already exists',
        display_messages: [
            {
                lang: 'en',
                value: 'Username already associated with something else. Please choose another one.',
            },
            {
                lang: 'fr',
                value: "Nom d'utilisateur déjà associé à un autre chose. Veuillez choisir un autre.",
            },
        ],
    },
};
