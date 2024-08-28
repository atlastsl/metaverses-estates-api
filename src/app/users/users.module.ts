import { Logger, Module } from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { UsersController } from './controllers/users.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './providers/auth.guard';
import { HelpersModule } from '../../helpers/helpers.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.schema';
import { DATABASE_CONNECTION_USERS } from '../../main/databases/databases';
import { AuthService } from './providers/auth.service';
import { AuthController } from './controllers/auth.controller';

@Module({
    imports: [
        MongooseModule.forFeature(
            [{ name: User.name, schema: UserSchema }],
            DATABASE_CONNECTION_USERS,
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
    ],
    controllers: [UsersController, AuthController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        Logger,
        UsersService,
        AuthService,
    ],
    exports: [],
})
export class UsersModule {}
