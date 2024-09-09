import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
    Asset,
    AssetTokenStandardEnum,
    AssetTypeEnum,
    AssetUrl,
} from '../entities/asset.schema';
import {
    AssetMetadataCategoryEnum, AssetMetadataDataTypeEnum,
    AssetMetadataMacroTypeEnum,
} from '../entities/assetmetadata.schema';
import { IDisplayText, OIDictionary } from '../../../main/types/types';
import { PaginationResponseDto } from '../../../main/apiutils/pagination';

export class AssetMetadataResponseDto {
    @ApiProperty({
        description: 'Asset Metadata Category',
        required: true,
        enum: Object.values(AssetTokenStandardEnum),
    })
    category: AssetMetadataCategoryEnum;

    @ApiProperty({
        description: 'Asset Metadata related Macro type',
        required: false,
        enum: Object.values(AssetMetadataMacroTypeEnum),
    })
    macro_type?: AssetMetadataMacroTypeEnum;

    @ApiProperty({
        description: 'Asset Metadata Value data type',
        required: true,
        enum: Object.values(AssetMetadataDataTypeEnum),
    })
    data_type: AssetMetadataDataTypeEnum;

    @ApiProperty({
        description: 'Asset Metadata related Macro type Params',
        required: false,
        type: Object,
    })
    macro_type_params?: Record<string, any>;

    @ApiProperty({
        description: 'Asset Metadata related Macro name',
        required: false,
    })
    macro_name?: string;

    @ApiProperty({ description: 'Asset Metadata Value', required: true })
    value: string;

    @ApiProperty({ description: 'Asset Metadata Update date', required: false })
    date?: Date;

    @ApiProperty({
        description: 'Asset Metadata related Operation',
        required: false,
        type: [String],
    })
    operations?: string[];

    static parseAssetMetadata(
        assetMetadata: any,
        forAssetsList: boolean = false,
    ): AssetMetadataResponseDto {
        const responseDto = new AssetMetadataResponseDto();
        responseDto.category = assetMetadata.category;
        responseDto.macro_type = assetMetadata.macro_type;
        responseDto.macro_name = assetMetadata.macro?.name;
        responseDto.macro_type_params = assetMetadata.macro_type_params;
        responseDto.value = assetMetadata.value;
        responseDto.data_type = assetMetadata.data_type;
        if (!forAssetsList) {
            responseDto.date = assetMetadata.date;
            responseDto.operations = (assetMetadata.operations || []).map(
                (x: any): string => x.toString(),
            );
        }
        return responseDto;
    }

    sortNumber(): number {
        switch (this.category) {
            case AssetMetadataCategoryEnum.Distance:
                switch (this.macro_type) {
                    case AssetMetadataMacroTypeEnum.Road:
                        return 1;
                    case AssetMetadataMacroTypeEnum.Plaza:
                        return 2;
                    case AssetMetadataMacroTypeEnum.District:
                        return 3;
                    default:
                        return 0;
                }
            case AssetMetadataCategoryEnum.Size:
                return 4;
            case AssetMetadataCategoryEnum.Lands:
                return 5;
            case AssetMetadataCategoryEnum.Owner:
                return 6;
            case AssetMetadataCategoryEnum.Coordinates:
                return 7;
            default:
                return 0;
        }
    }
}

export class AssetResponseDto {
    @ApiProperty({ description: 'Asset unique ID', required: true })
    id: string;

    @ApiProperty({ description: 'Asset NFT collection', required: true })
    collection: string;

    @ApiProperty({ description: 'Asset NFT contract address', required: true })
    contract: string;

    @ApiProperty({ description: 'Asset NFT ID', required: true })
    asset_id: string;

    @ApiProperty({
        description: 'Asset NFT Type',
        required: true,
        enum: Object.values(AssetTypeEnum),
    })
    type: AssetTypeEnum;

    @ApiProperty({ description: 'Asset Name', required: true })
    name: string;

    @ApiProperty({ description: 'Asset Description', required: true })
    description: string;

    @ApiProperty({
        description: 'Asset Token Standard',
        required: true,
        enum: Object.values(AssetTokenStandardEnum),
    })
    token_standard: AssetTokenStandardEnum;

    @ApiProperty({ description: 'Asset Coordinates', required: false })
    coordinates?: string;

    @ApiProperty({ description: 'Asset Image URL', required: false })
    image_url?: string;

    @ApiProperty({
        description: 'Asset URLs',
        required: false,
        type: [AssetUrl],
    })
    urls?: AssetUrl[];

    @ApiProperty({ description: 'Asset first operation date', required: false })
    created_at?: Date;

    @ApiProperty({ description: 'Asset last operation date', required: false })
    updated_at?: Date;

    @ApiProperty({
        description: 'Asset actual metadata',
        required: false,
        type: [AssetMetadataResponseDto],
    })
    metadata?: AssetMetadataResponseDto[];

    static parseAsset(
        asset: Asset,
        createdAt?: Date,
        updatedAt?: Date,
        metadata?: AssetMetadataResponseDto[],
    ): AssetResponseDto {
        const responseDto = new AssetResponseDto();
        responseDto.id = asset._id.toString();
        responseDto.collection = asset.collection;
        responseDto.contract = asset.contract;
        responseDto.asset_id = asset.asset_id;
        responseDto.type = asset.type;
        responseDto.name = asset.name;
        responseDto.description = asset.description;
        responseDto.token_standard = asset.token_standard;
        if (asset.x || asset.y) {
            responseDto.coordinates = [asset.x, asset.y]
                .filter((x) => x != null)
                .map((x) => x.toString())
                .join(',');
        }
        responseDto.image_url = (asset.urls || []).find(
            (x) => x.name === 'Image URL',
        )?.url;
        responseDto.urls = (asset.urls || []).filter(
            (x) => x.name !== 'Image URL',
        );
        responseDto.created_at = createdAt;
        responseDto.updated_at = updatedAt;
        responseDto.metadata = metadata;
        return responseDto;
    }
}

export class AssetsCollectionsResponseDto {
    @ApiProperty({
        description: 'Assets collections list',
        required: false,
        type: 'object',
        additionalProperties: {
            type: 'array',
            items: { $ref: getSchemaPath(IDisplayText) },
        },
    })
    collections: OIDictionary;
}

export class AssetsTypesResponseDto {
    @ApiProperty({
        description: 'Assets types list',
        required: false,
        type: 'object',
        additionalProperties: {
            type: 'array',
            items: { $ref: getSchemaPath(IDisplayText) },
        },
    })
    assets_types: OIDictionary;
}

export class AssetsListResponseDto {
    @ApiProperty({ type: PaginationResponseDto })
    pagination: PaginationResponseDto;
    @ApiProperty({ type: [AssetResponseDto] })
    assets: AssetResponseDto[];
}

export class AssetDetailsResponseDto {
    @ApiProperty({ type: AssetResponseDto })
    asset: AssetResponseDto;
}

export class AssetsMetadataListResponseDto {
    @ApiProperty({ type: PaginationResponseDto })
    pagination: PaginationResponseDto;
    @ApiProperty({ type: [AssetMetadataResponseDto] })
    metadata_list: AssetMetadataResponseDto[];
}
