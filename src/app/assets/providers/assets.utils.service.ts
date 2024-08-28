import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Asset } from '../entities/asset.schema';
import { DATABASE_CONNECTION_METAVERSES } from '../../../main/databases/databases';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import {
    AssetDetailsPayloadDto,
    AssetsListRequestDto,
    AssetSortEnum,
} from '../dto/assets.requests.dto';
import {
    AssetMetadataResponseDto,
    AssetResponseDto,
} from '../dto/assets.responses.dto';
import { OperationsUtilsService } from '../../operations/providers/operations.utils.service';
import { AssetsMetadataUtilsService } from './assetsmetadata.utils.service';
import { StringsHelperService } from '../../../helpers/services/strings.helper.service';

@Injectable()
export class AssetsUtilsService {
    constructor(
        @InjectModel(Asset.name, DATABASE_CONNECTION_METAVERSES)
        private readonly assetsModel: Model<Asset>,
        private readonly operationsUtilsService: OperationsUtilsService,
        private readonly assetsMetadataUtilsService: AssetsMetadataUtilsService,
        private readonly stringsHelperService: StringsHelperService,
    ) {}

    async assetsList(
        payload: AssetsListRequestDto,
    ): Promise<{ total: number; assets: AssetResponseDto[] }> {
        let filterPayload: any = {};
        if (!this.stringsHelperService.isStrEmpty(payload.collection)) {
            filterPayload.collection = payload.collection;
        }
        if (payload.type) {
            filterPayload.type = payload.type;
        }
        if (!this.stringsHelperService.isStrEmpty(payload.search)) {
            const coordsRegex = /^(-?\d+),(-?\d+)$/;
            const coordsRegexMatch = payload.search.match(coordsRegex);
            if (coordsRegexMatch) {
                const c1 = parseInt(coordsRegexMatch[1], 10);
                const c2 = parseInt(coordsRegexMatch[2], 10);
                filterPayload = {
                    ...filterPayload,
                    $or: [
                        { x: c1, y: c2 },
                        { x: c2, y: c1 },
                    ],
                };
            } else {
                const reg = RegExp(
                    this.stringsHelperService.trimToEmpty(payload.search),
                    'i',
                );
                filterPayload = {
                    ...filterPayload,
                    $or: [
                        {
                            name: reg,
                        },
                        {
                            asset_id: reg,
                        },
                        {
                            contract: reg,
                        },
                    ],
                };
            }
        }
        const total = await this.assetsModel
            .countDocuments(filterPayload)
            .exec();
        let rawAssets: HydratedDocument<any>[] = [];
        let assetsOperationsDates: any[] = [];
        let assetsMetadataAllList: {
            asset: string;
            metadata: AssetMetadataResponseDto;
        }[] = [];

        if (payload.sort == AssetSortEnum.Name) {
            rawAssets = await this.assetsModel
                .find(filterPayload)
                .skip((payload.page - 1) * payload.take)
                .limit(payload.take)
                .exec();
            const assetsIds = rawAssets.map(
                (x) => x._id as mongoose.Types.ObjectId,
            );
            assetsOperationsDates =
                await this.operationsUtilsService.getAssetsOperationsDates(
                    assetsIds,
                );
            assetsMetadataAllList =
                await this.assetsMetadataUtilsService.getAssetCurrentMetadata(
                    assetsIds,
                    true,
                );
        } else {
            assetsOperationsDates =
                await this.operationsUtilsService.listAssetsOperationsDates(
                    filterPayload,
                    payload.sort,
                    payload.page,
                    payload.take,
                );
            const assetsIds = assetsOperationsDates.map(
                (x) => x.asset as mongoose.Types.ObjectId,
            );
            rawAssets = await this.assetsModel
                .find({ _id: { $in: assetsIds } })
                .exec();
            assetsMetadataAllList =
                await this.assetsMetadataUtilsService.getAssetCurrentMetadata(
                    assetsIds,
                    true,
                );
        }

        const assets: AssetResponseDto[] = [];
        for (const rawAsset of rawAssets) {
            const assetOperationsDates = assetsOperationsDates.find(
                (x) => x.asset.toString() === rawAsset._id.toString(),
            );
            const assetMetadataList = assetsMetadataAllList
                .filter((x) => x.asset.toString() === rawAsset._id.toString())
                .map((x) => x.metadata);
            const asset = AssetResponseDto.parseAsset(
                rawAsset,
                assetOperationsDates.created_at
                    ? (assetOperationsDates.created_at as Date)
                    : undefined,
                assetOperationsDates.updated_at
                    ? (assetOperationsDates.updated_at as Date)
                    : undefined,
                assetMetadataList,
            );
            assets.push(asset);
        }

        return { total, assets };
    }

    async assetDetails(
        assetPayload: AssetDetailsPayloadDto,
    ): Promise<AssetResponseDto> {
        const assetId = new mongoose.Types.ObjectId(assetPayload.asset_id);
        const rawAsset = await this.assetsModel
            .findOne({
                _id: assetId,
            })
            .exec();
        const assetOperationsDates =
            await this.operationsUtilsService.getAssetsOperationsDates([
                assetId,
            ]);
        const assetMetadataList =
            await this.assetsMetadataUtilsService.getAssetCurrentMetadata(
                [assetId],
                false,
            );
        return AssetResponseDto.parseAsset(
            rawAsset,
            assetOperationsDates?.[0]?.created_at
                ? (assetOperationsDates?.[0]?.created_at as Date)
                : undefined,
            assetOperationsDates?.[0]?.updated_at
                ? (assetOperationsDates?.[0]?.updated_at as Date)
                : undefined,
            assetMetadataList.map((x) => x.metadata),
        );
    }
}
