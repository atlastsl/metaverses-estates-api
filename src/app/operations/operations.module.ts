import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_METAVERSES } from '../../main/databases/databases';
import { HelpersModule } from '../../helpers/helpers.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../users/providers/auth.guard';
import { Operation, OperationSchema } from './entities/operation.schema';
import { AssetsModule } from '../assets/assets.module';
import { OperationsController } from './controllers/operations.controller';
import { OperationsUtilsService } from './providers/operations.utils.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OperationsRequestService } from './providers/operations.request.service';

@Module({
    imports: [
        MongooseModule.forFeature(
            [{ name: Operation.name, schema: OperationSchema }],
            DATABASE_CONNECTION_METAVERSES,
        ),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_AUTH_SECRET'),
                global: true,
                signOptions: {
                    expiresIn: `${configService.get('JWT_AUTH_TIMELIVE')}s`,
                },
            }),
            inject: [ConfigService],
        }),
        HelpersModule,
        forwardRef(() => AssetsModule),
    ],
    controllers: [OperationsController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        OperationsUtilsService,
        OperationsRequestService,
    ],
    exports: [OperationsUtilsService],
})
export class OperationsModule {}
