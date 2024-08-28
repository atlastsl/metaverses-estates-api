import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OperationsUtilsService } from './operations.utils.service';
import {
    buildReturnDict,
    Collections_DICT,
} from '../../assets/entities/assets.dicts';
import {
    OperationDetailsResponseDto,
    OperationsCollectionsResponseDto,
    OperationsListResponseDto,
    OperationsTypesResponseDto,
    TransactionsTypesResponseDto,
} from '../dto/operations.responses.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Operation } from '../entities/operation.schema';
import { DATABASE_CONNECTION_METAVERSES } from '../../../main/databases/databases';
import { Model } from 'mongoose';
import {
    OperationsTypes_DICT,
    TransactionsTypes_DICT,
} from '../entities/operations.dict';
import {
    AssetOperationDetailsRequestDto,
    OperationsListRequestDto,
} from '../dto/operations.request.dto';
import { AssetsMetadataUtilsService } from '../../assets/providers/assetsmetadata.utils.service';
import { AssetsUtilsService } from '../../assets/providers/assets.utils.service';
import { PaginationResponseDto } from '../../../main/apiutils/pagination';

@Injectable()
export class OperationsRequestService {
    constructor(
        @InjectModel(Operation.name, DATABASE_CONNECTION_METAVERSES)
        private readonly operationsModel: Model<Operation>,
        @Inject(forwardRef(() => OperationsUtilsService))
        private readonly operationsUtilsService: OperationsUtilsService,
        @Inject(forwardRef(() => AssetsUtilsService))
        private readonly assetsUtilsService: AssetsUtilsService,
        @Inject(forwardRef(() => AssetsMetadataUtilsService))
        private readonly assetsMetadataUtilsService: AssetsMetadataUtilsService,
    ) {}

    async operationsCollections(): Promise<OperationsCollectionsResponseDto> {
        const collections = await this.operationsModel
            .distinct('collection')
            .exec();
        return {
            collections: buildReturnDict(
                collections as string[],
                Collections_DICT,
            ),
        };
    }

    async operationsTypes(
        collection: string,
    ): Promise<OperationsTypesResponseDto> {
        const operationsTypes = await this.operationsModel
            .distinct('operation_type', { collection: collection })
            .exec();
        return {
            operations_types: buildReturnDict(
                operationsTypes as string[],
                OperationsTypes_DICT,
            ),
        };
    }

    async transactionsTypes(
        collection: string,
    ): Promise<TransactionsTypesResponseDto> {
        const transactionsTypes = await this.operationsModel
            .distinct('transaction_type', { collection: collection })
            .exec();
        return {
            transactions_types: buildReturnDict(
                transactionsTypes as string[],
                TransactionsTypes_DICT,
            ),
        };
    }

    async operationsHistory(
        payload: OperationsListRequestDto,
    ): Promise<OperationsListResponseDto> {
        const { total, operations } =
            await this.operationsUtilsService.getOperationsHistory(
                payload.sort,
                payload.page,
                payload.take,
                payload.operation_type,
                payload.transaction_type,
                payload.collection,
                payload.search,
            );
        return {
            pagination: PaginationResponseDto.responseDto(payload, total),
            operations,
        };
    }

    async operationDetails(
        payload: AssetOperationDetailsRequestDto,
    ): Promise<OperationDetailsResponseDto> {
        const operation = await this.operationsUtilsService.getOperationDetails(
            payload.operation_id,
        );
        const metadataChangePayload =
            await this.operationsUtilsService.getOperationDate(
                payload.operation_id,
            );
        console.log(JSON.stringify(metadataChangePayload));
        const evolutions =
            await this.assetsMetadataUtilsService.getAssetMetadataEvolution({
                payload: metadataChangePayload,
            });
        const asset = await this.assetsUtilsService.assetDetails(
            metadataChangePayload.asset.toString(),
        );
        return {
            operation,
            asset,
            metadataListEvolutions: evolutions,
        };
    }
}
