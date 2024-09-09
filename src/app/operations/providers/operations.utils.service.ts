import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    Operation,
    OperationType,
    TransactionType,
} from '../entities/operation.schema';
import { DATABASE_CONNECTION_METAVERSES } from '../../../main/databases/databases';
import mongoose, { Model } from 'mongoose';
import { AssetSortEnum } from '../../assets/dto/assets.requests.dto';
import { OperationSortEnum } from '../dto/operations.request.dto';

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
        operationsFilterPayload: any,
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
                    $match: { ...nFilterPayload, ...operationsFilterPayload },
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
        operationsFilterPayload: any,
    ): Promise<any[]> {
        return this.operationsModel
            .aggregate([
                {
                    $match: {
                        asset: { $in: assetsIds },
                        ...operationsFilterPayload,
                    },
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
        asset_id: string,
        sort: OperationSortEnum,
        page: number,
        take: number,
        operation_type?: OperationType,
        transaction_type?: TransactionType,
    ): Promise<{ total: number; operations: Operation[] }> {
        const assetId = new mongoose.Types.ObjectId(asset_id);
        const filterPayload: any = { asset: assetId };
        if (operation_type) {
            filterPayload.operation_type = operation_type;
        }
        if (transaction_type) {
            filterPayload.transaction_type = transaction_type;
        }
        return this.listOperations(filterPayload, sort, page, take);
    }

    async getOperationsHistory(
        sort: OperationSortEnum,
        page: number,
        take: number,
        operation_type?: OperationType,
        transaction_type?: TransactionType,
        collection?: string,
        search?: string,
        date_max?: string,
        date_min?: string,
    ): Promise<{ total: number; operations: Operation[] }> {
        let filterPayload: any = {};
        if (operation_type) {
            filterPayload.operation_type = operation_type;
        }
        if (transaction_type) {
            filterPayload.transaction_type = transaction_type;
        }
        if (collection) {
            filterPayload.collection = collection;
        }
        if (date_max) {
            if (!filterPayload.max_date) {
                filterPayload.max_date = {};
            }
            const uam = new Date(date_max);
            uam.setUTCDate(uam.getUTCDate() + 1);
            filterPayload.mvt_date['$lt'] = uam;
        }
        if (date_min) {
            if (!filterPayload.mvt_date) {
                filterPayload.mvt_date = {};
            }
            filterPayload.mvt_date['$gte'] = new Date(date_min);
        }
        if (search) {
            filterPayload = {
                ...filterPayload,
                $or: [
                    { sender: RegExp(search, 'i') },
                    { recipient: RegExp(search, 'i') },
                    { asset_contract: RegExp(search, 'i') },
                    { asset_id: RegExp(search, 'i') },
                ],
            };
        }
        return this.listOperations(filterPayload, sort, page, take);
    }

    async getOperationDetails(_operationId: string): Promise<Operation> {
        const operationId = new mongoose.Types.ObjectId(_operationId);
        return await this.operationsModel.findOne({ _id: operationId }).exec();
    }

    async getOperationDate(
        _operationId: string,
    ): Promise<{ asset: mongoose.Types.ObjectId; date: Date } | null> {
        const operationId = new mongoose.Types.ObjectId(_operationId);
        const operation = await this.operationsModel
            .findOne({ _id: operationId })
            .select('_id asset mvt_date date')
            .exec();
        return operation != null
            ? { asset: operation.asset, date: operation.mvt_date }
            : null;
    }

    async stakeHolderOperations(
        address: string,
        sort: OperationSortEnum = OperationSortEnum.DateDesc,
        page: number,
        take: number,
        operation_type?: OperationType,
        transaction_type?: TransactionType,
        collection?: string,
    ): Promise<{ total: number; operations: Operation[] }> {
        const filterPayload: any = {
            $or: [{ sender: address }, { recipient: address }],
        };
        if (operation_type) {
            filterPayload.operation_type = operation_type;
        }
        if (transaction_type) {
            filterPayload.transaction_type = transaction_type;
        }
        if (collection) {
            filterPayload.collection = collection;
        }
        return this.listOperations(filterPayload, sort, page, take);
    }
}
