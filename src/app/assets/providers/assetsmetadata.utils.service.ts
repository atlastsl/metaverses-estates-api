import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    AssetMetadata,
    AssetMetadataCategoryEnum,
    AssetMetadataMacroTypeEnum,
} from '../entities/assetmetadata.schema';
import { DATABASE_CONNECTION_METAVERSES } from '../../../main/databases/databases';
import mongoose, { Model } from 'mongoose';
import { MapMacro } from '../entities/mapmacro.schema';
import { AssetMetadataResponseDto } from '../dto/assets.responses.dto';
import { AssetMetadataSortEnum } from '../dto/assets.requests.dto';

@Injectable()
export class AssetsMetadataUtilsService {
    constructor(
        @InjectModel(AssetMetadata.name, DATABASE_CONNECTION_METAVERSES)
        private readonly assetsMetadataModel: Model<AssetMetadata>,
        @InjectModel(MapMacro.name, DATABASE_CONNECTION_METAVERSES)
        private readonly mapMacroModel: Model<MapMacro>,
    ) {}

    private sortMetadataList(
        metadataList: { asset: string; metadata: AssetMetadataResponseDto }[],
    ): void {
        metadataList.sort((a, b) => {
            return a.metadata.sortNumber() < b.metadata.sortNumber() ? -1 : 1;
        });
    }

    private async findMetadata(
        pipeline: any[],
        forAssetsList: boolean,
    ): Promise<{ asset: string; metadata: AssetMetadataResponseDto }[]> {
        const lastMetadata = await this.assetsMetadataModel
            .aggregate(pipeline)
            .exec();
        const metadataList: {
            asset: string;
            metadata: AssetMetadataResponseDto;
        }[] = [];
        for (const mtdLastItem of lastMetadata) {
            const lastMetadataRaw = await this.assetsMetadataModel
                .findOne({
                    asset: mtdLastItem._id.asset,
                    category: mtdLastItem._id.category,
                    macro_type: mtdLastItem._id.macro_type,
                    date: mtdLastItem.lastDate,
                })
                .populate('macro', '_id name slug')
                .exec();
            const lastMetadataParsed =
                AssetMetadataResponseDto.parseAssetMetadata(
                    lastMetadataRaw,
                    forAssetsList,
                );
            metadataList.push({
                asset: mtdLastItem._id.asset.toString(),
                metadata: lastMetadataParsed,
            });
        }
        this.sortMetadataList(metadataList);
        return metadataList;
    }

    async getAssetCurrentMetadata(
        assetIds: mongoose.Types.ObjectId[],
        forAssetsList: boolean = false,
    ): Promise<{ asset: string; metadata: AssetMetadataResponseDto }[]> {
        const pipeline = [
            {
                $match: { asset: assetIds[0] },
            },
            {
                $group: {
                    _id: {
                        asset: '$asset',
                        category: '$category',
                        macro_type: '$macro_type',
                    },
                    lastDate: { $max: '$date' },
                },
            },
        ];
        return await this.findMetadata(pipeline, forAssetsList);
    }

    async getAssetMetadataHistory(
        asset_id: string,
        sort: AssetMetadataSortEnum,
        page: number,
        take: number,
        metadata_category: AssetMetadataCategoryEnum,
        metadata_macro_type?: AssetMetadataMacroTypeEnum,
    ): Promise<{ total: number; metadataList: AssetMetadataResponseDto[] }> {
        const assetId = new mongoose.Types.ObjectId(asset_id);
        const filterPayload = {
            asset: assetId,
            category: metadata_category,
            macro_type: metadata_macro_type,
        };
        const total = await this.assetsMetadataModel
            .countDocuments(filterPayload)
            .exec();
        const metadataHistory = await this.assetsMetadataModel
            .find(filterPayload)
            .populate('macro', '_id name slug')
            .sort({
                date: sort === AssetMetadataSortEnum.DateDesc ? -1 : 1,
            })
            .skip((page - 1) * take)
            .limit(take)
            .exec();
        const metadataList: AssetMetadataResponseDto[] = [];
        for (const metadataItem of metadataHistory) {
            const metadataParsed = AssetMetadataResponseDto.parseAssetMetadata(
                metadataItem,
                false,
            );
            metadataList.push(metadataParsed);
        }
        return { total, metadataList };
    }

    async getAssetMetadataEvolution({
        payload,
    }: {
        payload: { asset: mongoose.Types.ObjectId; date: Date };
    }): Promise<AssetMetadataResponseDto[][]> {
        const previousMetadataPayload = [
            {
                $match: {
                    asset: payload.asset,
                    $or: [{ date: null }, { date: { $lt: payload.date } }],
                },
            },
            {
                $group: {
                    _id: {
                        asset: '$asset',
                        category: '$category',
                        macro_type: '$macro_type',
                    },
                    lastDate: { $max: '$date' },
                },
            },
        ];
        const previousMetadataList = await this.findMetadata(
            previousMetadataPayload,
            false,
        );
        const actualMetadataPayload = [
            {
                $match: {
                    asset: payload.asset,
                    $or: [{ date: null }, { date: { $gte: payload.date } }],
                },
            },
            {
                $group: {
                    _id: {
                        asset: '$asset',
                        category: '$category',
                        macro_type: '$macro_type',
                    },
                    lastDate: { $min: '$date' },
                },
            },
        ];
        const actualMetadataList = await this.findMetadata(
            actualMetadataPayload,
            false,
        );
        const metadataListEvolutions: AssetMetadataResponseDto[][] = [];
        for (const previousMetadataElement of previousMetadataList) {
            const actualRelatedMetadataElement = actualMetadataList.find(
                (x) => {
                    return (
                        x.asset === previousMetadataElement.asset &&
                        x.metadata.category ===
                            previousMetadataElement.metadata.category &&
                        x.metadata.macro_type ===
                            previousMetadataElement.metadata.macro_type
                    );
                },
            );
            const metadataElementEvolution: AssetMetadataResponseDto[] = [
                previousMetadataElement.metadata,
            ];
            if (
                actualRelatedMetadataElement &&
                actualRelatedMetadataElement.metadata.value !==
                    previousMetadataElement.metadata.value
            ) {
                metadataElementEvolution.push(
                    actualRelatedMetadataElement.metadata,
                );
            }
            metadataListEvolutions.push(metadataElementEvolution);
        }
        return metadataListEvolutions;
    }
}
