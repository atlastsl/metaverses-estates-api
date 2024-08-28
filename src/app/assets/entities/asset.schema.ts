import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export enum AssetTokenStandardEnum {
    ERC721 = 'erc721',
}

export enum AssetTypeEnum {
    Land = 'land',
    Estate = 'estate',
    District = 'district',
}

@Schema({ _id: false })
export class AssetUrl {
    @ApiProperty()
    @Prop({ required: true })
    name: string;
    @ApiProperty()
    @Prop({ required: true })
    url: string;
}

@Schema({ collection: 'assets' })
export class Asset {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    _id: mongoose.Types.ObjectId;

    @Prop({ required: true })
    asset_id: string;

    @Prop({ required: true })
    collection: string;

    @Prop({ required: true })
    contract: string;

    @Prop({ required: true, enum: AssetTokenStandardEnum })
    token_standard: AssetTokenStandardEnum;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, enum: AssetTypeEnum })
    type: AssetTypeEnum;

    @Prop({ type: Number })
    x: number;

    @Prop({ type: Number })
    y: number;

    @Prop({ type: [AssetUrl] })
    urls: AssetUrl[];
}

export const AssetSchema = SchemaFactory.createForClass(Asset);
