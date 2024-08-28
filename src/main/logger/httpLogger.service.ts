import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StringsHelperService } from '../../helpers/services/strings.helper.service';
import onFinished from 'on-finished';
import onHeaders from 'on-headers';
import * as process from 'process';
import { ServerResponse } from 'http';

@Injectable()
export default class HttpLoggerService implements NestMiddleware {
    private static TOKENS: { [key: string]: string } = {
        CALLER: '@caller',
        REMOTE_ADDRESS: '@remote_address',
        IP_ADDRESS: '@ip_address',
        DATE: '@date',
        METHOD: '@method',
        URL: '@url',
        HTTP_VERSION: '@http_version',
        RES_STATUS: '@res_status',
        RES_TIME: '@res_time',
        REFERRER: '@referrer',
        USER_AGENT: '@usr_agent',
    };
    private static FORMATS: { [key: string]: string } = {
        DEFAULT:
            `(HTTP REQUEST) - ${HttpLoggerService.TOKENS.IP_ADDRESS} [${HttpLoggerService.TOKENS.CALLER}] - ` +
            `${HttpLoggerService.TOKENS.DATE} - [${HttpLoggerService.TOKENS.METHOD} ${HttpLoggerService.TOKENS.URL} ` +
            `HTTP/${HttpLoggerService.TOKENS.HTTP_VERSION}] ${HttpLoggerService.TOKENS.RES_STATUS} ` +
            `${HttpLoggerService.TOKENS.RES_TIME} ms - "${HttpLoggerService.TOKENS.USER_AGENT}"`,
    };
    private static MONTHS: Array<string> = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    constructor(
        private readonly logger: Logger,
        private readonly config: ConfigService,
        private readonly stringsHelperService: StringsHelperService,
    ) {}

    __clfDate(dateTime: Date): string {
        const date = dateTime.getUTCDate(),
            hours = dateTime.getUTCHours();
        const minutes = dateTime.getUTCMinutes(),
            seconds = dateTime.getUTCSeconds();
        const year = dateTime.getUTCFullYear(),
            month = HttpLoggerService.MONTHS[dateTime.getUTCMonth()];
        const milliseconds = dateTime.getUTCMilliseconds();
        return (
            date.toString(10).padStart(2, '0') +
            '/' +
            month +
            '/' +
            year +
            ' ' +
            hours.toString(10).padStart(2, '0') +
            ':' +
            minutes.toString(10).padStart(2, '0') +
            ':' +
            seconds.toString(10).padStart(2, '0') +
            ':' +
            milliseconds.toString(10).padStart(3, '0')
        );
    }

    __headersSent(res: any): boolean {
        return typeof res.headersSent !== 'boolean'
            ? Boolean(res._header)
            : res.headersSent;
    }

    __recordStartTime(this: ServerResponse | any): void {
        this._startAt = process.hrtime();
        this._startTime = new Date();
    }

    user(req: any): string {
        return (
            `User ${req?.['user']?.['user_id']} (${req?.['user']?.['username']})` ||
            '%Public%'
        );
    }

    remoteAddress(req: any): string | undefined {
        return (
            req.ip ||
            (req.connection && req.connection.remoteAddress) ||
            undefined
        );
    }

    ipAddress(req: any): string | undefined {
        return req['ipAddress'];
    }

    requestDate(req: any, format: string | undefined): string {
        const date = new Date();
        switch (format || 'clf') {
            case 'clf':
                return this.__clfDate(date);
            case 'iso':
                return date.toISOString();
            default:
                return date.toUTCString();
        }
    }

    requestMethod(req: any): string {
        return req.method;
    }

    url(req: any): string {
        return req.originalUrl || req.url;
    }

    httpVersion(req: any): string {
        return req.httpVersionMajor + '.' + req.httpVersionMinor;
    }

    resStatus(req: any, res: any): string | undefined {
        return this.__headersSent(res) ? String(res.statusCode) : undefined;
    }

    resTime(req: any, res: any): string | undefined {
        if (!req._startAt || !res._startAt) {
            return;
        }
        const ms =
            (res._startAt[0] - req._startAt[0]) * 1e3 +
            (res._startAt[1] - req._startAt[1]) * 1e-6;
        return ms.toFixed(3);
    }

    referrer(req: any): string | undefined {
        return req.headers['referer'] || req.headers['referrer'];
    }

