import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Asset, AssetTypeEnum } from '../entities/asset.schema';
import { DATABASE_CONNECTION_METAVERSES } from '../../../main/databases/databases';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { AssetSortEnum } from '../dto/assets.requests.dto';
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
        sort: AssetSortEnum,
        page: number,
        take: number,
        collection?: string,
        type?: AssetTypeEnum,
        search?: string,
        updated_at_max?: string,
        updated_at_min?: string,
    ): Promise<{ total: number; assets: AssetResponseDto[] }> {
        const operationsFilterPayload: any = {};
        if (updated_at_max) {
            if (!operationsFilterPayload.mvt_date) {
                operationsFilterPayload.mvt_date = {};
            }
            const uam = new Date(updated_at_max);
            uam.setUTCDate(uam.getUTCDate() + 1);
            operationsFilterPayload.mvt_date['$lt'] = uam;
        }
        if (updated_at_min) {
            if (!operationsFilterPayload.mvt_date) {
                operationsFilterPayload.mvt_date = {};
            }
            operationsFilterPayload.mvt_date['$gte'] = new Date(updated_at_min);
        }
        let filterPayload: any = {};
        if (collection) {
            filterPayload.collection = collection;
        }
        if (type) {
            filterPayload.type = type;
        }
        if (!this.stringsHelperService.isStrEmpty(search)) {
            const coordsRegex = /^(-?\d+),(-?\d+)$/;
            const coordsRegexMatch = search.match(coordsRegex);
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
                    this.stringsHelperService.trimToEmpty(search),
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
        let total = 0;
        let rawAssets: HydratedDocument<any>[] = [];
        let assetsOperationsDates: any[] = [];
        let assetsMetadataAllList: {
            asset: string;
            metadata: AssetMetadataResponseDto;
        }[] = [];

        if (sort == AssetSortEnum.Name) {
            total = await this.assetsModel.countDocuments(filterPayload).exec();
            rawAssets = await this.assetsModel
                .find(filterPayload)
                .skip((page - 1) * take)
                .limit(take)
                .exec();
            const assetsIds = rawAssets.map(
                (x) => x._id as mongoose.Types.ObjectId,
            );
            assetsOperationsDates =
                await this.operationsUtilsService.getAssetsOperationsDates(
                    assetsIds,
                    operationsFilterPayload,
                );
            /*assetsMetadataAllList =
                await this.assetsMetadataUtilsService.getAssetCurrentMetadata(
                    assetsIds,
                    true,
                );*/
        } else {
            const res =
                await this.operationsUtilsService.listAssetsOperationsDates(
                    filterPayload,
                    operationsFilterPayload,
                    sort,
                    page,
                    take,
                );
            assetsOperationsDates = res.data;
            total = res.total;
            const assetsIds = assetsOperationsDates.map(
                (x) => x.asset as mongoose.Types.ObjectId,
            );
            rawAssets = await this.assetsModel
                .find({ _id: { $in: assetsIds } })
                .exec();
            rawAssets.sort((a, b) => {
                const a_i: number = assetsIds.findIndex(
                    (x) => x.toString() === a._id.toString(),
                );
                const b_i: number = assetsIds.findIndex(
                    (x) => x.toString() === b._id.toString(),
                );
                if (a_i < b_i) return -1;
                if (a_i > b_i) return 1;
                return 0;
            });
            /*assetsMetadataAllList =
                await this.assetsMetadataUtilsService.getAssetCurrentMetadata(
                    assetsIds,
                    true,
                );*/
        }

        const assets: AssetResponseDto[] = [];
        for (const rawAsset of rawAssets) {
            const assetOperationsDates = assetsOperationsDates.find(
                (x) => x.asset.toString() === rawAsset._id.toString(),
            );
            if (assetOperationsDates) {
                const assetMetadataList = assetsMetadataAllList
                    .filter(
                        (x) => x.asset.toString() === rawAsset._id.toString(),
                    )
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
        }

        return { total, assets };
    }

    async assetDetails(asset_id: string): Promise<AssetResponseDto> {
        const assetId = new mongoose.Types.ObjectId(asset_id);
        const rawAsset = await this.assetsModel
            .findOne({
                _id: assetId,
            })
            .exec();
        const assetOperationsDates =
            await this.operationsUtilsService.getAssetsOperationsDates(
                [assetId],
                {},
            );
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
