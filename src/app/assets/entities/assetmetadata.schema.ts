import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export enum AssetMetadataCategoryEnum {
    Coordinates = 'coordinates',
    Size = 'size',
    Distance = 'distance',
    Owner = 'owner',
    Lands = 'lands',
}

export enum AssetMetadataDataTypeEnum {
    Integer = 'integer',
    Float = 'float',
    Boolean = 'bool',
    String = 'string',
    StringArray = 'string-array',
    Address = 'address',
}

export enum AssetMetadataMacroTypeEnum {
    Plaza = 'plaza',
    Road = 'road',
    District = 'district',
}

@Schema({ collection: 'asset_metadata' })
export class AssetMetadata {
    @Prop({ required: true })
    collection: string;

    @Prop({ required: true, ref: 'Asset' })
    asset: mongoose.Types.ObjectId;

    @Prop({ required: true })
    asset_contract: string;

    @Prop({ required: true })
    asset_name: string;

    @Prop({ required: true, enum: AssetMetadataCategoryEnum })
    category: AssetMetadataCategoryEnum;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    display_name: string;

    @Prop({
        required: true,
        enum: AssetMetadataDataTypeEnum,
    })
    data_type: AssetMetadataDataTypeEnum;

    @Prop({ required: true, type: Map, of: mongoose.Schema.Types.Mixed })
    data_type_params: Record<string, any>;

    @Prop({ required: true })
    value: string;

    @Prop({
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MapMacro',
    })
    macro: mongoose.Types.ObjectId;

    @Prop({ required: true, enum: AssetMetadataMacroTypeEnum })
    macro_type: AssetMetadataMacroTypeEnum;

    @Prop({ required: true })
    date: Date;

    @Prop({
        required: true,
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Operations',
    })
    operations: mongoose.Types.ObjectId[];
}

export const AssetMetadataSchema = SchemaFactory.createForClass(AssetMetadata);
