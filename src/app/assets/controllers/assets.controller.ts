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
import { AssetsRequestsService } from '../providers/assets.requests.service';
import {
    AssetDetailsResponseDto,
    AssetsCollectionsResponseDto,
    AssetsListResponseDto,
    AssetsMetadataListResponseDto,
    AssetsTypesResponseDto,
} from '../dto/assets.responses.dto';
import {
    AssetDetailsPayloadDto,
    AssetMetadataHistoryQueryPayloadDto,
    AssetsListRequestDto,
} from '../dto/assets.requests.dto';
import {
    AssetOperationsListAssetRequestDto,
    AssetOperationsListRequestDto,
} from '../../operations/dto/operations.request.dto';
import { OperationsListResponseDto } from '../../operations/dto/operations.responses.dto';

@ApiTags('Assets')
@ApiResponse({
    status: '4XX',
    type: IAppErrorDto,
})
@ApiResponse({
    status: '5XX',
    type: IAppErrorDto,
})
@ApiBearerAuth()
@Controller('assets')
export class AssetsController {
    constructor(
        private readonly assetsRequestsService: AssetsRequestsService,
    ) {}

    @ApiOkResponse({
        type: AssetsCollectionsResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get('collections')
    async assetsCollections(): Promise<AssetsCollectionsResponseDto> {
        return await this.assetsRequestsService.assetsCollections();
    }

    @ApiOkResponse({
        type: AssetsTypesResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get('collections/:collection/assets-types')
    async assetsTypes(
        @Param('collection') collection: string,
    ): Promise<AssetsTypesResponseDto> {
        return await this.assetsRequestsService.assetsTypes(collection);
    }

    @ApiOkResponse({
        type: AssetsListResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get('')
    async assetsList(
        @Query() payload: AssetsListRequestDto,
    ): Promise<AssetsListResponseDto> {
        return await this.assetsRequestsService.assetsList(payload);
    }

    @ApiOkResponse({
        type: AssetDetailsResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get(':asset_id')
    async assetDetails(
        @Param() payload: AssetDetailsPayloadDto,
    ): Promise<AssetDetailsResponseDto> {
        return await this.assetsRequestsService.assetDetails(payload);
    }

    @ApiOkResponse({
        type: AssetsMetadataListResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get(':asset_id/metadata-history')
    async assetMetadataHistory(
        @Param() assetPayload: AssetDetailsPayloadDto,
        @Query() historyPayload: AssetMetadataHistoryQueryPayloadDto,
    ): Promise<AssetsMetadataListResponseDto> {
        return await this.assetsRequestsService.assetMetadataHistory(
            assetPayload,
            historyPayload,
        );
    }

    @ApiOkResponse({
        type: OperationsListResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get(':asset_id/operations')
    async assetOperationsHistory(
        @Param() assetPayload: AssetOperationsListAssetRequestDto,
        @Query() historyPayload: AssetOperationsListRequestDto,
    ): Promise<OperationsListResponseDto> {
        return await this.assetsRequestsService.assetOperationHistory(
            assetPayload,
            historyPayload,
        );
    }
}
