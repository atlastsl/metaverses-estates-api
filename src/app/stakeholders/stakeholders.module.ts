import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    Operation,
    OperationSchema,
} from '../operations/entities/operation.schema';
import { DATABASE_CONNECTION_METAVERSES } from '../../main/databases/databases';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HelpersModule } from '../../helpers/helpers.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../users/providers/auth.guard';
import { OperationsModule } from '../operations/operations.module';
import { StakeholdersController } from './controllers/stakeholders.controller';
import { StakeholdersUtilsService } from './providers/stakeholders.utils.service';
import { StakeholdersRequestService } from './providers/stakeholders.request.service';

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
        OperationsModule,
    ],
    controllers: [StakeholdersController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        StakeholdersUtilsService,
        StakeholdersRequestService,
    ],
    exports: [],
})
export class StakeholdersModule {}