    userAgent(req: any): string | undefined {
        return req.headers['user-agent'];
    }

    __formatLogLine(req: any, res: any, format: string): string {
        let line =
            HttpLoggerService.FORMATS[format] ||
            HttpLoggerService.FORMATS.DEFAULT;
        for (const token of Object.keys(HttpLoggerService.TOKENS)) {
            switch (token) {
                case 'CALLER':
                    line = this.stringsHelperService.replaceAll(
                        line,
                        HttpLoggerService.TOKENS.CALLER,
                        this.user(req),
                    );
                    break;
                case 'REMOTE_ADDRESS':
                    line = this.stringsHelperService.replaceAll(
                        line,
                        HttpLoggerService.TOKENS.REMOTE_ADDRESS,
                        this.remoteAddress(req),
                    );
                    break;
                case 'IP_ADDRESS':
                    line = this.stringsHelperService.replaceAll(
                        line,
                        HttpLoggerService.TOKENS.IP_ADDRESS,
                        this.ipAddress(req),
                    );
                    break;
                case 'DATE':
                    line = this.stringsHelperService.replaceAll(
                        line,
                        HttpLoggerService.TOKENS.DATE,
                        this.requestDate(req, 'clf'),
                    );
                    break;
                case 'METHOD':
                    line = this.stringsHelperService.replaceAll(
                        line,
                        HttpLoggerService.TOKENS.METHOD,
                        this.requestMethod(req),
                    );
                    break;
                case 'URL':
                    line = this.stringsHelperService.replaceAll(
                        line,
                        HttpLoggerService.TOKENS.URL,
                        this.url(req),
                    );
                    break;
                case 'HTTP_VERSION':
                    line = this.stringsHelperService.replaceAll(
                        line,
                        HttpLoggerService.TOKENS.HTTP_VERSION,
                        this.httpVersion(req),
                    );
                    break;
                case 'RES_STATUS':
                    line = this.stringsHelperService.replaceAll(
                        line,
                        HttpLoggerService.TOKENS.RES_STATUS,
                        this.resStatus(req, res),
                    );
                    break;
                case 'RES_TIME':
                    line = this.stringsHelperService.replaceAll(
                        line,
                        HttpLoggerService.TOKENS.RES_TIME,
                        this.resTime(req, res),
                    );
                    break;
                case 'REFERRER':
                    line = this.stringsHelperService.replaceAll(
                        line,
                        HttpLoggerService.TOKENS.REFERRER,
                        this.referrer(req),
                    );
                    break;
                case 'USER_AGENT':
                    line = this.stringsHelperService.replaceAll(
                        line,
                        HttpLoggerService.TOKENS.USER_AGENT,
                        this.userAgent(req),
                    );
                    break;
            }
        }
        return line;
    }

    logRequest(print: boolean, req: any, res: any, fmt: string): void {
        if (!print) {
            return;
        }
        const line = this.__formatLogLine(req, res, fmt);
        if (!line) {
            return;
        }
        this.logger.log(line);
    }

    httpLogger(
        format: string | undefined | null,
        options: any,
    ): (req: any, res: any, next: (e?: any) => any) => any {
        let fmt: string = format || 'default';
        let opts = options || {};
        if (format && typeof format === 'object') {
            opts = format;
            fmt = opts.format || 'default';
        }
        if (
            !fmt ||
            !Object.keys(HttpLoggerService.FORMATS).includes(fmt.toUpperCase())
        ) {
            fmt = 'default';
        }
        fmt = fmt.toUpperCase();
        const immediate = opts.immediate || false;
        const print = opts.print || true;

        return (req, res, next) => {
            const startTime = process.hrtime();
            const startDate = new Date();
            req._startAt = startTime;
            req._startTime = startDate;
            res._startAt = undefined;
            res._startTime = undefined;
            if (immediate) {
                this.logRequest(print, req, res, fmt);
            } else {
                const endTime = process.hrtime();
                const endDate = new Date();
                res._startAt = endTime;
                res._startTime = endDate;
                onHeaders(res, this.__recordStartTime);
                onFinished(res, () => {
                    this.logRequest(print, req, res, fmt);
                });
            }
            next();
        };
    }

    use(req: any, res: any, next: (error?: any) => void): any {
        this.httpLogger('default', {})(req, res, next);
    }
}
