import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Query,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { IAppError } from '../../../main/errors/apperror';
import { StakeholdersRequestService } from '../providers/stakeholders.request.service';
import {
    StakeholdersListRequestDto,
    StakeholderDetailsRequestDto,
    StakeholderDetailsCollectionRequestDto,
    StakeholderOperationsListRequestDto,
} from '../dto/stakeholders.requests.dto';
import {
    StakeholdersListResponseDto,
    StakeholdersDetailsResponseDto,
} from '../dto/stakeholders.responses.dto';
import { OperationsListResponseDto } from '../../operations/dto/operations.responses.dto';

@ApiTags('Stakeholders')
@ApiResponse({
    status: '4XX',
    type: IAppError,
})
@ApiResponse({
    status: '5XX',
    type: IAppError,
})
@ApiBearerAuth()
@Controller('stakeholders')
export class StakeholdersController {
    constructor(
        private readonly stakeholdersRequestService: StakeholdersRequestService,
    ) {}

    @ApiOkResponse({
        type: StakeholdersListResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get('')
    async stakeholdersList(
        @Query() payload: StakeholdersListRequestDto,
    ): Promise<StakeholdersListResponseDto> {
        return await this.stakeholdersRequestService.listStakeholders(payload);
    }

    @ApiOkResponse({
        type: StakeholdersDetailsResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get(':address')
    async stakeholdersDetails(
        @Param() payload: StakeholderDetailsRequestDto,
        @Query() qPayload: StakeholderDetailsCollectionRequestDto,
    ): Promise<StakeholdersDetailsResponseDto> {
        return await this.stakeholdersRequestService.detailsStakeHolders(
            payload,
            qPayload,
        );
    }

    @ApiOkResponse({
        type: OperationsListResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get(':address/operations')
    async stakeholdersOperations(
        @Param() payload: StakeholderDetailsRequestDto,
        @Query() qPayload: StakeholderOperationsListRequestDto,
    ): Promise<OperationsListResponseDto> {
        return await this.stakeholdersRequestService.stakeholderHistory(
            payload,
            qPayload,
        );
    }
}
