import { Logger, Module } from '@nestjs/common';
import HttpLoggerService from './httpLogger.service';
import { HelpersModule } from '../../helpers/helpers.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [HelpersModule, ConfigModule],
    providers: [HttpLoggerService, Logger],
    exports: [HttpLoggerService],
})
export class AppLoggerModule {}
