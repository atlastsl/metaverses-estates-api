import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Operation } from '../../operations/entities/operation.schema';
import { DATABASE_CONNECTION_METAVERSES } from '../../../main/databases/databases';
import { Model } from 'mongoose';
import { StringsHelperService } from '../../../helpers/services/strings.helper.service';
import { StakeholdersSortEnum } from '../dto/stakeholders.requests.dto';
import { StakeholderDto } from '../dto/stakeholders.responses.dto';

@Injectable()
export class StakeholdersUtilsService {
    constructor(
        @InjectModel(Operation.name, DATABASE_CONNECTION_METAVERSES)
        private readonly operationsModel: Model<Operation>,
        private readonly stringsHelperService: StringsHelperService,
    ) {}

    async listStakeholders(
        sort: StakeholdersSortEnum,
        page: number,
        take: number,
        collection?: string,
        search?: string,
    ): Promise<{ total: number; stakeholders: StakeholderDto[] }> {
        let filterPayload: any = {};
        if (collection) {
            filterPayload.collection = collection;
        }
        if (!this.stringsHelperService.isStrEmpty(search)) {
            const reg = new RegExp(
                this.stringsHelperService.trimToEmpty(search),
                'i',
            );
            filterPayload = {
                ...filterPayload,
                $or: [
                    { sender: reg },
                    { recipient: reg },
                    { asset_contract: reg },
                    { asset_id: reg },
                ],
            };
        }
        let pipeline: any[] = [];
        if (Object.keys(filterPayload).length > 0) {
            const matchPipeline: any[] = [
                {
                    match: filterPayload,
                },
            ];
            pipeline = pipeline.concat(matchPipeline);
        }
        const sortPayload: any = {};
        if (sort === StakeholdersSortEnum.DateAsc) {
            sortPayload['first_operation_date'] = 1;
        } else if (sort === StakeholdersSortEnum.NbTxAsc) {
            sortPayload['nb_operations'] = 1;
        } else if (sort === StakeholdersSortEnum.NbTxDesc) {
            sortPayload['nb_operations'] = -1;
        } else {
            sortPayload['last_operation_date'] = -1;
        }
        pipeline = pipeline.concat([
            {
                $project: {
                    stakeholder: { $setUnion: [['$sender'], ['$recipient']] },
                    mvt_date: 1,
                },
            },
            {
                $unwind: {
                    path: '$stakeholder',
                    includeArrayIndex: 'index',
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $group: {
                    _id: '$stakeholder',
                    last_operation_date: {
                        $max: '$mvt_date',
                    },
                    first_operation_date: {
                        $min: '$mvt_date',
                    },
                    collections: {
                        $addToSet: '$collection',
                    },
                    nb_operations: {
                        $sum: 1,
                    },
                },
            },
        ]);
        const countPipeline = pipeline.concat([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                },
            },
        ]);
        const dataPipeline = pipeline.concat([
            {
                $sort: sortPayload,
            },
            {
                $skip: (page - 1) * take,
            },
            {
                $limit: take,
            },
        ]);
        const totalResults: any[] = await this.operationsModel
            .aggregate(countPipeline)
            .exec();
        const dataResults: any[] = await this.operationsModel
            .aggregate(dataPipeline)
            .exec();
        const total = totalResults[0]?.total || 0;
        const stakeholders: StakeholderDto[] = [];
        for (const dataResult of dataResults) {
            const stakeholder: StakeholderDto = new StakeholderDto();
            stakeholder.collections = dataResult.collections;
            stakeholder.address = dataResult._id;
            stakeholder.first_operation_date = dataResult.first_operation_date;
            stakeholder.last_operation_date = dataResult.last_operation_date;
            stakeholder.nb_operations = dataResult.nb_operations;
            stakeholders.push(stakeholder);
        }
        return { total, stakeholders };
    }

    async detailsStakeHolders(
        address?: string,
        collection?: string,
    ): Promise<StakeholderDto | null> {
        const matchPayload: any = {
            $or: [{ sender: address }, { recipient: address }],
        };
        if (collection) {
            matchPayload.collection = collection;
        }
        const pipeline: any[] = [
            {
                $match: matchPayload,
            },
            {
                $group: {
                    _id: null,
                    last_operation_date: {
                        $max: '$mvt_date',
                    },
                    first_operation_date: {
                        $min: '$mvt_date',
                    },
                    collections: {
                        $addToSet: '$collection',
                    },
                    nb_operations: {
                        $sum: 1,
                    },
                },
            },
        ];
        const dataResults: any[] = await this.operationsModel
            .aggregate(pipeline)
            .exec();
        if (dataResults.length > 0) {
            const dataResult = dataResults[0];
            const stakeholder: StakeholderDto = new StakeholderDto();
            stakeholder.collections = dataResult.collections;
            stakeholder.address = address;
            stakeholder.first_operation_date = dataResult.first_operation_date;
            stakeholder.last_operation_date = dataResult.last_operation_date;
            stakeholder.nb_operations = dataResult.nb_operations;
            return stakeholder;
        }
        return null;
    }
}
