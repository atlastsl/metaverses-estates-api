import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Operation } from '../entities/operation.schema';
import { DATABASE_CONNECTION_METAVERSES } from '../../../main/databases/databases';
import mongoose, { Model } from 'mongoose';
import { AssetSortEnum } from '../../assets/dto/assets.requests.dto';
import {
    AssetOperationDetailsRequestDto,
    AssetOperationsListAssetRequestDto,
    AssetOperationsListRequestDto,
    OperationsListRequestDto,
    OperationSortEnum,
} from '../dto/operations.request.dto';

@Injectable()
export class OperationsUtilsService {
    constructor(
        @InjectModel(Operation.name, DATABASE_CONNECTION_METAVERSES)
        private readonly operationsModel: Model<Operation>,
    ) {}

    private normalizeAssetsFilterPayload(
        filterPayload: any,
        prefix: string,
    ): any {
        if (!filterPayload) {
            return {};
        }
        if (filterPayload instanceof Array) {
            return filterPayload.map((item: any) => {
                return this.normalizeAssetsFilterPayload(item, prefix);
            });
        }
        return Object.keys(filterPayload)
            .map((key) => {
                if (filterPayload.hasOwnProperty(key)) {
                    if (
                        typeof filterPayload[key] === 'object' &&
                        key.startsWith('$')
                    ) {
                        return {
                            [key]: this.normalizeAssetsFilterPayload(
                                filterPayload[key],
                                prefix,
                            ),
                        };
                    } else {
                        return { [`${prefix}.${key}`]: filterPayload[key] };
                    }
                }
            })
            .reduce((a, b) => ({ ...a, ...b }), {});
    }

    async listAssetsOperationsDates(
        filterPayload: any,
        sort: AssetSortEnum,
        page: number,
        take: number,
    ): Promise<any[]> {
        let pipeline: any[] = [
            {
                $lookup: {
                    from: 'assets',
                    localField: 'asset',
                    foreignField: '_id',
                    as: 'assetDoc',
                },
            },
        ];
        if (Object.keys(filterPayload).length > 0) {
            const nFilterPayload = this.normalizeAssetsFilterPayload(
                filterPayload,
                'assetDoc',
            );
            const matchPipeline = [
                {
                    $match: nFilterPayload,
                },
            ];
            pipeline = pipeline.concat(matchPipeline);
        }
        const endPipeline: any[] = [
            {
                $project: {
                    asset: 1,
                    mvt_date: 1,
                },
            },
            {
                $group: {
                    _id: '$asset',
                    created_at: { $min: '$mvt_date' },
                    updated_at: { $max: '$mvt_date' },
                },
            },
            {
                $project: {
                    asset: '$_id',
                    created_at: 1,
                    updated_at: 1,
                },
            },
            {
                $sort: {
                    [`${sort === AssetSortEnum.CreatedAt ? 'created_at' : 'updated_at'}`]:
                        sort === AssetSortEnum.CreatedAt ? 1 : -1,
                },
            },
            {
                $skip: (page - 1) * take,
            },
            {
                $limit: take,
            },
        ];
        pipeline = pipeline.concat(endPipeline);
        console.log(JSON.stringify(pipeline, null, 2));
        return await this.operationsModel.aggregate(pipeline).exec();
    }

    async getAssetsOperationsDates(
        assetsIds: mongoose.Types.ObjectId[],
    ): Promise<any[]> {
        return this.operationsModel
            .aggregate([
                {
                    $match: { asset: { $in: assetsIds } },
                },
                {
                    $project: {
                        asset: 1,
                        mvt_date: 1,
                    },
                },
                {
                    $group: {
                        _id: '$asset',
                        created_at: { $min: '$mvt_date' },
                        updated_at: { $max: '$mvt_date' },
                    },
                },
                {
                    $project: {
                        asset: '$_id',
                        created_at: 1,
                        updated_at: 1,
                    },
                },
            ])
            .exec();
    }

    private async listOperations(
        filterPayload: any,
        sort: OperationSortEnum,
        page: number,
        take: number,
    ): Promise<{ total: number; operations: Operation[] }> {
        const total = await this.operationsModel
            .countDocuments(filterPayload)
            .exec();
        const operations = await this.operationsModel
            .find(filterPayload)
            .sort({
                mvt_date: sort === OperationSortEnum.DateDesc ? -1 : 1,
            })
            .skip((page - 1) * take)
            .limit(take)
            .exec();
        return { total, operations };
    }

    async getAssetOperationsHistory(
        assetPayload: AssetOperationsListAssetRequestDto,
        queryPayload: AssetOperationsListRequestDto,
    ): Promise<{ total: number; operations: Operation[] }> {
        const assetId = new mongoose.Types.ObjectId(assetPayload.asset_id);
        const filterPayload: any = { asset: assetId };
        if (queryPayload.operation_type) {
            filterPayload.operation_type = queryPayload.operation_type;
        }
        if (queryPayload.transaction_type) {
            filterPayload.transaction_type = queryPayload.transaction_type;
        }
        return this.listOperations(
            filterPayload,
            queryPayload.sort,
            queryPayload.page,
            queryPayload.take,
        );
    }

    async getOperationsHistory(
        payload: OperationsListRequestDto,
    ): Promise<{ total: number; operations: Operation[] }> {
        let filterPayload: any = {};
        if (payload.operation_type) {
            filterPayload.operation_type = payload.operation_type;
        }
        if (payload.transaction_type) {
            filterPayload.transaction_type = payload.transaction_type;
        }
        if (payload.collection) {
            filterPayload.collection = payload.collection;
        }
        if (payload.search) {
            filterPayload = {
                ...filterPayload,
                $or: [
                    { sender: RegExp(payload.search, 'i') },
                    { recipient: RegExp(payload.search, 'i') },
                    { asset_contract: RegExp(payload.search, 'i') },
                    { asset_id: RegExp(payload.search, 'i') },
                ],
            };
        }
        return this.listOperations(
            filterPayload,
            payload.sort,
            payload.page,
            payload.take,
        );
    }

    async getOperationDetails(
        operationPayload: AssetOperationDetailsRequestDto,
    ): Promise<Operation> {
        const operationId = new mongoose.Types.ObjectId(
            operationPayload.operation_id,
        );
        return await this.operationsModel.findOne({ _id: operationId }).exec();
    }

    async getOperationDate(
        operationPayload: AssetOperationDetailsRequestDto,
    ): Promise<{ asset: mongoose.Types.ObjectId; date: Date } | null> {
        const operationId = new mongoose.Types.ObjectId(
            operationPayload.operation_id,
        );
        const operation = await this.operationsModel
            .findOne({ _id: operationId })
            .select('_id asset mvt_date date')
            .exec();
        return operation != null
            ? { asset: operation.asset, date: operation.mvt_date }
            : null;
    }
}
