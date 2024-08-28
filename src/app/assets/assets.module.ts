import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_METAVERSES } from '../../main/databases/databases';
import { HelpersModule } from '../../helpers/helpers.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../users/providers/auth.guard';
import { AssetsController } from './controllers/assets.controller';
import { AssetsMetadataUtilsService } from './providers/assetsmetadata.utils.service';
import { AssetsUtilsService } from './providers/assets.utils.service';
import { Asset, AssetSchema } from './entities/asset.schema';
import {
    AssetMetadata,
    AssetMetadataSchema,
} from './entities/assetmetadata.schema';
import { MapMacro, MapMacroSchema } from './entities/mapmacro.schema';
import { OperationsModule } from '../operations/operations.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AssetsRequestsService } from './providers/assets.requests.service';

@Module({
    imports: [
        MongooseModule.forFeature(
            [{ name: Asset.name, schema: AssetSchema }],
            DATABASE_CONNECTION_METAVERSES,
        ),
        MongooseModule.forFeature(
            [{ name: AssetMetadata.name, schema: AssetMetadataSchema }],
            DATABASE_CONNECTION_METAVERSES,
        ),
        MongooseModule.forFeature(
            [{ name: MapMacro.name, schema: MapMacroSchema }],
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
        forwardRef(() => OperationsModule),
    ],
    controllers: [AssetsController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        AssetsMetadataUtilsService,
        AssetsUtilsService,
        AssetsRequestsService,
    ],
    exports: [AssetsMetadataUtilsService, AssetsUtilsService],
})
export class AssetsModule {}
