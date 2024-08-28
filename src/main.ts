import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InitializeLoggerInstance } from './main/logger/logger.instance';
import { WinstonModule } from 'nest-winston';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLauncher } from './app.launcher';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: WinstonModule.createLogger({
            instance: InitializeLoggerInstance(),
        }),
    });

    const configService = app.get(ConfigService);
    const loggerService = app.get(Logger);

    const appConfig = new AppLauncher(app, configService, loggerService);
    appConfig.setup();

    await appConfig.launchApp();
}
bootstrap();
