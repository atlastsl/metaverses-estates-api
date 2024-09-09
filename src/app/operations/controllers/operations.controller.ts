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
import { IAppErrorDto } from '../../../main/errors/apperror';
import { OperationsRequestService } from '../providers/operations.request.service';
import {
    OperationDetailsResponseDto,
    OperationsCollectionsResponseDto,
    OperationsListResponseDto,
    OperationsTypesResponseDto,
    TransactionsTypesResponseDto,
} from '../dto/operations.responses.dto';
import {
    AssetOperationDetailsRequestDto,
    OperationsListRequestDto,
} from '../dto/operations.request.dto';

@ApiTags('Operations')
@ApiResponse({
    status: '4XX',
    type: IAppErrorDto,
})
@ApiResponse({
    status: '5XX',
    type: IAppErrorDto,
})
@ApiBearerAuth()
@Controller('operations')
export class OperationsController {
    constructor(
        private readonly operationsRequestService: OperationsRequestService,
    ) {}

    @ApiOkResponse({
        type: OperationsCollectionsResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get('collections')
    async operationsCollections(): Promise<OperationsCollectionsResponseDto> {
        return await this.operationsRequestService.operationsCollections();
    }

    @ApiOkResponse({
        type: OperationsTypesResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get('collections/:collection/operations-types')
    async operationsTypes(
        @Param('collection') collection: string,
    ): Promise<OperationsTypesResponseDto> {
        return await this.operationsRequestService.operationsTypes(collection);
    }

    @ApiOkResponse({
        type: TransactionsTypesResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get('collections/:collection/transactions-types')
    async operationsTransactionTypes(
        @Param('collection') collection: string,
    ): Promise<TransactionsTypesResponseDto> {
        return await this.operationsRequestService.transactionsTypes(
            collection,
        );
    }

    @ApiOkResponse({
        type: OperationsListResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get('')
    async operationsHistory(
        @Query() payload: OperationsListRequestDto,
    ): Promise<OperationsListResponseDto> {
        return await this.operationsRequestService.operationsHistory(payload);
    }

    @ApiOkResponse({
        type: OperationDetailsResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get(':operation_id')
    async assetDetails(
        @Param() payload: AssetOperationDetailsRequestDto,
    ): Promise<OperationDetailsResponseDto> {
        return await this.operationsRequestService.operationDetails(payload);
    }
}
