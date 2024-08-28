import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Operation } from '../../operations/entities/operation.schema';
import { DATABASE_CONNECTION_METAVERSES } from '../../../main/databases/databases';
import { Model } from 'mongoose';
import { OperationsUtilsService } from '../../operations/providers/operations.utils.service';
import { StakeholdersUtilsService } from './stakeholders.utils.service';
import {
    StakeholdersDetailsResponseDto,
    StakeholdersListResponseDto,
} from '../dto/stakeholders.responses.dto';
import {
    StakeholderDetailsCollectionRequestDto,
    StakeholderDetailsRequestDto,
    StakeholderOperationsListRequestDto,
    StakeholdersListRequestDto,
} from '../dto/stakeholders.requests.dto';
import { OperationsListResponseDto } from '../../operations/dto/operations.responses.dto';
import { PaginationResponseDto } from '../../../main/apiutils/pagination';

@Injectable()
export class StakeholdersRequestService {
    constructor(
        @InjectModel(Operation.name, DATABASE_CONNECTION_METAVERSES)
        private readonly operationsModel: Model<Operation>,
        private readonly operationsUtilsService: OperationsUtilsService,
        private readonly stakeholdersUtilsService: StakeholdersUtilsService,
    ) {}

    async listStakeholders(
        payload: StakeholdersListRequestDto,
    ): Promise<StakeholdersListResponseDto> {
        const { total, stakeholders } =
            await this.stakeholdersUtilsService.listStakeholders(
                payload.sort,
                payload.page,
                payload.take,
                payload.collection,
                payload.search,
            );
        return {
            pagination: PaginationResponseDto.responseDto(payload, total),
            stakeholders,
        };
    }

    async detailsStakeHolders(
        payload: StakeholderDetailsRequestDto,
        qPayload: StakeholderDetailsCollectionRequestDto,
    ): Promise<StakeholdersDetailsResponseDto> {
        const stakeholder =
            await this.stakeholdersUtilsService.detailsStakeHolders(
                payload.address,
                qPayload.collection,
            );
        return {
            stakeholder,
        };
    }

    async stakeholderHistory(
        payload: StakeholderDetailsRequestDto,
        historyPayload: StakeholderOperationsListRequestDto,
    ): Promise<OperationsListResponseDto> {
        const { total, operations } =
            await this.operationsUtilsService.stakeHolderOperations(
                payload.address,
                historyPayload.sort,
                historyPayload.page,
                historyPayload.take,
                historyPayload.operation_type,
                historyPayload.transaction_type,
                historyPayload.collection,
            );
        return {
            pagination: PaginationResponseDto.responseDto(
                historyPayload,
                total,
            ),
            operations,
        };
    }
}
