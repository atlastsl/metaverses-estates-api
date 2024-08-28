import * as shortid from 'shortid';

export class IdsHelperService {
    constructor() {}

    newShortId(): string {
        return shortid.generate();
    }
}
