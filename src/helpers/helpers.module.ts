import { Module } from '@nestjs/common';
import { StringsHelperService } from './services/strings.helper.service';
import { PasswordHelperService } from './services/password.helper.service';
import { IdsHelperService } from './services/ids.helper.service';

@Module({
    providers: [StringsHelperService, PasswordHelperService, IdsHelperService],
    exports: [StringsHelperService, PasswordHelperService, IdsHelperService],
})
export class HelpersModule {}
