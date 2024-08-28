import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ collection: 'map_macros' })
export class MapMacro {
    @Prop()
    collection: string;
    @Prop()
    contract: string;
    @ApiProperty()
    @Prop()
    type: string;
    @ApiProperty()
    @Prop()
    slug: string;
    @ApiProperty()
    @Prop()
    name: string;
    @Prop()
    macro_id: string;
}

export const MapMacroSchema = SchemaFactory.createForClass(MapMacro);
