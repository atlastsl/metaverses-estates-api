import {
    ArgumentsHost,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { IAppError, isAppErrorObject } from './apperror';

export class AppErrorsHandler implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
    catch(exception: unknown, host: ArgumentsHost) {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const httpStatusCode =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;
        const url = httpAdapter.getRequestUrl(ctx.getRequest());
        const cause =
            exception instanceof HttpException ? exception.cause : exception;
        const errorRaw =
            exception instanceof HttpException
                ? exception.getResponse()
                : exception;
        if (!(exception instanceof HttpException)) {
            console.error(exception);
        }
        const responseBody = this.buildErrorPayload(
            errorRaw,
            httpStatusCode,
            url,
            cause,
        );
        const errResponse = { error: responseBody };
        httpAdapter.reply(ctx.getResponse(), errResponse, httpStatusCode);
    }

    buildErrorPayload(
        response: unknown,
        httpStatusCode: number,
        url: string,
        cause: unknown,
    ): IAppError {
        if (typeof response === 'string') {
            return {
                details: {
                    cause,
                },
                display_messages: [
                    {
                        lang: 'en',
                        value: response as string,
                    },
                    {
                        lang: 'fr',
                        value: response as string,
                    },
                ],
                message: response as string,
                status_code: httpStatusCode,
                url: url,
                code: Object.keys(HttpStatus).find(
                    (x) => HttpStatus[x] === httpStatusCode,
                ),
            };
        } else if (typeof response === 'object') {
            if (isAppErrorObject(response as object)) {
                const iResponse = response as IAppError;
                return {
                    details: {
                        cause,
                    },
                    display_messages: iResponse.display_messages || [
                        {
                            lang: 'en',
                            value: iResponse.message,
                        },
                        {
                            lang: 'fr',
                            value: iResponse.message,
                        },
                    ],
                    message: iResponse.message,
                    status_code: httpStatusCode,
                    url: url,
                    code: iResponse.code,
                };
            } else {
                const oResponse = response as object;
                const message =
                    oResponse['message'] ||
                    cause?.['message'] ||
                    'An error occurred!';
                return {
                    details: {
                        cause,
                    },
                    display_messages: [
                        {
                            lang: 'en',
                            value: message,
                        },
                        {
                            lang: 'fr',
                            value: message,
                        },
                    ],
                    message: message,
                    status_code: httpStatusCode,
                    url: url,
                    code: Object.keys(HttpStatus).find(
                        (x) => HttpStatus[x] === httpStatusCode,
                    ),
                };
            }
        } else {
            const message = (cause?.['message'] ||
                'An error occurred!') as string;
            return {
                details: {
                    cause,
                },
                display_messages: [
                    {
                        lang: 'en',
                        value: message,
                    },
                    {
                        lang: 'fr',
                        value: message,
                    },
                ],
                message: message,
                status_code: httpStatusCode,
                url: url,
                code: Object.keys(HttpStatus).find(
                    (x) => HttpStatus[x] === httpStatusCode,
                ),
            };
        }
    }
}
