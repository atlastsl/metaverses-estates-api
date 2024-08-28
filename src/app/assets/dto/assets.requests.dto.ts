import { PaginationPayloadDto } from '../../../main/apiutils/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { AssetTypeEnum } from '../entities/asset.schema';
import {
    AssetMetadataCategoryEnum,
    AssetMetadataMacroTypeEnum,
} from '../entities/assetmetadata.schema';

export enum AssetSortEnum {
    CreatedAt = 'created_at',
    UpdatedAt = 'updated_at',
    Name = 'name',
}

export class AssetsListRequestDto extends PaginationPayloadDto {
    @ApiProperty({
        description: 'List of assets sorted by',
        default: AssetSortEnum.UpdatedAt,
        required: false,
        enum: Object.values(AssetSortEnum),
    })
    @IsOptional()
    @IsEnum(AssetSortEnum)
    sort?: AssetSortEnum = AssetSortEnum.UpdatedAt;

    @ApiProperty({
        description: 'Filter assets by NFT collection',
        required: false,
    })
    @IsOptional()
    @IsString()
    collection?: string;

    @ApiProperty({
        description: 'Filter assets by NFT type',
        required: false,
        enum: Object.values(AssetTypeEnum),
    })
    @IsOptional()
    @IsString()
    @IsEnum(AssetTypeEnum)
    type?: AssetTypeEnum;

    @ApiProperty({
        description: 'Search input query',
        required: false,
    })
    @IsOptional()
    @IsString()
    search?: string;
}

export enum AssetMetadataSortEnum {
    DateAsc = 'date_asc',
    DateDesc = 'date_desc',
}

export class AssetMetadataHistoryQueryPayloadDto extends PaginationPayloadDto {
    @ApiProperty({
        description: 'Metadata category',
        required: true,
        enum: Object.values(AssetMetadataCategoryEnum),
    })
    @IsEnum(AssetMetadataCategoryEnum)
    metadata_category: AssetMetadataCategoryEnum;

    @ApiProperty({
        description: 'Metadata Macro Type',
        required: false,
        enum: Object.values(AssetMetadataMacroTypeEnum),
    })
    @IsOptional()
    @IsEnum(AssetMetadataMacroTypeEnum)
    metadata_macro_type?: AssetMetadataMacroTypeEnum;

    @ApiProperty({
        description: 'Metadata History sorted by',
        default: AssetMetadataSortEnum.DateDesc,
        required: false,
        enum: Object.values(AssetMetadataSortEnum),
    })
    @IsOptional()
    @IsEnum(AssetMetadataSortEnum)
    sort?: AssetMetadataSortEnum = AssetMetadataSortEnum.DateDesc;
}

export class AssetDetailsPayloadDto {
    @ApiProperty({
        description: 'Asset Id',
        required: true,
    })
    @IsMongoId()
    asset_id: string;
}

export class AssetMetadataHistoryAssetPayloadDto {

}
