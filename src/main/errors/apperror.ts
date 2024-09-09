import { IDisplayText } from '../types/types';
import { ApiProperty } from '@nestjs/swagger';

export class IAppError {
    @ApiProperty()
    code: string;
    @ApiProperty()
    message: string;
    @ApiProperty({ required: false, type: [IDisplayText] })
    display_messages?: Array<IDisplayText>;
    @ApiProperty({ required: false })
    details?: any | null | undefined;
    @ApiProperty({ required: false })
    status_code?: number | null;
    @ApiProperty({ required: false })
    url?: string | null;
}

export class IAppErrorDto {
    @ApiProperty({ type: IAppError })
    error: IAppError;
}

export interface IAppErrorDictionary {
    [key: string]: IAppError;
}

export function isAppErrorObject(o: object): boolean {
    return o && 'code' in o && 'message' in o;
}
