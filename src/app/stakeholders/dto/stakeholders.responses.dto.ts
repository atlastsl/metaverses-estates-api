import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from '../../../main/apiutils/pagination';

export class StakeholderDto {
    @ApiProperty({
        description: 'Stakeholder associated NFT collections',
        type: [String],
    })
    collections: string[];
    @ApiProperty({ description: 'Stakeholder Address' })
    address: string;
    @ApiProperty({ description: 'Stakeholder first operation date' })
    first_operation_date: Date;
    @ApiProperty({ description: 'Stakeholder last operation date' })
    last_operation_date: Date;
    @ApiProperty({ description: 'Stakeholder Nb operations' })
    nb_operations: number;
}

export class StakeholdersListResponseDto {
    @ApiProperty({ type: PaginationResponseDto })
    pagination: PaginationResponseDto;
    @ApiProperty({ type: [StakeholderDto] })
    stakeholders: StakeholderDto[];
}

export class StakeholdersDetailsResponseDto {
    @ApiProperty({ type: StakeholderDto })
    stakeholder: StakeholderDto;
}
