import { PaginationPayloadDto } from '../../../main/apiutils/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { OperationType, TransactionType } from '../entities/operation.schema';

export enum OperationSortEnum {
    DateAsc = 'date_asc',
    DateDesc = 'date_desc',
}

export class AssetOperationsListRequestDto extends PaginationPayloadDto {
    @ApiProperty({
        description: 'Operations history sorted by',
        default: OperationSortEnum.DateDesc,
        required: false,
        enum: Object.values(OperationSortEnum),
    })
    @IsOptional()
    @IsEnum(OperationSortEnum)
    sort?: OperationSortEnum = OperationSortEnum.DateDesc;

    @ApiProperty({
        description: 'Filter operations by operation type',
        required: false,
        enum: Object.values(OperationType),
    })
    @IsOptional()
    @IsEnum(OperationType)
    operation_type?: OperationType;

    @ApiProperty({
        description: 'Filter operations by transaction type',
        required: false,
        enum: Object.values(TransactionType),
    })
    @IsOptional()
    @IsEnum(TransactionType)
    transaction_type?: TransactionType;
}

export class OperationsListRequestDto extends AssetOperationsListRequestDto {
    @ApiProperty({
        description: 'Filter operations by NFT collection',
        required: false,
    })
    @IsOptional()
    @IsString()
    collection?: string;

    @ApiProperty({
        description: 'Operations history search input query',
        required: false,
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        description: 'Filter by operation date, Max value',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    date_max?: string;

    @ApiProperty({
        description: 'Filter by operation date, Min value',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    date_min?: string;
}

export class AssetOperationsListAssetRequestDto {
    @ApiProperty({
        description: 'Asset Id',
        required: true,
    })
    @IsMongoId()
    asset_id: string;
}

export class AssetOperationDetailsRequestDto {
    @ApiProperty({
        description: 'Operation Id',
        required: true,
    })
    @IsMongoId()
    operation_id: string;
}
