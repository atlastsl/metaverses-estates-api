import { Injectable } from '@nestjs/common';
import { hashSync, compareSync, genSaltSync } from 'bcrypt-nodejs';
import * as randomstring from 'randomstring';

@Injectable()
export class PasswordHelperService {
    constructor() {}

    encrypt(plain: string): string {
        return hashSync(plain, genSaltSync(8));
    }

    compare(entered: string, encrypted: string): boolean {
        return entered.length > 0 && compareSync(entered, encrypted);
    }

    newPassword(): { clear: string; encrypted: string } {
        const clear: string = randomstring.generate({
            length: 12,
            charset: 'alphanumeric',
            readable: false,
        });
        const encrypted = this.encrypt(clear);
        return { clear, encrypted };
    }
}
