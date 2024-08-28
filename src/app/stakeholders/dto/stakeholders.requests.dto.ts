import { PaginationPayloadDto } from '../../../main/apiutils/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
    OperationType,
    TransactionType,
} from '../../operations/entities/operation.schema';
import { OperationSortEnum } from '../../operations/dto/operations.request.dto';

export enum StakeholdersSortEnum {
    DateAsc = 'date_asc',
    DateDesc = 'date_desc',
    NbTxAsc = 'nb_tx_asc',
    NbTxDesc = 'nb_tx_desc',
}

export class StakeholdersListRequestDto extends PaginationPayloadDto {
    @ApiProperty({
        description: 'Filter stakeholders by NFT collection',
        required: false,
    })
    @IsOptional()
    @IsString()
    collection?: string;

    @ApiProperty({
        description: 'Stakeholders list sorted by',
        default: StakeholdersSortEnum.DateDesc,
        required: false,
        enum: Object.values(StakeholdersSortEnum),
    })
    @IsOptional()
    @IsEnum(StakeholdersSortEnum)
    sort?: StakeholdersSortEnum = StakeholdersSortEnum.DateDesc;

    @ApiProperty({
        description: 'Stakeholders list search query',
        required: false,
    })
    @IsOptional()
    @IsString()
    search?: string;
}

export class StakeholderDetailsRequestDto {
    @ApiProperty({
        description: 'Stakeholder address',
        required: true,
    })
    @IsString()
    address: string;
}

export class StakeholderDetailsCollectionRequestDto {
    @ApiProperty({
        description: 'Focused collection',
        required: false,
    })
    @IsOptional()
    @IsString()
    collection?: string;
}

export class StakeholderOperationsListRequestDto extends PaginationPayloadDto {
    @ApiProperty({
        description: 'Focused collection',
        required: false,
    })
    @IsOptional()
    @IsString()
    collection?: string;

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
