import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IDisplayText, OIDictionary } from '../../../main/types/types';
import { PaginationResponseDto } from '../../../main/apiutils/pagination';
import { Operation } from '../entities/operation.schema';
import {
    AssetMetadataResponseDto,
    AssetResponseDto,
} from '../../assets/dto/assets.responses.dto';

export class OperationsCollectionsResponseDto {
    @ApiProperty({
        description: 'Operations collections list',
        required: false,
        additionalProperties: {
            type: 'array',
            items: { $ref: getSchemaPath(IDisplayText) },
        },
    })
    collections: OIDictionary;
}

export class OperationsTypesResponseDto {
    @ApiProperty({
        description: 'Operations Types',
        required: false,
        additionalProperties: {
            type: 'array',
            items: { $ref: getSchemaPath(IDisplayText) },
        },
    })
    operations_types: OIDictionary;
}

export class TransactionsTypesResponseDto {
    @ApiProperty({
        description: 'Operations Transactions types',
        required: false,
        additionalProperties: {
            type: 'array',
            items: { $ref: getSchemaPath(IDisplayText) },
        },
    })
    transactions_types: OIDictionary;
}

export class OperationsListResponseDto {
    @ApiProperty({ type: PaginationResponseDto })
    pagination: PaginationResponseDto;
    @ApiProperty({ type: [Operation] })
    operations: Operation[];
}

export class OperationDetailsResponseDto {
    @ApiProperty({ type: Operation })
    operation: Operation;
    @ApiProperty({ type: AssetResponseDto })
    asset: AssetResponseDto;
    @ApiProperty({
        type: 'array',
        items: {
            type: 'array',
            items: { $ref: getSchemaPath(AssetMetadataResponseDto) },
        },
        description: 'Asset Metadata Changes for this operation',
    })
    metadataListEvolutions: AssetMetadataResponseDto[][];
}
