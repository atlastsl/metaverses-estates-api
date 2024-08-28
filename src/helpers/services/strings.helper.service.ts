import { Injectable } from '@nestjs/common';

@Injectable()
export class StringsHelperService {
    constructor() {}

    private escapeRegExp(str: string): string {
        // $& means the whole matched string
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    replaceAll(
        str: string,
        match: string,
        replacement: string | undefined | null,
    ): string {
        return str.replace(new RegExp(this.escapeRegExp(match), 'g'), () =>
            this.trimToEmpty(replacement),
        );
    }

    trimToEmpty(_str: string | undefined | null): string {
        let str = _str;
        if (str == null) str = '';
        while (
            str.endsWith(' ') ||
            str.endsWith('\n') ||
            str.endsWith('\r') ||
            str.endsWith('\t')
        ) {
            str = str.substring(0, str.length - 1);
        }
        while (
            str.startsWith(' ') ||
            str.startsWith('\n') ||
            str.startsWith('\r') ||
            str.startsWith('\t')
        ) {
            str = str.substring(1);
        }
        return str;
    }

    isStrEmpty(_str: string | undefined | null): boolean {
        return this.trimToEmpty(_str) === '';
    }

    normalizeNFD(str: string): string {
        return str == null
            ? ''
            : str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
}
