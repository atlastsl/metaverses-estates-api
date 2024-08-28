import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HelpersModule } from './helpers/helpers.module';
import { AppLoggerModule } from './main/logger/app.logger.module';
import { UsersModule } from './app/users/users.module';
import HttpLoggerService from './main/logger/httpLogger.service';
import {
    DATABASE_CONNECTION_METAVERSES,
    DATABASE_CONNECTION_USERS,
} from './main/databases/databases';
import { log } from 'winston';
import { AssetsModule } from './app/assets/assets.module';
import { OperationsModule } from './app/operations/operations.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get('APP_DATABASE_URL'),
            }),
            inject: [ConfigService],
            connectionName: DATABASE_CONNECTION_USERS,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get('METAVERSE_DATABASE_URL'),
            }),
            inject: [ConfigService],
            connectionName: DATABASE_CONNECTION_METAVERSES,
        }),
        HelpersModule,
        AppLoggerModule,
        UsersModule,
        AssetsModule,
        OperationsModule,
    ],
    providers: [Logger],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(HttpLoggerService).forRoutes('*');
    }
}
