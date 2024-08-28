import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Asset } from '../entities/asset.schema';
import { DATABASE_CONNECTION_METAVERSES } from '../../../main/databases/databases';
import { Model } from 'mongoose';
import {
    AssetsTypes_DICT,
    buildReturnDict,
    Collections_DICT,
} from '../entities/assets.dicts';
import {
    AssetDetailsPayloadDto,
    AssetMetadataHistoryQueryPayloadDto,
    AssetsListRequestDto,
} from '../dto/assets.requests.dto';
import {
    AssetDetailsResponseDto,
    AssetsCollectionsResponseDto,
    AssetsListResponseDto,
    AssetsMetadataListResponseDto,
    AssetsTypesResponseDto,
} from '../dto/assets.responses.dto';
import {
    AssetOperationsListAssetRequestDto,
    AssetOperationsListRequestDto,
} from '../../operations/dto/operations.request.dto';
import { OperationsListResponseDto } from '../../operations/dto/operations.responses.dto';
import { AssetsUtilsService } from './assets.utils.service';
import { AssetsMetadataUtilsService } from './assetsmetadata.utils.service';
import { OperationsUtilsService } from '../../operations/providers/operations.utils.service';
import { PaginationResponseDto } from '../../../main/apiutils/pagination';

@Injectable()
export class AssetsRequestsService {
    constructor(
        @InjectModel(Asset.name, DATABASE_CONNECTION_METAVERSES)
        private readonly assetsModel: Model<Asset>,
        private readonly assetsMetadataUtilsService: AssetsMetadataUtilsService,
        private readonly assetsUtilsService: AssetsUtilsService,
        @Inject(forwardRef(() => OperationsUtilsService))
        private readonly operationsUtilsService: OperationsUtilsService,
    ) {}

    async assetsCollections(): Promise<AssetsCollectionsResponseDto> {
        const collections = await this.assetsModel
            .distinct('collection')
            .exec();
        return {
            collections: buildReturnDict(
                collections as string[],
                Collections_DICT,
            ),
        };
    }

    async assetsTypes(collection: string): Promise<AssetsTypesResponseDto> {
        const assetsTypes = await this.assetsModel
            .distinct('type', { collection: collection })
            .exec();
        return {
            assets_types: buildReturnDict(
                assetsTypes as string[],
                AssetsTypes_DICT,
            ),
        };
    }

    async assetsList(
        payload: AssetsListRequestDto,
    ): Promise<AssetsListResponseDto> {
        const { total, assets } = await this.assetsUtilsService.assetsList(
            payload.sort,
            payload.page,
            payload.take,
            payload.collection,
            payload.type,
            payload.search,
        );
        return {
            pagination: PaginationResponseDto.responseDto(payload, total),
            assets,
        };
    }

    async assetDetails(
        assetPayload: AssetDetailsPayloadDto,
    ): Promise<AssetDetailsResponseDto> {
        const asset = await this.assetsUtilsService.assetDetails(
            assetPayload.asset_id,
        );
        return {
            asset,
        };
    }

    async assetMetadataHistory(
        params: AssetDetailsPayloadDto,
        query: AssetMetadataHistoryQueryPayloadDto,
    ): Promise<AssetsMetadataListResponseDto> {
        const { total, metadataList } =
            await this.assetsMetadataUtilsService.getAssetMetadataHistory(
                params.asset_id,
                query.sort,
                query.page,
                query.take,
                query.metadata_category,
                query.metadata_macro_type,
            );
        return {
            pagination: PaginationResponseDto.responseDto(query, total),
            metadata_list: metadataList,
        };
    }

    async assetOperationHistory(
        asset: AssetOperationsListAssetRequestDto,
        query: AssetOperationsListRequestDto,
    ): Promise<OperationsListResponseDto> {
        const { total, operations } =
            await this.operationsUtilsService.getAssetOperationsHistory(
                asset.asset_id,
                query.sort,
                query.page,
                query.take,
                query.operation_type,
                query.transaction_type,
            );
        return {
            pagination: PaginationResponseDto.responseDto(query, total),
            operations,
        };
    }
}
