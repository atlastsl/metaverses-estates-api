import * as winston from 'winston';
import 'winston-daily-rotate-file';

export function InitializeLoggerInstance(): winston.Logger {
    const loggerLevel = 'debug';
    const { combine, timestamp, splat, colorize, printf } = winston.format;
    const customFormat = printf(({ level, message, timestamp, service }) => {
        return `${service} - ${level}, ${timestamp} : ${message}`;
    });

    const errFileTransport = new winston.transports.DailyRotateFile({
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '1d',
        level: 'error',
        filename: './logs/err_%DATE%.log',
        format: combine(timestamp(), customFormat),
    });
    const outFileTransport = new winston.transports.DailyRotateFile({
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '1d',
        filename: './logs/out_%DATE%.log',
        format: combine(timestamp(), customFormat),
    });

    return winston.createLogger({
        level: loggerLevel,
        defaultMeta: { service: 'Metaverses Estate API' },
        transports: [
            errFileTransport,
            outFileTransport,
            new winston.transports.Console({
                format: combine(
                    timestamp(),
                    splat(),
                    colorize({ all: true }),
                    customFormat,
                ),
            }),
        ],
    });
}
