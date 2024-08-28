import { ApiProperty } from '@nestjs/swagger';

export class IDisplayText {
    @ApiProperty({ required: true })
    lang: string;
    @ApiProperty({ required: true })
    value: string;
}

export class IDictionary {
    @ApiProperty({ required: true })
    name: string;
    @ApiProperty({ required: true, type: [IDisplayText] })
    displays: IDisplayText[];
}

export interface OIDictionary {
    [type: string]: IDisplayText[];
}
